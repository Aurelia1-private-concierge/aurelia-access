import { useState, useCallback, useRef, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useAIMemory } from "./useAIMemory";
import { usePerplexitySearch } from "./usePerplexitySearch";

export type IQMode = "standard" | "research" | "reasoning" | "creative" | "executive";

export interface ThinkingStep {
  id: string;
  type: "analyzing" | "researching" | "reasoning" | "synthesizing" | "verifying";
  content: string;
  timestamp: Date;
  duration?: number;
  sources?: Array<{ url: string; title?: string }>;
}

export interface IQResponse {
  answer: string;
  confidence: number;
  thinkingSteps: ThinkingStep[];
  sources: Array<{ url: string; title?: string }>;
  reasoning?: string;
  alternatives?: string[];
  followUpQuestions?: string[];
  memoryUpdates?: Array<{ key: string; value: unknown }>;
}

export interface IQContext {
  userPreferences: Record<string, unknown>;
  conversationHistory: Array<{ role: string; content: string }>;
  currentTopic?: string;
  emotionalContext?: {
    userMood: string;
    engagementLevel: number;
  };
  timeContext: {
    localTime: string;
    timezone: string;
    dayOfWeek: string;
  };
}

interface UseOrlaIQOptions {
  defaultMode?: IQMode;
  enableMemory?: boolean;
  enableResearch?: boolean;
  maxThinkingSteps?: number;
}

