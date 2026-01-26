import { useState, useEffect, useCallback, useRef } from "react";

interface Draft {
  id: string;
  content: string;
  conversationId?: string;
  recipientId?: string;
  lastModified: number;
  type: "concierge" | "circle" | "partner";
}

interface UseMessageDraftsOptions {
  storageKey?: string;
  autoSaveDelay?: number;
  maxDrafts?: number;
}

export function useMessageDrafts(options: UseMessageDraftsOptions = {}) {
  const {
    storageKey = "aurelia-message-drafts",
    autoSaveDelay = 1000,
    maxDrafts = 10,
  } = options;

  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [currentDraft, setCurrentDraft] = useState<Draft | null>(null);
  const autoSaveTimer = useRef<NodeJS.Timeout | null>(null);

  // Load drafts from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored) as Draft[];
        // Sort by last modified, most recent first
        parsed.sort((a, b) => b.lastModified - a.lastModified);
        setDrafts(parsed);
      }
    } catch (error) {
      console.error("[MessageDrafts] Failed to load drafts:", error);
    }
  }, [storageKey]);

  // Save drafts to localStorage on changes
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(drafts));
    } catch (error) {
      console.error("[MessageDrafts] Failed to save drafts:", error);
    }
  }, [drafts, storageKey]);

  const saveDraft = useCallback(
    (
      content: string,
      type: Draft["type"],
      conversationId?: string,
      recipientId?: string
    ) => {
      const draftId = conversationId || recipientId || `new-${type}`;
      
      setDrafts((prev) => {
        // Check if draft already exists
        const existingIndex = prev.findIndex(
          (d) =>
            d.conversationId === conversationId ||
            d.recipientId === recipientId ||
            d.id === draftId
        );

        const newDraft: Draft = {
          id: draftId,
          content,
          conversationId,
          recipientId,
          lastModified: Date.now(),
          type,
        };

        let updated: Draft[];
        if (existingIndex >= 0) {
          // Update existing draft
          updated = [...prev];
          updated[existingIndex] = newDraft;
        } else {
          // Add new draft, respecting max limit
          updated = [newDraft, ...prev].slice(0, maxDrafts);
        }

        return updated.sort((a, b) => b.lastModified - a.lastModified);
      });
    },
    [maxDrafts]
  );

  const autoSaveDraft = useCallback(
    (
      content: string,
      type: Draft["type"],
      conversationId?: string,
      recipientId?: string
    ) => {
      // Clear previous timer
      if (autoSaveTimer.current) {
        clearTimeout(autoSaveTimer.current);
      }

      // Set new timer for auto-save
      autoSaveTimer.current = setTimeout(() => {
        if (content.trim()) {
          saveDraft(content, type, conversationId, recipientId);
        }
      }, autoSaveDelay);
    },
    [autoSaveDelay, saveDraft]
  );

  const getDraft = useCallback(
    (type: Draft["type"], conversationId?: string, recipientId?: string) => {
      return drafts.find(
        (d) =>
          d.type === type &&
          (d.conversationId === conversationId || d.recipientId === recipientId)
      );
    },
    [drafts]
  );

  const deleteDraft = useCallback((draftId: string) => {
    setDrafts((prev) => prev.filter((d) => d.id !== draftId));
  }, []);

  const clearDraftByConversation = useCallback(
    (conversationId: string) => {
      setDrafts((prev) =>
        prev.filter((d) => d.conversationId !== conversationId)
      );
    },
    []
  );

  const clearAllDrafts = useCallback(() => {
    setDrafts([]);
    localStorage.removeItem(storageKey);
  }, [storageKey]);

  // Cleanup auto-save timer on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimer.current) {
        clearTimeout(autoSaveTimer.current);
      }
    };
  }, []);

  return {
    drafts,
    currentDraft,
    setCurrentDraft,
    saveDraft,
    autoSaveDraft,
    getDraft,
    deleteDraft,
    clearDraftByConversation,
    clearAllDrafts,
    draftsCount: drafts.length,
  };
}
