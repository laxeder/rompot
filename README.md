# Rompot

Um chatbot multi-plataforma em TypeScript.

## 🛠 Recursos

- Multi plataformas
  - WhatsApp
  - Telegram (Em breve)
  - Discord (Em breve)
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
import { WhatsAppBot } from "rompot";

// Javascript
const { WhatsAppBot } = require("rompot");
```

## WhatsApp

Após iniciar o bot um QR Code será emprimido no terminal, escane-o com seu WhatsApp para gerar uma nova conexão entre seu número e o Bot. Essa conexão será guardada em `./path-to-auth`, para gerar uma nova delete-o ou se conecte com um novo caminho de sessão.

```ts
const bot = new WhatsAppBot();
bot.connect("./path-to-auth");

bot.on("qr", (qr) => {
  console.log("Scan QR:" qr)
})
```

## Configurações

```ts
type BuildConfig = {
  /** Desativa comandos automaticos */
  disableAutoCommand?: boolean;
  /** Ativa comandos automaticos para mensagem enviadas pelo bot */
  autoRunBotCommand?: boolean;
  /** Recebe as mensagem enviadas pelo bot no evento "message" */
  receiveAllMessages?: boolean;
  /** Desativa a visualização automatica das mensagem recebidas */
  disableAutoRead?: boolean;
};
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

### Conexão

```ts
bot.on("open", (open) => {
  console.log("Bot conectado!");
});

bot.on("close", (close) => {
  console.log("Bot desconectado!");
});

bot.on("closed", (closed) => {
  console.log("Conexão com o bot encerrada!");
});

bot.on("connecting", (conn) => {
  console.log("Conectando bot");
});

bot.on("reconnecting", (conn) => {
  console.log("Reconectando bot");
});
```

### Mensagem

```ts
bot.on("message", (message) => {
  console.log(`Mensagem recebida de ${message.user.name}`);

  if (message.text == "Oi") {
    message.reply("Olá");
  }
});

bot.on("me", (message) => {
  console.log(`Mensagem enviada para ${message.chat.id}`);
});
```

### Membros

```ts
bot.on("member", (member) => {
  // Novo membro de um grupo
  if (member.action == "add") {
    const msg = new Message(member.chat, `Bem vindo ao grupo @${member.user.id}`);
    msg.addMentions(member.user.id);
    bot.send(msg);
  }

  if (member.action == "remove") {
    // Membro saiu de um grupo
  }
  if (member.action == "promote") {
    // Membro recebeu admin
  }
  if (member.action == "demote") {
    // Membro perdeu admin
  }
});
```

### Erro interno

```ts
bot.on("error", (err: any) => {
  console.error(`Um erro ocorreu: ${err}`);
});
```

## Mensagem

```ts
import { Message } from "rompot";

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
//! Message.setBot(Bot) deve ser chamado antes
//? Por padrão mensagens de eventos" já vem configurado
msg.reply(message);

// Visualiza uma mensagem recebida
msg.read();
```

## Mensagem de mídia

```ts
import { ImageMessage, VideoMessage, AudioMessage, LocationMessage, ContactMessage } from "rompot";

// Criar mensagem com imagem
const imageMessage = new ImageMessage(chat, "texto", new Buffer());

// Criar mensagem com video
const videoMessage = new VideoMessage(chat, "texto", new Buffer());

// Criar mensagem de audio
const audioMessage = new AudioMessage(chat, "texto", new Buffer());

// Criar mensagem de localiação
// Latitude, Longitude
const locationMessage = new LocationMessage(chat, 24.121231, 55.1121221);

// Criar mensagem com contatos
// import { User } from "rompot"
const contactMessage = new ContactMessage(chat, "nome", new User("id", "nome", "5599123464"));
```

## Outros tipos de mensagem

```ts
import { ButtonMessage, ListMessage, ReactionMessage } from "rompot";

// Cria uma mensagem de reação
// message || id --> define a mensagem que vai receber a reação
const reactionMessage = new ReactionMessage(chat, "❤️", message || id);

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
```

## Lendo resposas de ButtonMessage e ListMessage

```ts
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

## Bot

- Definir foto de perfil

```ts
bot.setProfile(new Buffer(""));
```

- Obter foto de perfil do bot

```ts
bot.getProfile();
```

- Definir nome do bot

```ts
bot.setBotName("Name");
```

- Definir descrição do bot

```ts
bot.setDescription("Description");
```

- Obter descrição do bot

```ts
bot.getDescription();
```

## Grupo

Você pode obter o chat em `message.chat` ou `bot.getChat("id")`, o ID pode ser encontrado em `message.chat.id`

- Criar grupo

```ts
bot.createChat("name");
```

- Sair de um grupo

```ts
bot.leaveChat(chat);
```

- Definir imagem do grupo

```ts
bot.setProfile(new Buffer(""), chat);
```

- Obter imagem do grupo

```ts
bot.getProfile(chat);
```

- Definir nome do grupo

```ts
bot.setChatName("Name chat", chat);
```

- Definir a descrição do grupo

```ts
bot.setDescription("Chat description");
```

- Obter descrição do grupo

```ts
bot.getDescription(chat);
```

- Adicionar membro
  - Você pode encontrar o user em `message.user` ou em `chat.getMember("id")`, o ID pode se encontrado em `message.user.id`

```ts
bot.addMember(chat, user);
```

- Remover membro

```ts
bot.removeMember(chat, user);
```

## 🛠️ Construído com

Esse Software foi construído com:

- [Baileys](https://github.com/adiwajshing/Baileys) - API para se conectar ao WhatsApp

## 📄 Licença

Este projeto está sob a licença MIT - veja o arquivo [LICENSE.md](https://github.com/laxeder/multi-bot/LICENSE) para mais detalhes.
