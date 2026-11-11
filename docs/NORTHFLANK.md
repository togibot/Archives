# Deploy do Togi Bot no Northflank

## Configuração do serviço

- Tipo: Combined Service.
- Repositório: togibot/Archives.
- Branch: main.
- Build type: Dockerfile.
- Dockerfile path: /Dockerfile.
- Build context: / (raiz do repositório).
- Start command: manter o CMD definido no Dockerfile (npm start).
- Networking: não adicionar porta pública. O Togi Bot é um processo em segundo plano e não oferece um servidor HTTP.

## Armazenamento persistente (obrigatório)

Crie e anexe um volume persistente ao serviço:

- Access mode: Single Read/Write.
- Container mount path: /app/data.
- Replicas/instances: manter somente 1.

O diretório /app/data contém o banco SQLite, seus arquivos auxiliares WAL e a sessão do WhatsApp em /app/data/auth. Não monte o volume em /app, pois isso pode ocultar os arquivos da aplicação. Não remova nem recrie o volume durante redeploys.

Single Read/Write é o modo indicado para este bot porque o SQLite e a sessão não devem ser compartilhados por múltiplas instâncias simultâneas.

## Variáveis de ambiente

Configure no painel do Northflank, na seção de runtime variables. Não coloque valores secretos no GitHub nem em argumentos de build.

| Variável | Valor / finalidade |
| --- | --- |
| PAIRING_PHONE | Número em formato internacional, somente dígitos; usado no primeiro pareamento |
| OWNER_NUMBERS | Números dos donos, separados por vírgula |
| DATABASE_PATH | /app/data/togi.sqlite |
| AUTH_DIR | /app/data/auth |
| LOG_LEVEL | info |
| SUPABASE_URL | Opcional: URL do projeto Supabase |
| SUPABASE_SECRET_KEY | Opcional: chave secreta do Supabase |
| MISTRAL_API_KEY | Opcional: chave da IA Togi |
| MISTRAL_MODEL | Opcional; padrão mistral-small-latest |
| JAMENDO_CLIENT_ID | Opcional: integração Jamendo |
| YOUTUBE_API_KEY | Opcional: YouTube Data API |
| MUSIC_MAX_BYTES | Opcional; padrão 20971520 |

PAIRING_PHONE e OWNER_NUMBERS devem ser definidos com os números corretos do administrador. Não envie esses valores, chaves ou códigos de pareamento em chats públicos.

## Primeiro início

1. Inicie o serviço e abra os logs.
2. No primeiro boot, procure o bloco TOGI BOT — PAIRING CODE.
3. No WhatsApp, abra Dispositivos conectados e escolha conectar por código.
4. Depois que a sessão estiver registrada, mantenha o volume /app/data anexado nos próximos deploys. O bot reutiliza os arquivos de autenticação existentes.

## Persistência Supabase

O Supabase é opcional. Quando configurado, o código sincroniza o estado das tabelas SQLite para a tabela bot_state. O volume Northflank continua sendo necessário para persistir os arquivos de autenticação do WhatsApp, além de servir como armazenamento local do SQLite.

## Validação

A workflow do GitHub Actions executa a verificação de sintaxe JavaScript e um teste do adaptador SQLite com Node.js 24 em pushes e pull requests para main.
