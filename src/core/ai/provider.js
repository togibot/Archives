export function createAIProvider({ generate } = {}) {
  return {
    enabled: typeof generate === 'function',
    async ask({ prompt, context = [] }) {
      if (typeof generate !== 'function') {
        throw new Error('Nenhum provedor de IA foi configurado.');
      }
      return generate({ prompt, context });
    }
  };
}
