# Rompot

Um chatbot multi-plataforma em TypeScript.

## 🛠 Recursos

- Multi plataformas
  - WhatsApp
  - Telegram (Em breve)
- Automatização de mensagem
- Criação de comandos
- Simples uso

### 🔧 Instalação

Instalando pacote

```sh
npm i rompot
```

Importando API

```ts
// TypeScript
import { Client, WhatsAppBot } from "rompot";

// Javascript
const { Client, WhatsAppBot } = require("rompot");
```

## WhatsApp

Após iniciar o bot um QR Code será emprimido no terminal, escane-o com seu WhatsApp para gerar uma nova conexão entre seu número e o Client. Essa conexão será guardada em `./path-to-auth`, para gerar uma nova delete-o ou se conecte com um novo caminho de sessão.

```ts
const client = new Client(new WhatsAppBot())
client.connect("./path-to-auth");

client.on("qr", (qr) => {
  console.log("Scan QR:" qr)
})
```

## Configurações

```ts
type ConnectionConfig = {
  /** * Configuração dos comandos */
  commandConfig: CommandConfig;
  /** * Desabilita comandos automaticos */
  disableAutoCommand?: boolean;
  /** * Desabilita escrevndo automatico */
  disableAutoTyping?: boolean;
  /** * Desabilita a visualização automatica das mensagem recebidas */
  disableAutoRead?: boolean;
};

const config: ConnectionConfig = {};

client.config = config;
```

## ⚙️ Criando comandos

```ts
import { Command, Message } from "rompot";

// Cria um comando com o nome Hello
// Ao ser executado envia a mensagem "Hello World!"
class HelloCommand extends Command {
  tags: string[] = ["hello"];
  prefix: string = "/";

  public async execute(message: Message) {
    await message.reply(`Hello World!`);
  }
}

// Cria um comando com os nomes date, dt e data
// Executa uma função quando chamado
class DateCommand extends Command {
  tags: string[] = ["date"];
  prefix: string = "/";

  public async execute(message: Message) {
    await message.reply(`Data: ${new Date()}`);
  }
}

// Listando comandos
const commands = [new HelloCommand(), new DateCommand()];

client.setCommands(commands);
```

## Eventos

### Conexão

```ts
client.on("open", (open) => {
  console.log("Client conectado!");
});

client.on("close", (close) => {
  console.log("Client desconectado!");
});

client.on("closed", (closed) => {
  console.log("Conexão com o bot encerrada!");
});

client.on("connecting", (conn) => {
  console.log("Conectando bot");
});

client.on("reconnecting", (conn) => {
  console.log("Reconectando bot");
});
```

### Mensagem

```ts
client.on("message", (message) => {
  console.log(`Mensagem recebida de ${message.user.name}`);

  if (message.text == "Oi") {
    message.reply("Olá");
  }
});
```

### Usuários

```ts
client.on("user", async (update) => {
  if (update.action == "join") {
    await client.send(new Message(update.chat, `@${update.fromUser.id} entrou no grupo.`));
  }

  if (update.action == "leave") {
    await client.send(new Message(update.chat, `@${update.fromUser.id} saiu do grupo...`));
  }

  if (update.action == "add") {
    await client.send(new Message(update.chat, `Membro @${update.fromUser.id} adicionou o @${update.user.id} ao grupo!`));
  }

  if (update.action == "remove") {
    client.send(new Message(update.chat, `Membro @${update.fromUser.id} removeu o @${update.user.id} do grupo.`));
  }

  if (update.action == "promote") {
    client.send(new Message(update.chat, `Membro @${update.fromUser.id} promoveu o @${update.user.id} para admin!`));
  }

  if (update.action == "demote") {
    await client.send(new Message(update.chat, `Membro @${update.fromUser.id} removeu o admin do @${update.user.id}.`));
  }
});
```

### Erro interno

```ts
client.on("error", (err: any) => {
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
client.send(msg);

// Mencionar usuário
msg.mentions.push("userId");

// Marcar mensagem
msg.mention = message;

// Ativa as funções da mensagen
msg.client = client;

// Responder mensagem
msg.reply(message);

// Visualiza uma mensagem recebida
msg.read();

// Reage a mensagem
msg.addReaction("❤");

// remove a reação de uma mensagem
msg.removeReaction();
```

## Mensagem de mídia

