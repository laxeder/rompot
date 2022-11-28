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

## WhatsApp

Após iniciar o bot um QR Code será emprimido no terminal, escane-o com seu WhatsApp para gerar uma nova conexão entre seu número e o Bot. Essa conexão será guardada em `./path-to-auth`, para gerar uma nova delete-o ou se conecte com um novo caminho de sessão.

```ts
const bot = new Bot(new WhatsAppBot());
bot.build("./path-to-auth");
```

## ⚙️ Criando comandos

```ts
import { Commands, Command, Message } from "rompot";

// Cria um comando com o nome Hello
// Ao ser executado envia a mensagem Hello There!
const hello = new Command("hello");
hello.setSend("Hello There!");

// Cria um comando com os nomes date, dt e data
// Executa uma função quando chamado
const date = new Command(["date", "dt", "data"]);
date.setExecute((message: Message) => {
  message.reply(`Data: ${new Date()}`);
});

// Listando comandos
const commands = new Commands({ hello, date }, bot);
commands.setPrefix("/");
bot.setCommands(commands);
```

## Eventos

### Conexão alterada

```ts
bot.on("connection", (update: { action: string; status?: number; login?: any }) => {
  if (update.action == "open") {
    logger.info("Bot conectado!");
  }

  if (update.action == "close") {
    logger.error(`Bot desligado! Status: ${update.status}`);
  }

  if (update.action == "reconnecting") {
    logger.warn("Reconectando...");
  }
});
```

### Nova mensagem

```ts
bot.on("message", async (message: Message) => {
  if (message.text == "Oi") {
    message.reply("Olá);
  }
});

bot.on("bot-message", async (message: Message) => {
  console.log(`Mensagem enviada para ${message.chat.id}`);
});
```

### Membro

```ts
bot.on("member", (member: { action: "add" | "remove"; user: User; chat: Chat }) => {
  // Novo membro de um grupo
  if (member.action == "add") {
    const msg = new Message(member.chat, `Bem vindo ao grupo @${member.user.phone}`);
    msg.addMentions(member.user.id);
    bot.send(msg);
  }

  // Membro saiu de um grupo
  if (member.action == "remove") {
    //...
  }
});
```

### Erro interno

```ts
bot.on("error", (err: any) => {
  logger.error(`Um erro ocorreu: ${err}`);
});
```

## Mensagem

```ts
import { Message, ImageMessage, VideoMessage, AudioMessage, ContactMessage, ButtonMessage, ListMessage } from "rompot";

// Chat
const chat = new Chat("id12345");

// Criar mensagem
const msg = new Message(chat, "texto");

// Enviar mensagem
bot.send(msg);

// Mencionar usuário
msg.addMentions("user.id");

// Marcar mensagem
msg.setMention(message);

// Responder mensagem
// Message.setBot(Bot) deve ser chamado antes
// Por padrão mensagens do evento "message" já vem configurado
msg.reply(message);

// Criar mensagem com imagem
const imageMessage = new ImageMessage(chat, "texto", new Buffer());

// Criar mensagem com video
const videoMessagew = new VideoMessage(chat, "texto", new Buffer());

// Criar mensagem de audio
const audioMessage = new AudioMessage(chat, "texto", new Buffer());

// Criar mensagem de localiação
// Latitude, Longitude
const imageMessage = new LocationMessage(chat, 24.121231, 55.1121221);

// Criar mensagem com contatos
// import { User } from "rompot"
const contactMessage = new ContactMessage(chat, "nome", new User("userID | phone", "nome", "5599123464"));

// Criando botões
const btnMessage = new ButtonMessage(chat, "texto", "rodapé");
btn.addCall("Call", "1234567890");
btn.addUrl("Link", "https://example.com");
btn.addReply("Texto", "button-id-123");

// Criar lista
const listMessage = new ListMessage(chat, "titulo", "texto", "rodapé", "botão");
const index1 = listMessage.addCategory("Categoria 1");
const index2 = listMessage.addCategory("Categoria 2");

listMessage.addItem(index1, "Item 1");
listMessage.addItem(index1, "Item 2");

listMessage.addItem(index2, "Abc 1");
listMessage.addItem(index2, "Abc 2");

// Lendo resposta para botões e listas
const cmd = new Command("cmd-button");
cmd.setReply((message: Message) => {
  message.reply("Botão clicado");
});

bot.commands.setCommand(cmd);

bot.on("message", async (message: Message) => {
  if (message.selected == "button-id-123") {
    bot.commands.get("cmd-button")?.reply(message);
  }
});
```

## 🛠️ Construído com

Esse Software foi construído com:

- [Baileys](https://github.com/adiwajshing/Baileys) - API para se conectar ao WhatsApp
- [RXJS](https://rxjs.dev/) - Gerenciador de eventos

## 📄 Licença

Este projeto está sob a licença MIT - veja o arquivo [LICENSE.md](https://github.com/laxeder/multi-bot/LICENSE) para detalhes.
