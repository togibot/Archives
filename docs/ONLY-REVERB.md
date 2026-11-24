# Togi Only Reverb

## Comandos

- \`.reverb 1\` até \`.reverb 10\`: reverberação por convolução, com mistura seco/molhado e cauda difusa.
- \`.onlyreverb normal\`: separa a faixa vocal com o modelo HT-Demucs de execução mais rápida e aplica reverb.
- \`.onlyreverb ultra\`: usa o especialista vocal HT-Demucs FT em FP32 para uma separação de maior qualidade, com maior uso de CPU e memória.
- \`.ultrareverb\`: preset de reverberação mais profundo para a música completa.

O comando deve acompanhar um áudio ou responder a uma mensagem com áudio.

## Instalação única no servidor

Na raiz do repositório:

\`\`\`bash
bash scripts/setup-audio-ai.sh
\`\`\`

O instalador cria \`.venv-audio\` e instala \`demucs-onnx\`, que executa HT-Demucs via ONNX Runtime sem PyTorch. Não é necessário configurar uma chave de API.

Os pesos do modelo são baixados automaticamente na primeira execução de cada modo. O primeiro uso pode demorar mais e consumir centenas de MB de armazenamento. O modelo roda em CPU no servidor; arquivos longos podem levar vários minutos.

## Como funciona

O reverb usa o filtro de convolução \`afir\` do FFmpeg com uma resposta impulsiva estéreo sintética e cauda difusa. Isso substitui as repetições discretas do antigo \`aecho\` por uma reverberação densa.

O Only Reverb usa HT-Demucs para extrair a stem \`vocals\` antes do reverb. O Normal prioriza rapidez. O Ultra usa o especialista FT em precisão FP32. Como qualquer separador, pode haver vazamento de instrumentos ou artefatos, dependendo da mixagem original.

## Limites e configuração

- O processamento respeita \`AUDIO_MAX_INPUT_BYTES\` e \`MUSIC_MAX_BYTES\`.
- O comando Only Reverb tem timeout configurável por \`ONLY_REVERB_TIMEOUT_MS\` (padrão: 20 minutos).
- O executável Python pode ser substituído por \`TOGI_AUDIO_PYTHON\`; por padrão, o Togi usa \`.venv-audio/bin/python\`.
- FFmpeg precisa incluir os filtros \`afir\` e \`alimiter\`.
