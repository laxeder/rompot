# Rompot

Um chatbot multi-plataforma em TypeScript.

## 🛠 Recursos

- Multi plataformas
- - WhatsApp
- - Telegram (Em breve)
- - Discord (Em breve)
- Automatização de mensagem
- Criação de comandos

### 🔧 Instalação

Clonando repositório:

```sh
git clone https://github.com/laxeder/rompot.git
```

Instalando dependencias:

```sh
npm run build
```

## ⚙️ Exemplo

```sh
npm run example
```

## WhatsApp

Após iniciar o bot um QR Code será emprimido no terminal, escane-o com seu WhatsApp para gerar uma nova conexão entre seu número e o Bot. Essa conexão será guardada em `./auth_info_baileys`, para gerar uma nova delete-o ou se conecte com um novo caminho de sessão.

```ts
// src/application/v1/routes/build.ts

await Bot.build("./path-to-session");
```

## 🛠️ Construído com

Esse Software foi construído com:

- [Baileys](https://github.com/adiwajshing/Baileys) - API para se conectar ao WhatsApp

## 📄 Licença

Este projeto está sob a licença MIT - veja o arquivo [LICENSE.md](https://github.com/laxeder/multi-bot/LICENSE) para detalhes.
