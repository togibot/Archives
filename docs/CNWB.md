# CNWB — atalhos do WhatsApp

Na raiz do repositório (pasta `togi-bot`):

- `./CNWB.com` — abre WhatsApp Web se houver navegador/sessão gráfica; em servidor sem interface, imprime `https://web.whatsapp.com`.
- `./CNWB.apk` — tenta iniciar o WhatsApp Business se executado em um Android local com o comando `am`; em servidor remoto, imprime um Android intent para abrir manualmente no celular.

## Limitação importante

O Altare é um servidor remoto. Um comando executado nele não consegue controlar diretamente o Android do usuário nem iniciar um aplicativo instalado no celular. O atalho `CNWB.apk` não é um APK instalável; é um script com esse nome para manter a sintaxe solicitada. O WhatsApp Business precisa estar instalado no aparelho.

Depois de atualizar o repositório, execute na pasta do bot:

```sh
./CNWB.com
./CNWB.apk
```
