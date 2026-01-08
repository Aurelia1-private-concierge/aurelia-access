-- Fix partners table: Add explicit deny policy for anonymous access
CREATE POLICY "Deny anonymous access to partners"
ON public.partners
FOR ALL
TO anon
USING (false);

-- Fix conversation_messages: Add DELETE policy for users to remove their own messages
CREATE POLICY "Users can delete messages in their conversations"
ON public.conversation_messages
FOR DELETE
USING (EXISTS (
  SELECT 1
  FROM conversations
  WHERE conversations.id = conversation_messages.conversation_id
    AND conversations.user_id = auth.uid()
));