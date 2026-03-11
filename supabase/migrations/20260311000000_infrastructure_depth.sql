-- Phase 90+: Codebase Deepening Infrastructure
-- 2026-03-11

-- 1. Product Telemetry (FlowOS Insight)
CREATE TABLE IF NOT EXISTS public.flow_telemetry (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    event_type TEXT NOT NULL,
    event_data JSONB DEFAULT '{}'::jsonb,
    session_id TEXT,
    url TEXT,
    user_agent TEXT,
    ip_address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indices for telemetry
CREATE INDEX IF NOT EXISTS idx_telemetry_user_id ON public.flow_telemetry(user_id);
CREATE INDEX IF NOT EXISTS idx_telemetry_event_type ON public.flow_telemetry(event_type);
CREATE INDEX IF NOT EXISTS idx_telemetry_created_at ON public.flow_telemetry(created_at);

-- Enable RLS for telemetry
ALTER TABLE public.flow_telemetry ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to insert their own telemetry
CREATE POLICY "Users can insert their own telemetry" ON public.flow_telemetry
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Allow anonymous telemetry (optional, for onboarding attribution)
CREATE POLICY "Allow anonymous telemetry insert" ON public.flow_telemetry
    FOR INSERT TO anon
    WITH CHECK (user_id IS NULL);

-- 2. Console Hub Cache (For Performance)
CREATE TABLE IF NOT EXISTS public.flow_hub_summary_cache (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id),
    cached_data JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for cache
ALTER TABLE public.flow_hub_summary_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own cache" ON public.flow_hub_summary_cache
    FOR ALL TO authenticated
    USING (auth.uid() = user_id);
