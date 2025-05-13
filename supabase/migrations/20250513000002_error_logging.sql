-- Migration file for error_logs table
-- Creates a new table for tracking errors from edge functions

-- Create the error_logs table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.error_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  function_name TEXT NOT NULL,
  error_message TEXT NOT NULL,
  error_stack TEXT,
  request_data JSONB,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  client_info JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  severity TEXT DEFAULT 'error' CHECK (severity IN ('debug', 'info', 'warning', 'error', 'critical'))
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS error_logs_function_name_idx ON public.error_logs(function_name);
CREATE INDEX IF NOT EXISTS error_logs_severity_idx ON public.error_logs(severity);
CREATE INDEX IF NOT EXISTS error_logs_created_at_idx ON public.error_logs(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.error_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for secure access
-- Only service_role and admin users can view errors
CREATE POLICY "Only service_role can select error logs"
ON public.error_logs FOR SELECT
TO service_role
USING (true);

CREATE POLICY "Service role can insert error logs"
ON public.error_logs FOR INSERT
TO service_role
WITH CHECK (true);

-- Create a function to log errors from edge functions
CREATE OR REPLACE FUNCTION log_error(
  p_function_name TEXT,
  p_error_message TEXT,
  p_error_stack TEXT DEFAULT NULL,
  p_request_data JSONB DEFAULT NULL,
  p_user_id UUID DEFAULT NULL,
  p_client_info JSONB DEFAULT NULL,
  p_severity TEXT DEFAULT 'error'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_id UUID;
BEGIN
  INSERT INTO public.error_logs (
    function_name,
    error_message,
    error_stack,
    request_data,
    user_id,
    client_info,
    severity
  ) VALUES (
    p_function_name,
    p_error_message,
    p_error_stack,
    p_request_data,
    p_user_id,
    p_client_info,
    p_severity
  )
  RETURNING id INTO new_id;
  
  RETURN new_id;
END;
$$;
