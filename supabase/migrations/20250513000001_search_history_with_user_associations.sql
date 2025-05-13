-- Migration file for search_history table with user associations
-- Creates a new search_history table with user associations
-- Sets up RLS policies for secure access

-- Create the search_history table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.search_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  query TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  results JSONB,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Add extensions if they don't exist
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For text search capabilities

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS search_history_user_id_idx ON public.search_history(user_id);
CREATE INDEX IF NOT EXISTS search_history_query_trgm_idx ON public.search_history USING GIN(query gin_trgm_ops);
CREATE INDEX IF NOT EXISTS search_history_created_at_idx ON public.search_history(created_at DESC);

-- Add trigger for updated_at timestamp
CREATE OR REPLACE FUNCTION update_timestamp_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS search_history_updated_at_trigger ON public.search_history;
CREATE TRIGGER search_history_updated_at_trigger
BEFORE UPDATE ON public.search_history
FOR EACH ROW
EXECUTE PROCEDURE update_timestamp_column();

-- Enable Row Level Security
ALTER TABLE public.search_history ENABLE ROW LEVEL SECURITY;

-- Create policies for secure access
CREATE POLICY "Users can view their own search history"
ON public.search_history FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own search history"
ON public.search_history FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own search history"
ON public.search_history FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own search history"
ON public.search_history FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Admins policy - service_role can access all records
CREATE POLICY "Service role can do anything with search history"
ON public.search_history
TO service_role
USING (true)
WITH CHECK (true);

-- Create a function to get recent searches for a user
CREATE OR REPLACE FUNCTION get_recent_searches(
  user_uuid UUID,
  search_limit INT DEFAULT 10
)
RETURNS TABLE (
  id UUID,
  query TEXT,
  created_at TIMESTAMPTZ,
  metadata JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    sh.id,
    sh.query,
    sh.created_at,
    sh.metadata
  FROM 
    public.search_history sh
  WHERE 
    sh.user_id = user_uuid
  ORDER BY 
    sh.created_at DESC
  LIMIT 
    search_limit;
END;
$$;

-- Create a function to find similar previous searches
CREATE OR REPLACE FUNCTION find_similar_searches(
  search_query TEXT,
  user_uuid UUID,
  similarity_threshold FLOAT DEFAULT 0.3,
  search_limit INT DEFAULT 5
)
RETURNS TABLE (
  id UUID,
  query TEXT,
  similarity FLOAT,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    sh.id,
    sh.query,
    similarity(sh.query, search_query) as similarity,
    sh.created_at
  FROM 
    public.search_history sh
  WHERE 
    sh.user_id = user_uuid
    AND similarity(sh.query, search_query) > similarity_threshold
  ORDER BY 
    similarity DESC, sh.created_at DESC
  LIMIT 
    search_limit;
END;
$$;
