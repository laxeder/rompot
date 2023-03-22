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
type BuildConfig = {
  /** * Configuração dos comandos */
  commandConfig: CommandConfig;
  /** * Desabilita comandos automaticos */
  disableAutoCommand?: boolean;
  /** * Desabilita escrevndo automatico */
  disableAutoTyping?: boolean;
  /** * Desabilita a visualização automatica das mensagem recebidas */
  disableAutoRead?: boolean;
};
```

## ⚙️ Criando comandos

```ts
import { Command, Message } from "rompot";

// Cria um comando com o nome Hello
// Ao ser executado envia a mensagem "Hello World!"
class HelloCommand extends Command {
  tags: string[] = ["hello"];
  prefix: string = "/";

  public async execute(message: Message): Promise<void> {
    await message.reply(`Hello World!`);
  }
}

// Cria um comando com os nomes date, dt e data
// Executa uma função quando chamado
class DateCommand extends Command {
  tags: string[] = ["date"];
  prefix: string = "/";

  public async execute(message: Message): Promise<void> {
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

### Membros

```ts
client.on("member", (member) => {
  // Novo membro de um grupo
  if (member.action == "add") {
    const msg = new Message(member.chat, `Bem vindo ao grupo @${member.user.id}`);
    msg.addMentions(member.user.id);
    client.send(msg);
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
msg.addMentions("user.id");

// Marcar mensagem
msg.setMention(message);

// Ativa as funções da mensagen
msg.client = client;

// Responder mensagem
msg.reply(message);

// Visualiza uma mensagem recebida
msg.read();

// Reage a mensagem
msg.addReaction("❤");
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
const listMessage = new ListMessage(chat, "texto", "botão", "titulo", "rodapé");
const index1 = listMessage.addCategory("Categoria 1");
const index2 = listMessage.addCategory("Categoria 2");

listMessage.addItem(index1, "Item 1");
listMessage.addItem(index1, "Item 2");

listMessage.addItem(index2, "Abc 1");
listMessage.addItem(index2, "Abc 2");
```

## Lendo resposas de ButtonMessage e ListMessage

```ts
class ButtonCommand extends Command {
  tags: string[] = ["cmd-button"];
  
  public async reply(message: Message): Promise<void> {
    await message.reply(`Button Clicked!`);
  }
}

client.on("message", async (message: Message) => {
  if (message.selected == "button-id-123") {
    client.commands.get("cmd-button")?.reply(message);
  }
}):
```

## Client

- Definir foto de perfil

```ts
client.setBotProfile(new Buffer(""));
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
client.setChatProfile(chat, new Buffer(""));
```

- Obter imagem do grupo

```ts
client.getProfile(chat);
```

- Definir nome do grupo

```ts
client.setChatName(chat, "Name chat");
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
  - Você pode encontrar o user em `message.user` ou em `chat.getMember("id")`, o ID pode se encontrado em `message.user.id`

```ts
client.addUserInChat(chat, user);
```

- Remover membro

```ts
client.removeUserInChat(chat, user);
```

## 🛠️ Construído com

Esse Software foi construído com:

- [Baileys@5.0.0](https://github.com/adiwajshing/Baileys) - API para se conectar ao WhatsApp

## 📄 Licença

Este projeto está sob a licença MIT - veja o arquivo [LICENSE.md](https://github.com/laxeder/multi-bot/LICENSE) para mais detalhes.
