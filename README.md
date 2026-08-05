# 🤖 Togi Bot

«O bot completo para deixar seu WhatsApp muito mais divertido.»

O Togi Bot é um bot modular para WhatsApp desenvolvido com Node.js + Baileys, criado para oferecer diversão, ferramentas para grupos, economia, RPG, sistema social, figurinhas, música e recursos de IA em uma única plataforma.

---

# 💠 Economia — Token

A moeda oficial do Togi Bot é:

🪙 Token

O Token será utilizado em diversos sistemas do bot, incluindo:

- 💰 Economia
- 🛒 Loja
- 🎁 Recompensas
- 🎮 RPG
- ❤️ Sistemas sociais
- 🏆 Eventos
- 🎲 Minijogos

---

🚀 Recursos planejados

⚙️ Sistema principal

- 🔗 Conexão por Pairing Code
- 📡 Baileys
- 🔄 Reconexão automática
- 📦 Sistema modular
- ⚡ Carregamento automático de comandos
- ⚙️ Configuração centralizada
- 🔐 Sistema de permissões

💰 Economia

- 🪙 Token
- 💳 Saldo
- 🎁 Recompensas diárias
- 💸 Transferências
- 🛒 Loja
- 📊 Ranking econômico

🎮 RPG

- 👤 Perfil
- ⭐ XP e níveis
- ⚔️ Sistema de batalha
- 🎒 Inventário
- 🗺️ Aventuras
- 💰 Recompensas

❤️ Social

- 💕 Casais
- 💍 Casamento
- 💔 Divórcio
- 👨‍👩‍👧 Família
- 💞 Ship
- 👤 Perfil social

👥 Grupos

- 🛡️ Moderação
- 👢 Banimento
- 🚪 Remoção de membros
- ⬆️ Promoção
- ⬇️ Rebaixamento
- ⚠️ Avisos
- 🔗 Anti-link
- 🚫 Anti-spam
- ⚙️ Configurações individuais por grupo

🎨 Figurinhas

- 🖼️ Imagem → figurinha
- 🎞️ Vídeo → figurinha
- ✨ Figurinhas personalizadas
- 📝 Brat
- 🖼️ Comandos de edição

🎵 Música

- 🎵 Sistema de músicas
- 📋 Fila por grupo
- ⏯️ Controle de reprodução
- 🔊 Sistema preparado para diferentes provedores

🤖 IA

- 💬 Conversação com IA
- 🧠 Recursos inteligentes
- 👑 Sistema especial para usuários VIP
- ⚙️ Integração configurável

😴 AFK

- 💤 Sistema AFK
- ⏱️ Registro de tempo
- 💬 Resposta automática
- 🔔 Notificação ao retornar

---

🗂️ Estrutura

Togi-Bot/
│
├── src/
│   ├── index.js
│   ├── config.js
│   │
│   ├── core/
│   │   ├── connection/
│   │   ├── commands/
│   │   ├── permissions/
│   │   └── events/
│   │
│   ├── database/
│   │
│   ├── commands/
│   │   ├── admin/
│   │   ├── economy/
│   │   ├── rpg/
│   │   ├── social/
│   │   ├── family/
│   │   ├── group/
│   │   ├── sticker/
│   │   ├── music/
│   │   └── ai/
│   │
│   ├── events/
│   │
│   └── utils/
│
├── data/
├── package.json
├── README.md
└── LICENSE

---

🛠️ Tecnologias

- Node.js
- Baileys
- SQLite
- JavaScript
- Pino
- Outras bibliotecas conforme cada módulo

---

🔐 Segurança

O Togi Bot deve manter informações sensíveis fora do código público.

Nunca coloque no repositório:

- 🔑 Tokens de APIs
- 📱 Sessões do WhatsApp
- 🔐 Senhas
- 🗝️ Chaves privadas
- 📄 Dados pessoais

Utilize variáveis de ambiente e arquivos locais apropriados.

---

📌 Status

🚧 Em desenvolvimento

O projeto está sendo construído de forma modular para facilitar futuras atualizações, novos comandos e novos sistemas.

---

📜 Licença

A licença do projeto será definida conforme a versão final e os componentes utilizados.

---

🤖 Togi Bot

Diversão. Sistemas. Comunidade. Tudo em um só bot.
