CREATE TABLE IF NOT EXISTS "chat_settings" (
  "id" text PRIMARY KEY DEFAULT 'global',
  "host" text NOT NULL DEFAULT 'http://183.222.230.10',
  "port" text NOT NULL DEFAULT '40073',
  "path" text NOT NULL DEFAULT '/v1',
  "auth_token" text NOT NULL DEFAULT 'any',
  "model" text NOT NULL DEFAULT 'qwen3.5-27b',
  "temperature" real NOT NULL DEFAULT 0.7,
  "top_p" real NOT NULL DEFAULT 0.9,
  "top_k" integer NOT NULL DEFAULT 50,
  "max_tokens" integer NOT NULL DEFAULT 4096,
  "frequency_penalty" real NOT NULL DEFAULT 0,
  "presence_penalty" real NOT NULL DEFAULT 0,
  "enable_thinking" boolean NOT NULL DEFAULT false,
  "models" jsonb NOT NULL DEFAULT '["qwen3.5-27b","qwen3-32b"]',
  "updated_at" timestamp NOT NULL DEFAULT now()
);
