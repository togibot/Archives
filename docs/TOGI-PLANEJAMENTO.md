# 🟣 Togi Bot — Planejamento de Sistemas

> Documento oficial de planejamento. **Nesta etapa não implementamos os sistemas; primeiro fechamos arquitetura e regras.**

## Regras globais

- Identidade própria do Togi Bot; não copiar menus, textos ou estrutura proprietária de outros bots.
- Moeda oficial: 🪙 **Token**.
- Menus com mídia devem suportar **thumbnail + texto** de forma padronizada.
- Comandos novos devem usar reações automáticas quando fizer sentido.
- Respostas do Battle Mode devem narrar a ação diretamente, sem quebrar a imersão com frases como “foi só brincadeira”.
- AFK só termina com `.afk off` (ou outro comando explícito definido futuramente); enviar mensagens comuns não cancela o AFK.
- Desenvolvimento seguirá: **planejamento → aprovação → programação → testes → atualização GitHub**.

## 1. 🏠 Menu principal

`.menu` será uma central curta para as categorias:

- `.menusocial`
- `.menubm`
- `.menupets`
- `.menuvida`
- `.menueconomia`
- `.menujogos`
- `.menurelacionamento`
- `.menucriativo`
- `.menuimagem`
- `.menuvideo`
- `.menuaudio`
- `.menudown`
- `.menuia`
- `.menutools`
- `.menuvip`
- `.menugrupo`
- `.menudono`

## 2. ⚔️ Battle Mode — `.menubm`

Comandos planejados:

`.tapa`, `.soco`, `.chute`, `.empurrar`, `.puxar`, `.jogaragua`, `.assustar`, `.trollar`, `.desafiar`, `.duelo`, `.lutar`, `.combo`, `.ajudar`, `.defender`.

Regras:

- Destino normalmente por menção.
- Várias respostas aleatórias por ação.
- Thumbnails por ação quando disponíveis.
- Reação automática nos comandos.
- Linguagem de narração direta, por exemplo: `👊 @A DEU UM TAPÃO EM @B! @B, VAI DEIXAR MANO?`.
- Sem mecânica de dano real ou conteúdo gráfico.

## 3. 🐾 Pets — `.menupets`

Comandos:

`.pet`, `.adotar`, `.meupet`, `.meuspets`, `.petinfo`, `.alimentar`, `.brincar`, `.treinar`, `.dormirpet`, `.passear`, `.evoluirpet`, `.soltarpet`, `.petshop`.

Categorias:

- Comuns
- Raros
- Épicos
- Lendários
- Secretos

Planejamento futuro: atributos, evolução, raridade, vínculo, necessidades e interação com profissão. Compras e custos usam Token.

## 4. 💼 Vida / Profissões — `.menuvida`

Comandos:

`.vagas`, `.escolher <número>`, `.profissao`, `.meutrabalho`, `.trabalhar`, `.salario`, `.promocao`, `.experiencia`, `.demissao`.

Vagas iniciais:

1. 👨‍💻 Engenheiro
2. 👨‍⚕️ Médico
3. 👨‍🍳 Chef
4. 👨‍🚀 Astronauta
5. 🕵️ Detetive
6. 🎮 Streamer
7. 💻 Programador
8. 🎨 Designer
9. 🚗 Motorista
10. 🧪 Cientista
11. 🏗️ Arquiteto
12. 🧑‍🏫 Professor
13. 📸 Fotógrafo
14. 🎤 Cantor
15. 📰 Jornalista
16. 🧑‍🔧 Mecânico
17. 🧑‍🚒 Bombeiro
18. 👮 Policial
19. 💼 Empresário
20. 🧑‍💻 Desenvolvedor

Seleção oficial: `.escolher 1` escolhe a vaga 1.

Sistema futuro: salário, XP profissional, promoções, tarefas, cooldowns e profissões raras.

## 5. 💰 Economia — `.menueconomia`

`.saldo`, `.daily`, `.weekly`, `.trabalhar`, `.missao`, `.missoes`, `.loja`, `.comprar`, `.vender`, `.inventario`, `.presente @user`, `.transferir @user <quantidade>`, `.top`, `.rankingtokens`.

Futuro: banco, conta, eventos, recompensas e conquistas.

**Não haverá apostas ou gambling com Tokens.**

## 6. 🎮 Jogos — `.menujogos`