```ts
import { ImageMessage, VideoMessage, AudioMessage, FileMessage, StickerMessage, LocationMessage, ContactMessage } from "rompot";

// Criar mensagem com imagem
const imageMessage = new ImageMessage(chat, "texto", Buffer.from(""));

// Criar mensagem com video
const videoMessage = new VideoMessage(chat, "texto", Buffer.from(""));

// Criar mensagem de audio
const audioMessage = new AudioMessage(chat, "texto", Buffer.from(""));

// Criar mensagem de arquivo (Beta)
const fileMessage = new FileMessage(chat, "texto", Buffer.from(""));

// Criar mensagem de sticker
const stickerMessage = new StickerMessage(chat, Buffer.from(""));

// Criar mensagem de localiação
// Latitude, Longitude
const locationMessage = new LocationMessage(chat, 24.121231, 55.1121221);

// Criar mensagem com contatos
const contactMessage = new ContactMessage(chat, "nome", "userId");
```

## Outros tipos de mensagem

```ts
import { ButtonMessage, ListMessage, PollMessage } from "rompot";

// Criando botões
const btnMessage = new ButtonMessage(chat, "texto", "rodapé");
btnMessage.addCall("Call", "1234567890");
btnMessage.addUrl("Link", "https://example.com");
btnMessage.addReply("Texto", "button-id-123");

// Criar lista
const listMessage = new ListMessage(chat, "texto", "botão", "titulo", "rodapé");
const index1 = listMessage.addCategory("Categoria 1");
const index2 = listMessage.addCategory("Categoria 2");

listMessage.addItem(index1, "Item 1");
listMessage.addItem(index1, "Item 2");

listMessage.addItem(index2, "Abc 1");
listMessage.addItem(index2, "Abc 2");

// Criar enquete
const pollMessage = new PollMessage(chat, "Hello World!");

pollMessage.addOption("Hello", "id-hello-123");
pollMessage.addOption("Hey", "id-hey-123");
pollMessage.addOption("Hi", "id-hi-123");
```

## Lendo resposas de ButtonMessage, ListMessage e PollMessage

```ts
import { Command, PollUpdateMessage } from "rompot";

class ButtonCommand extends Command {
  tags: string[] = ["cmd-button"];

  public async response(message: Message) {
    await message.reply(`Button Clicked!`);
  }
}

client.on("message", async (message: Message) => {
  if (message instanceof PollUpdateMessage) {
    if (message.action == "remove") return;
  }

  if (message.selected == "button-id-123") {
    const cmd = client.getCommand("cmd-button");

    if (cmd) {
      cmd.response(message);
    }
  }
}):
```

## Bot

- Definir foto de perfil

```ts
client.setBotProfile(Buffer.from(""));
```

- Obter foto de perfil do bot

```ts
client.getBotProfile();
```

- Definir nome do bot

```ts
client.setBotName("Name");
```

- Definir descrição do bot

```ts
client.setBotDescription("Description");
```

- Obter descrição do bot

```ts
client.getBotDescription();
```

## Grupo

Você pode obter o chat em `message.chat` ou `client.getChat("id")`, o ID pode ser encontrado em `message.chat.id`

- Criar grupo

```ts
client.createChat("name");
```

- Sair de um grupo

```ts
client.leaveChat(chat);
```

- Definir imagem do grupo

```ts
client.setChatProfile(chat, Buffer.from(""));
```

- Obter imagem do grupo

```ts
client.getChatProfile(chat);
```

- Definir nome do grupo

```ts
client.setChatName(chat, "Name chat");
```

- Obter nome do grupo

```ts
client.getChatName(chat);
```

- Definir a descrição do grupo

```ts
client.setChatDescription(chat, "Chat description");
```

- Obter descrição do grupo

```ts
client.getChatDescription(chat);
```

- Adicionar membro
  - Você pode encontrar o user em `message.user` ou em `chat.getUser("id")`, o ID pode se encontrado em `message.user.id`

```ts
client.addUserInChat(chat, user);
```

- Remover membro

```ts
client.removeUserInChat(chat, user);
```

- Promover membro

```ts
client.promoteUserInChat(chat, user);
```

- Despromover membro

```ts
client.demoteUserInChat(chat, user);
```


## 🛠️ Construído com

Esse Software foi construído com:

- [Baileys@5.0.0](https://github.com/adiwajshing/Baileys) - API para se conectar ao WhatsApp

## 📄 Licença

Este projeto está sob a licença MIT - veja o arquivo [LICENSE.md](https://github.com/laxeder/multi-bot/LICENSE) para mais detalhes.
