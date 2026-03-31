
CREATE TABLE public.tool_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  tool_id text NOT NULL,
  title text NOT NULL DEFAULT '',
  input_data jsonb DEFAULT '{}',
  result_data jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.tool_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own history" ON public.tool_history
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own history" ON public.tool_history
  FOR INSERT TO public WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own history" ON public.tool_history
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE INDEX idx_tool_history_user_tool ON public.tool_history (user_id, tool_id, created_at DESC);
