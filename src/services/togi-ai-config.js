function readEnv(name, fallback = '') {
  const raw = String(process.env[name] ?? '').trim();
  if (!raw) return fallback;

  const first = raw[0];
  const last = raw.at(-1);
  if ((first === '"' || first === "'") && last === first && raw.length >= 2) {
    return raw.slice(1, -1).trim();
  }

  return raw;
}

function readNumber(name, fallback) {
  const value = Number(readEnv(name));
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

export function getTogiAIConfig() {
  return {
    provider: readEnv('TOGI_AI_PROVIDER', 'mistral').toLowerCase(),
    maxTokens: readNumber('TOGI_AI_MAX_TOKENS', 240),
    temperature: readNumber('TOGI_AI_TEMPERATURE', 0.75),
    cooldownMs: readNumber('TOGI_AI_COOLDOWN_MS', 1000),
    historyMessages: Math.min(Math.floor(readNumber('TOGI_AI_HISTORY_MESSAGES', 8)), 20),
    mistral: {
      apiKey: readEnv('MISTRAL_API_KEY'),
      model: readEnv('MISTRAL_MODEL', 'mistral-small-latest'),
      baseUrl: readEnv('MISTRAL_BASE_URL', 'https://api.mistral.ai/v1').replace(/\/+$/, ''),
      timeoutMs: readNumber('MISTRAL_TIMEOUT_MS', 12000)
    }
  };
}

export default getTogiAIConfig;
