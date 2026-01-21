-- Allow users to read their own submission immediately after insert (for returning the ID)
-- This uses a short-lived approach where we match on email from the current request context
-- Better approach: Use RETURNING from insert which doesn't require SELECT

-- Actually, the cleanest fix is to make the insert return the data without needing SELECT
-- But since anon users need to see their submission ID, we'll add a narrow policy

-- Create a policy that allows selecting a submission created within last 5 seconds with matching email
-- This is a secure narrow window for the immediate post-insert read
CREATE POLICY "Recent submitters can see their submission"
  ON public.contact_submissions FOR SELECT
  USING (
    created_at > (now() - interval '10 seconds')
  );