# 🤖 • 𝚃𝙾𝙶𝙸 𝙱𝙾𝚃 •

> Um bot modular para WhatsApp focado em diversão, grupos, economia, RPG, social, figurinhas e IA.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 👑 CRÉDITOS

- 👑 **Criador:** LZ
- ⭐ **SubDonos:** Lkz • Unc. (nome a confirmar)

## 🪙 ECONOMIA — TOKEN

A moeda oficial do Togi Bot é **Token**.

### Comandos ativos

`saldo` • `daily` • `weekly` • `pay` • `rich`

`loja` • `comprar` • `inventario`

`roubar` • `escudo`

### 🐾 Pets

`meuspets` • `petinfo` • `petshop` • `comprarpet`

`alimentar` • `brincar` • `dormir` • `curar`

`doarpet` • `doarcomida` • `petstats`

## 🎮 RPG

`rpg` • `explore` • `quest`

`battle` • `boss` • `arena`

`rpgrank`

## 💞 SOCIAL

`ship` • `casal`

`.casal` sorteia duas pessoas no grupo e calcula uma porcentagem de compatibilidade aleatória, apenas para diversão.

## 🎲 DIVERSÃO

`8ball` • `dado` • `coin`

`quiz` • `quizrank` • `quizstats` • `quizstreak`

## 🎮 TOGI GAMES

- `.jogos` — mostra o catálogo Togi Games.
- `.jogar <id>` — abre um jogo pela URL global.
- `.doom` — atalho para DOOM/Freedoom.

Configure apenas `TOGI_GAMES_URL` no `.env`. O Togi acrescenta automaticamente uma rota por jogo, como `/doom/` ou `/quake/`. Cada rota ainda precisa ser publicada no servidor; o catálogo não significa que todos os motores já estejam instalados. Consulte `docs/DOOM.md` para a configuração inicial de DOOM.

## 🎤 ONLY REVERB / ÁUDIO COM IA

- \`.reverb <1-10>\` — reverberação por convolução com cauda difusa.
- \`.onlyreverb normal\` — separação vocal HT-Demucs mais rápida + reverb.
- \`.onlyreverb ultra\` — especialista vocal HT-Demucs FT em FP32 + reverb.
- \`.ultrareverb\` — preset de reverb de ambiente mais intenso.

Para habilitar a separação vocal no servidor, execute uma vez:

\`\`\`bash
bash scripts/setup-audio-ai.sh
\`\`\`

O instalador cria \`.venv-audio/\` e instala \`demucs-onnx\` (ONNX Runtime, sem PyTorch).
Os pesos de cada modelo são baixados do Hugging Face automaticamente no primeiro uso.
O modo Ultra exige mais CPU, memória e armazenamento. A separação por IA pode deixar pequenos
artefatos dependendo da música; nenhum separador garante a remoção perfeita de todos os instrumentos.

Responda a uma mensagem com áudio ou envie o áudio junto com o comando.

## 👥 GRUPOS / MODERAÇÃO

`groupinfo` • `kick` • `antilink`

## 🎨 FIGURINHAS

`sticker` • `brat`

## 🤖 IA

`Togi` / `.Togi`

A integração de IA utiliza uma chave configurada por variável de ambiente. Nenhuma chave ou sessão deve ser publicada no repositório.

## 😴 GERAL

`menu` • `menubot` • `ping` • `perfil` • `rank` • `afk`

### Menus

`menueconomia` • `menupets` • `menuquiz` • `menurpg` • `menusocial`

`menugrupo` • `menumoderacao` • `menufig` • `menudiversao`

`menuranking` • `menueventos` • `menumusica` • `menuia` • `menuvip`

## ⚙️ ARQUITETURA

- Node.js
- JavaScript / ES Modules
- Baileys
- SQLite
- Pino
- Carregador automático de comandos
- Pairing Code
- Reconexão automática
- Sistema de aliases
- Sistema modular por categorias

## 🔐 SEGURANÇA

Nunca publique:

- 🔑 Chaves de API
- 📱 Sessões do WhatsApp
- 🔐 Senhas
- 🗝️ Tokens privados
- 📄 Dados pessoais

Use `.env` e mantenha arquivos de sessão fora do repositório.

## 📜 LICENÇA

**Togi Bot é um projeto proprietário.**

Não é concedida permissão para:

- ❌ Fork
- ❌ Clone para redistribuição ou reutilização
- ❌ Cópia substancial do código
- ❌ Rebranding
- ❌ Redistribuição
- ❌ Venda ou sublicenciamento do código
- ❌ Publicação do código em outro repositório

Consulte o arquivo [`LICENSE`](LICENSE) para os termos completos.

> A visibilidade pública do GitHub não significa que o código seja Open Source nem concede direitos de reutilização.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 📌 STATUS

**Togi Bot v1.0.0**

O repositório contém os comandos atualmente implementados. Menus não anunciam comandos fictícios como se já existissem.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

### 🤖 • 𝚃𝙾𝙶𝙸 𝙱𝙾𝚃 •

**Diversão. Sistemas. Comunidade. Tudo em um só bot.**

© 2026 LZ / Togi Bot