`.quiz`, `.forca`, `.adivinhar`, `.desafio`, `.pergunta`, `.dado`, `.moeda`, `.numero`.

Futuro: jogos próprios do Togi, XP, Tokens por participação, recordes e rankings. Sorteios devem ser recreativos e não podem virar apostas.

## 7. 👤 Social — `.menusocial`

`.perfil`, `.me`, `.rank`, `.xp`, `.nivel`, `.bio`, `.nick`, `.avatar`, `.status`, `.conquistas`.

Perfil deve integrar Token, XP, nível, profissão, pet, conquistas e outros dados públicos configuráveis.

## 8. ❤️ Relacionamentos — `.menurelacionamento`

`.ship`, `.combinar`, `.amizade`, `.familia`, `.adotar`, `.irmao`.

Foco em mecânicas sociais e de roleplay apropriadas, sem conteúdo sexual.

## 9. 🎨 Criativo — `.menucriativo`

`.s`, `.brat`, `.ttp`, `.attp`, `.qc`, `.emojimix`, `.hd`, `.toimg`, `.togif`, `.wm`, `.renomear`.

## 10. 🎬 Vídeo — `.menuvideo`

`.tovideo`, `.togif`, `.tomp3`, `.camaralenta`, `.acelerarvideo`, `.reversovideo`, `.espelharvideo`, `.girarvideo`, `.videopb`, `.videoblur`, `.pixelarvideo`, `.videozoom`, `.boomerang`, `.videomudo`.

## 11. 🎵 Áudio — `.menuaudio`

`.slowed`, `.speed`, `.bass`, `.reverb`, `.efeito8d`, `.efeito16d`, `.grave`, `.esquilo`, `.vozmenino`, `.totext`.

## 12. 📥 Downloads — `.menudown`

`.play`, `.p`, `.download`, `.video`, `.audio`.

As fontes/APIs serão definidas antes da implementação. Não assumir que qualquer serviço ou link funcionará.

## 13. 🤖 IA — `.menuia`

`.togi`, `.ia`, `.gpt`, `.gemini`, `.resumir`, `.explica`, `.traduzir`.

O Togi AI será o sistema principal da categoria. Recursos de memória devem respeitar configurações, privacidade e limites definidos pelo projeto.

## 14. 🛠️ Utilidades — `.menutools`

`.ping`, `.status`, `.calc`, `.qrcode`, `.clima`, `.cotacao`, `.tradutor`, `.wiki`, `.conversor`, `.gerarsenha`, `.sorteio`, `.horario`, `.encurtalink`.

## 15. 👑 VIP — `.menuvip`

`.vip`, `.infovip`, `.beneficios`, `.comprarvip`.

Futuro: comandos exclusivos, limites maiores e recursos premium.

## 16. 🛡️ Grupo — `.menugrupo`

`.ban`, `.kick`, `.promover`, `.rebaixar`, `.add`, `.link`, `.tagall`, `.hidetag`, `.warn`, `.warnings`, `.mute`, `.antilink`, `.antiflood`, `.welcome`, `.goodbye`.

## 17. 👑 Dono — `.menudono`

`.dono`, `.broadcast`, `.banuser`, `.unbanuser`, `.addtoken`, `.removetoken`, `.addvip`, `.removevip`, `.stats`, `.logs`, `.restart`.

## 18. ⚙️ Sistemas centrais

Planejar antes de implementar:

1. Sistema completo de Tokens
2. XP + níveis
3. Conquistas
4. Pets + evolução
5. Profissões + salários
6. Missões diárias
7. Battle Mode
8. Perfil
9. AFK persistente
10. Presentes
11. Loja
12. Inventário
13. Rankings
14. Thumbnails
15. Respostas aleatórias
16. Reações automáticas

## Ordem de implementação

### Fase A — Fundação

- Dados de usuário
- Tokens
- XP/níveis
- Perfil
- Inventário
- Cooldowns
- Reações
- Serviço de thumbnails
- AFK persistente

### Fase B — Conteúdo social

- Battle Mode
- Pets
- Profissões
- Missões
- Jogos
- Rankings

### Fase C — Menus e mídia

- Menus novos
- Criativo
- Imagem
- Vídeo
- Áudio
- Downloads

### Fase D — Serviços avançados

- IA
- VIP
- Sistemas de grupo
- Sistemas de dono

Cada fase deverá ser testada antes de seguir para a próxima.