export const useOrlaIQ = (options: UseOrlaIQOptions = {}) => {
  const { 
    defaultMode = "standard", 
    enableMemory = true, 
    enableResearch = true,
    maxThinkingSteps = 10,
  } = options;

  const { user } = useAuth();
  const { memories, storeMemory, getContextForConversation, extractAndStorePreferences } = useAIMemory();
  const { search: perplexitySearch, isSearching } = usePerplexitySearch();

  const [mode, setMode] = useState<IQMode>(defaultMode);
  const [isThinking, setIsThinking] = useState(false);
  const [currentThinkingSteps, setCurrentThinkingSteps] = useState<ThinkingStep[]>([]);
  const [lastResponse, setLastResponse] = useState<IQResponse | null>(null);
  const [conversationContext, setConversationContext] = useState<IQContext["conversationHistory"]>([]);

  const thinkingStartRef = useRef<Date | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Add a thinking step
  const addThinkingStep = useCallback((
    type: ThinkingStep["type"],
    content: string,
    sources?: ThinkingStep["sources"]
  ) => {
    const step: ThinkingStep = {
      id: `step-${Date.now()}-${Math.random()}`,
      type,
      content,
      timestamp: new Date(),
      sources,
    };

    setCurrentThinkingSteps(prev => {
      if (prev.length >= maxThinkingSteps) {
        return [...prev.slice(1), step];
      }
      return [...prev, step];
    });

    return step;
  }, [maxThinkingSteps]);

  // Build context for the AI
  const buildContext = useCallback(async (): Promise<IQContext> => {
    const now = new Date();
    const memoryContext = await getContextForConversation();
    
    // Handle both array and object return types from memory context
    const preferences = memoryContext && !Array.isArray(memoryContext) 
      ? memoryContext.preferences 
      : {};

    return {
      userPreferences: preferences,
      conversationHistory: conversationContext,
      timeContext: {
        localTime: now.toLocaleTimeString(),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        dayOfWeek: now.toLocaleDateString("en-US", { weekday: "long" }),
      },
    };
  }, [conversationContext, getContextForConversation]);

  // Research mode - use Perplexity for web search
  const performResearch = useCallback(async (query: string): Promise<{
    findings: string;
    sources: Array<{ url: string; title?: string }>;
  }> => {
    if (!enableResearch) {
      return { findings: "", sources: [] };
    }

    addThinkingStep("researching", `Searching for: "${query}"`);

    const result = await perplexitySearch(query, { maxTokens: 2048 });
    
    if (result) {
      addThinkingStep("synthesizing", `Found ${result.citations.length} sources`, result.citations);
      return {
        findings: result.answer,
        sources: result.citations,
      };
    }

    return { findings: "", sources: [] };
  }, [enableResearch, perplexitySearch, addThinkingStep]);

  // Multi-step reasoning
  const performReasoning = useCallback(async (
    query: string,
    context: IQContext
  ): Promise<{ reasoning: string; conclusion: string }> => {
    addThinkingStep("analyzing", "Breaking down the problem...");

    // This would integrate with the AI model for chain-of-thought reasoning
    // For now, we structure the prompt to encourage step-by-step thinking

    const reasoningPrompt = `
      Given the user's question: "${query}"
      
      Context:
      - Time: ${context.timeContext.localTime} (${context.timeContext.dayOfWeek})
      - User preferences: ${JSON.stringify(context.userPreferences)}
      - Conversation so far: ${context.conversationHistory.slice(-5).map(m => `${m.role}: ${m.content}`).join("\n")}
      
      Please reason through this step by step:
      1. What is the user actually asking for?
      2. What information do we have?
      3. What information do we need?
      4. What are the possible approaches?
      5. What is the best recommendation?
    `;

    addThinkingStep("reasoning", "Evaluating options and trade-offs...");

    return {
      reasoning: reasoningPrompt,
      conclusion: "",
    };
  }, [addThinkingStep]);

  // Main process function
  const process = useCallback(async (
    query: string,
    overrideMode?: IQMode
  ): Promise<IQResponse> => {
    const activeMode = overrideMode || mode;
    
    abortControllerRef.current?.abort();
    abortControllerRef.current = new AbortController();

    setIsThinking(true);
    setCurrentThinkingSteps([]);
    thinkingStartRef.current = new Date();

    const context = await buildContext();
    addThinkingStep("analyzing", `Processing query in ${activeMode} mode...`);

    let researchFindings = "";
    let sources: Array<{ url: string; title?: string }> = [];
    let reasoning = "";

    try {
      // Research mode - always search for information
      if (activeMode === "research" || activeMode === "executive") {
        const research = await performResearch(query);
        researchFindings = research.findings;
        sources = research.sources;
      }

      // Reasoning mode - multi-step analysis
      if (activeMode === "reasoning" || activeMode === "executive") {
        const reasoningResult = await performReasoning(query, context);
        reasoning = reasoningResult.reasoning;
      }

      // Build the enhanced prompt
      const systemPrompt = buildSystemPrompt(activeMode, context, researchFindings);

      addThinkingStep("synthesizing", "Formulating response...");

      // Call the AI
      const { data, error } = await supabase.functions.invoke("chat", {
        body: {
          messages: [
            { role: "system", content: systemPrompt },
            ...context.conversationHistory.slice(-10),
            { role: "user", content: query },
          ],
          mode: activeMode,
          includeReasoning: activeMode === "reasoning" || activeMode === "executive",
        },
      });

      if (error) throw error;

      // Parse streaming response
      let answer = "";
      if (data) {
        // Handle streaming or direct response
        answer = typeof data === "string" ? data : data.content || data.answer || "";
      }

      // Extract preferences from the conversation
      if (enableMemory && user) {
        await extractAndStorePreferences(query, "iq-session");
      }

      // Update conversation context
      setConversationContext(prev => [
        ...prev.slice(-20),
        { role: "user", content: query },
        { role: "assistant", content: answer },
      ]);

      const response: IQResponse = {
        answer,
        confidence: sources.length > 0 ? 0.9 : 0.75,
        thinkingSteps: currentThinkingSteps,
        sources,
        reasoning: activeMode === "reasoning" ? reasoning : undefined,
        followUpQuestions: generateFollowUpQuestions(query, answer),
      };

      setLastResponse(response);
      return response;

    } catch (error) {
      console.error("IQ processing error:", error);
      
      const errorResponse: IQResponse = {
        answer: "I apologize, but I encountered an issue while processing your request. Please try again.",
        confidence: 0,
        thinkingSteps: currentThinkingSteps,
        sources: [],
      };
      
      setLastResponse(errorResponse);
      return errorResponse;

    } finally {
      setIsThinking(false);
      
      // Calculate final step duration
      if (thinkingStartRef.current && currentThinkingSteps.length > 0) {
        const duration = Date.now() - thinkingStartRef.current.getTime();
        setCurrentThinkingSteps(prev => 
          prev.map((step, i) => 
            i === prev.length - 1 ? { ...step, duration } : step
          )
        );
      }
    }
  }, [
    mode, 
    buildContext, 
    performResearch, 
    performReasoning, 
    addThinkingStep, 
    enableMemory, 
    user, 
    extractAndStorePreferences,
    currentThinkingSteps,
  ]);

  // Quick question (standard mode, no research)
  const quickAnswer = useCallback(async (query: string) => {
    return process(query, "standard");
  }, [process]);

  // Deep research
  const deepResearch = useCallback(async (query: string) => {
    return process(query, "research");
  }, [process]);

  // Executive brief (research + reasoning)
  const executiveBrief = useCallback(async (query: string) => {
    return process(query, "executive");
  }, [process]);

  // Cancel current processing
  const cancel = useCallback(() => {
    abortControllerRef.current?.abort();
    setIsThinking(false);
  }, []);

  // Clear conversation context
  const clearContext = useCallback(() => {
    setConversationContext([]);
    setCurrentThinkingSteps([]);
    setLastResponse(null);
  }, []);

  return {
    // Core functions
    process,
    quickAnswer,
    deepResearch,
    executiveBrief,
    cancel,
    clearContext,

    // State
    mode,
    setMode,
    isThinking,
    isResearching: isSearching,
    thinkingSteps: currentThinkingSteps,
    lastResponse,

    // Memory integration
    memories,
    conversationContext,
  };
};

