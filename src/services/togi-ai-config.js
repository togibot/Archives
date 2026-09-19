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
    maxTokens: 500,
    temperature: 0.9,
    cooldownMs: 0,
    historyMessages: 10,
    mistral: {
      apiKey: readEnv('MISTRAL_API_KEY'),
      model: readEnv('MISTRAL_MODEL', 'mistral-small-latest'),
      baseUrl: readEnv('MISTRAL_BASE_URL', 'https://api.mistral.ai/v1').replace(/\/+$/, ''),
      timeoutMs: readNumber('MISTRAL_TIMEOUT_MS', 15000)
    }
  };
}

export default getTogiAIConfig;
