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

export function getTogiAIConfig() {
  return {
    provider: 'mistral',
    maxTokens: 500,
    temperature: 0.9,
    historyMessages: 10,
    mistral: {
      apiKey: readEnv('MISTRAL_API_KEY'),
      model: readEnv('MISTRAL_MODEL', 'mistral-small-latest')
    }
  };
}

export default getTogiAIConfig;
