"use client";

import { useState, useEffect, useCallback } from "react";

export interface Settings {
  host: string;
  port: string;
  path: string;
  authToken: string;
  model: string;
  temperature: number;
  topP: number;
  topK: number;
  maxTokens: number;
  frequencyPenalty: number;
  presencePenalty: number;
  enableThinking: boolean;
}

const SETTINGS_KEY = "chat-settings";
const MODELS_KEY = "chat-models";

export const DEFAULT_SETTINGS: Settings = {
  host: "http://183.222.230.10",
  port: "40073",
  path: "/v1",
  authToken: "any",
  model: "qwen3.5-27b",
  temperature: 0.7,
  topP: 0.9,
  topK: 50,
  maxTokens: 4096,
  frequencyPenalty: 0,
  presencePenalty: 0,
  enableThinking: false,
};

const DEFAULT_MODELS = ["qwen3.5-27b", "qwen3-32b"];

export function getBaseUrl(settings: Settings): string {
  const { host, port, path } = settings;
  const cleanHost = host.replace(/\/+$/, '');
  const cleanPath = path.replace(/^\/+/, '') ? '/' + path.replace(/^\/+/, '') : '';
  return port ? `${cleanHost}:${port}${cleanPath}` : `${cleanHost}${cleanPath}`;
}

function loadFromLocalStorage(): { settings: Settings; models: string[] } {
  let settings = DEFAULT_SETTINGS;
  let models = DEFAULT_MODELS;

  if (typeof window === "undefined") return { settings, models };

  try {
    const saved = localStorage.getItem(SETTINGS_KEY);
    if (saved) settings = { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
  } catch { }

  try {
    const saved = localStorage.getItem(MODELS_KEY);
    if (saved) {
      const parsed: string[] = JSON.parse(saved);
      for (const m of DEFAULT_MODELS) {
        if (!parsed.includes(m)) parsed.push(m);
      }
      models = parsed;
    }
  } catch { }

  return { settings, models };
}

export function useChatSettings() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [models, setModels] = useState<string[]>(DEFAULT_MODELS);

  // Initialize from localStorage (synchronous, instant render)
  useEffect(() => {
    const ls = loadFromLocalStorage();
    setSettings(ls.settings);
    setModels(ls.models);

    // Then fetch from DB — DB wins (global shared config)
    fetch('/api/chat/settings')
      .then((res) => res.json())
      .then((result) => {
        if (!result.success || !result.data) return;

        const db = result.data;
        setSettings({
          host: db.host,
          port: db.port,
          path: db.path,
          authToken: db.authToken,
          model: db.model,
          temperature: db.temperature,
          topP: db.topP,
          topK: db.topK,
          maxTokens: db.maxTokens,
          frequencyPenalty: db.frequencyPenalty,
          presencePenalty: db.presencePenalty,
          enableThinking: db.enableThinking,
        });
        if (db.models) setModels(db.models);
      })
      .catch(console.error);
  }, []);

  const saveSettings = useCallback((newSettings: Settings, newModels: string[]) => {
    setSettings(newSettings);
    setModels(newModels);

    // Optimistic localStorage write
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings));
    localStorage.setItem(MODELS_KEY, JSON.stringify(newModels));

    // Persist to DB (global shared)
    fetch('/api/chat/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...newSettings, models: newModels }),
    }).catch(console.error);
  }, []);

  return { settings, models, saveSettings };
}
