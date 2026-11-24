# TOGI DOOM

O TOGI DOOM usa o port **UZDoom para WebAssembly** (abootnet/uzdoom-wasm).
O motor roda no navegador do jogador: renderização 3D/WebGL2, áudio e
controles touch. O WhatsApp só entrega o link; ele não tenta transmitir
quadros do jogo pela conversa.

O build Docker publicado pelo projeto inclui **Freedoom**, um jogo compatível
com o formato Doom e distribuído como alternativa livre. Não é necessário
colocar um WAD comercial no repositório do Togi.

## 1. Requisitos do servidor

- Docker Engine com o plugin Docker Compose.
- Um domínio/subdomínio apontando para o servidor.
- Caddy (ou outro proxy HTTPS) na frente do serviço, com as portas públicas
  80 e 443 disponíveis.
- O proxy deve enviar os cabeçalhos COOP/COEP abaixo. Eles são necessários
  para o isolamento de origem que habilita os recursos de threads usados
  pelo build WebAssembly.

Sem HTTPS em um domínio público, o navegador pode bloquear recursos do
motor. Não publique a porta 8091 diretamente na internet.

## 2. Subir o motor do jogo

Na pasta raiz do repositório Togi:

```bash
docker compose -f doom/compose.yml pull
docker compose -f doom/compose.yml up -d
docker compose -f doom/compose.yml ps
```

O container escuta somente em 127.0.0.1:8091. Isso deixa o serviço
acessível apenas localmente e permite que o proxy HTTPS cuide do acesso
público.

Para atualizar a imagem:

```bash
docker compose -f doom/compose.yml pull
docker compose -f doom/compose.yml up -d
```

Para consultar os logs:

```bash
docker compose -f doom/compose.yml logs --tail=100 doom
```

## 3. Configurar HTTPS

Adicione o conteúdo de doom/Caddyfile.example ao Caddyfile do proxy público
e troque doom.seudominio.com pelo domínio real. O DNS precisa apontar para
o servidor. Caddy deve poder receber conexões públicas nas portas 80 e 443
para emitir e renovar o certificado.

O bloco do site deve preservar estes cabeçalhos na resposta:

- Cross-Origin-Opener-Policy: same-origin
- Cross-Origin-Embedder-Policy: require-corp
- Cross-Origin-Resource-Policy: same-origin

Depois de recarregar o proxy, teste:

```bash
curl -I https://doom.seudominio.com/
```

Confirme que os três cabeçalhos acima aparecem na resposta.

## 4. Conectar ao Togi Games

No arquivo `.env` da instalação do Togi, configure:

```env
TOGI_GAMES_NAME=Togi Games
TOGI_GAME_DOOM_URL=https://doom.seudominio.com/
```

A variável antiga `TOGI_DOOM_URL` continua aceita como fallback.
Reinicie o Togi para carregar as variáveis. Depois, no WhatsApp:

- `.jogos` — mostra o catálogo Togi Games.
- `.jogar doom` — abre DOOM/Freedoom pelo lançador geral.
- `.doom` — atalho direto para DOOM.
- `.doom ajuda` — mostra a ajuda.

O comando não finge encerrar o jogo remotamente: a partida roda no navegador
do próprio jogador.

## 5. Verificação rápida

1. Abra o link enviado pelo Togi em um navegador atualizado.
2. Aguarde o carregamento inicial dos arquivos WebAssembly.
3. Confirme que o mapa inicia e que os controles touch aparecem no celular.
4. Teste o áudio depois de tocar na tela, pois navegadores móveis podem exigir
   uma interação do usuário para liberar som.

## Licenças e separação

O motor UZDoom é distribuído sob GPLv3; Freedoom fornece os dados de jogo
livres usados pelo build publicado. O Togi apenas consome a imagem pública
do motor como serviço separado. Não copie os fontes do UZDoom para dentro
do código proprietário do Togi sem cumprir as obrigações da licença.
