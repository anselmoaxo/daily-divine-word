-- Create table to store liturgy data
CREATE TABLE public.liturgias (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  data TEXT NOT NULL,
  liturgia TEXT NOT NULL,
  cor TEXT NOT NULL DEFAULT '',
  oracoes JSONB NOT NULL DEFAULT '{}',
  leituras JSONB NOT NULL DEFAULT '{}',
  antifonas JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(data)
);

-- Enable RLS
ALTER TABLE public.liturgias ENABLE ROW LEVEL SECURITY;

-- Public read access (API pública)
CREATE POLICY "Anyone can read liturgias"
  ON public.liturgias FOR SELECT
  USING (true);

-- Only authenticated users can insert/update
CREATE POLICY "Authenticated users can insert liturgias"
  ON public.liturgias FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update liturgias"
  ON public.liturgias FOR UPDATE
  TO authenticated
  USING (true);

-- Timestamp trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_liturgias_updated_at
  BEFORE UPDATE ON public.liturgias
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Index for fast date lookups
CREATE INDEX idx_liturgias_data ON public.liturgias (data);