// Helper: Build system prompt based on mode
function buildSystemPrompt(
  mode: IQMode,
  context: IQContext,
  researchFindings?: string
): string {
  const basePrompt = `You are Orla, Aurelia's elite AI concierge. You speak with warmth, discretion, and sophistication.
Current time: ${context.timeContext.localTime} (${context.timeContext.dayOfWeek})
User preferences: ${JSON.stringify(context.userPreferences)}`;

  const modePrompts: Record<IQMode, string> = {
    standard: `${basePrompt}
    
Provide helpful, concise responses. Be warm but efficient.`,

    research: `${basePrompt}

You are in RESEARCH MODE. Use the following research findings to inform your response:

${researchFindings || "No external research available."}

Always cite sources when making factual claims. Be thorough but organized.`,

    reasoning: `${basePrompt}

You are in REASONING MODE. Think through problems step by step:
1. Clarify the question
2. Identify key factors
3. Analyze options
4. Weigh trade-offs
5. Provide a well-reasoned recommendation

Show your thinking process clearly.`,

    creative: `${basePrompt}

You are in CREATIVE MODE. Think outside the box. Offer unique, memorable suggestions that go beyond the obvious. Surprise and delight.`,

    executive: `${basePrompt}

You are in EXECUTIVE MODE for high-net-worth decision making. 

Research context:
${researchFindings || "No external research available."}

Provide:
- Executive summary (2-3 sentences)
- Key insights with sources
- Recommended actions
- Risk considerations
- Alternative options

Be decisive, cite sources, and optimize for clarity.`,
  };

  return modePrompts[mode];
}

// Helper: Generate follow-up questions
function generateFollowUpQuestions(query: string, answer: string): string[] {
  // This would ideally be AI-generated, but here are contextual suggestions
  const questions: string[] = [];

  if (query.toLowerCase().includes("travel") || query.toLowerCase().includes("trip")) {
    questions.push("Would you like me to check availability for specific dates?");
    questions.push("Shall I arrange transportation as well?");
  }

  if (query.toLowerCase().includes("restaurant") || query.toLowerCase().includes("dining")) {
    questions.push("Would you prefer a private dining room?");
    questions.push("Any dietary restrictions I should note?");
  }

  if (query.toLowerCase().includes("book") || query.toLowerCase().includes("reserve")) {
    questions.push("Shall I confirm this booking?");
    questions.push("Would you like calendar reminders set up?");
  }

  // Default follow-ups
  if (questions.length === 0) {
    questions.push("Is there anything else you'd like me to look into?");
    questions.push("Would you like more details on any part of this?");
  }

  return questions.slice(0, 3);
}

export default useOrlaIQ;
