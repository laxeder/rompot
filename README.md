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

Instalando pacote

```sh
npm i rompot
```

Importando API

```ts
// TypeScript
import Bot, { WhatsAppBot } from "rompot";

// Javascript
const { Bot, WhatsAppBot } = require("rompot");
```

## ⚙️ Exemplo

```sh
npm run example
```

## WhatsApp

Após iniciar o bot um QR Code será emprimido no terminal, escane-o com seu WhatsApp para gerar uma nova conexão entre seu número e o Bot. Essa conexão será guardada em `./path-to-auth`, para gerar uma nova delete-o ou se conecte com um novo caminho de sessão.

```ts
const bot = new Bot(new WhatsAppBot());
bot.build("./path-to-auth");
```

## 🛠️ Construído com

Esse Software foi construído com:

- [Baileys](https://github.com/adiwajshing/Baileys) - API para se conectar ao WhatsApp

## 📄 Licença

Este projeto está sob a licença MIT - veja o arquivo [LICENSE.md](https://github.com/laxeder/multi-bot/LICENSE) para detalhes.
