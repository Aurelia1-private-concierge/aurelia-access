import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  backgroundAgents,
  runTravelIntelligenceAgent,
  runExperienceCuratorAgent,
  runMarketIntelligenceAgent,
  runProactiveServiceAgent,
  runPartnerOperationsAgent,
  AgentConfig,
  AgentResult,
  TravelIntelligence,
  ExperienceSuggestion,
  MarketOpportunity,
  ServiceAlert,
  PartnerInsight,
} from '@/lib/agents';

interface AgentState {
  isRunning: boolean;
  lastRun?: Date;
  lastResult?: AgentResult;
  error?: string;
}

interface BackgroundAgentsState {
  agents: Record<string, AgentState>;
  travelIntelligence?: TravelIntelligence;
  experiences?: ExperienceSuggestion[];
  marketOpportunities?: MarketOpportunity[];
  serviceAlerts?: ServiceAlert[];
  partnerInsights?: PartnerInsight[];
}

export function useBackgroundAgents() {
  const { user } = useAuth();
  const [state, setState] = useState<BackgroundAgentsState>({
    agents: {},
  });
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize agent states
  useEffect(() => {
    const initialStates: Record<string, AgentState> = {};
    backgroundAgents.forEach(agent => {
      initialStates[agent.id] = { isRunning: false };
    });
    setState(prev => ({ ...prev, agents: initialStates }));
    setIsInitialized(true);
  }, []);

  // Run a specific agent
  const runAgent = useCallback(async (agentId: string) => {
    setState(prev => ({
      ...prev,
      agents: {
        ...prev.agents,
        [agentId]: { ...prev.agents[agentId], isRunning: true, error: undefined },
      },
    }));

    try {
      let result: AgentResult;

      switch (agentId) {
        case 'travel-intelligence': {
          result = await runTravelIntelligenceAgent(user?.id);
          if (result.success && result.data) {
            setState(prev => ({
              ...prev,
              travelIntelligence: result.data as TravelIntelligence,
            }));
          }
          break;
        }
        case 'experience-curator': {
          result = await runExperienceCuratorAgent(user?.id);
          if (result.success && result.data) {
            setState(prev => ({
              ...prev,
              experiences: result.data as ExperienceSuggestion[],
            }));
          }
          break;
        }
        case 'market-intelligence': {
          result = await runMarketIntelligenceAgent(user?.id);
          if (result.success && result.data) {
            setState(prev => ({
              ...prev,
              marketOpportunities: result.data as MarketOpportunity[],
            }));
          }
          break;
        }
        case 'proactive-service': {
          if (!user?.id) {
            result = { success: false, error: 'User not authenticated', timestamp: new Date() };
          } else {
            result = await runProactiveServiceAgent(user.id);
            if (result.success && result.data) {
              setState(prev => ({
                ...prev,
                serviceAlerts: result.data as ServiceAlert[],
              }));
            }
          }
          break;
        }
        case 'partner-operations': {
          result = await runPartnerOperationsAgent();
          if (result.success && result.data) {
            setState(prev => ({
              ...prev,
              partnerInsights: result.data as PartnerInsight[],
            }));
          }
          break;
        }
        default:
          result = { success: false, error: 'Unknown agent', timestamp: new Date() };
      }

      setState(prev => ({
        ...prev,
        agents: {
          ...prev.agents,
          [agentId]: {
            isRunning: false,
            lastRun: new Date(),
            lastResult: result,
            error: result.error,
          },
        },
      }));

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setState(prev => ({
        ...prev,
        agents: {
          ...prev.agents,
          [agentId]: {
            isRunning: false,
            lastRun: new Date(),
            error: errorMessage,
          },
        },
      }));
      return { success: false, error: errorMessage, timestamp: new Date() };
    }
  }, [user?.id]);

  // Run all agents
  const runAllAgents = useCallback(async () => {
    const results = await Promise.all(
      backgroundAgents.map(agent => runAgent(agent.id))
    );
    return results;
  }, [runAgent]);

  // Get agent configuration
  const getAgentConfig = useCallback((agentId: string): AgentConfig | undefined => {
    return backgroundAgents.find(a => a.id === agentId);
  }, []);

  // Get agent state
  const getAgentState = useCallback((agentId: string): AgentState | undefined => {
    return state.agents[agentId];
  }, [state.agents]);

  return {
    agents: backgroundAgents,
    agentStates: state.agents,
    travelIntelligence: state.travelIntelligence,
    experiences: state.experiences,
    marketOpportunities: state.marketOpportunities,
    serviceAlerts: state.serviceAlerts,
    partnerInsights: state.partnerInsights,
    isInitialized,
    runAgent,
    runAllAgents,
    getAgentConfig,
    getAgentState,
  };
}
