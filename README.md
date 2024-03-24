# Rompot

Uma biblioteca para desenvolvimento de ChatBot multi-plataforma em JavaScript/TypeScript

## 🛠 Recursos

- Multi plataformas
  - WhatsApp (baileys@6.6.0)
  - Telegram (node-telegram-bot-api@0.64.0) - beta
- Automatização de mensagem
- Suporte a Cluster
- Criação de comandos
- Simples uso
- Tratamento de solicitações
- Envio de lista

### 🔧 Instalação

Instalando pacote

```sh
npm i rompot
```

Importando pacote

```ts
// TypeScript
import Client, { WhatsAppBot, TelegramBot } from "rompot";

// Javascript
const { Client, WhatsAppBot, TelegramBot } = require("rompot");
```

## WhatsApp

Após iniciar o bot um QR Code será emprimido no terminal, escane-o com seu WhatsApp para gerar uma nova conexão entre seu número e o Client. Essa conexão será guardada em `./path-to-auth`, para gerar uma nova delete-o ou se conecte com um novo caminho de sessão.

```ts
const client = new Client(new WhatsAppBot());
client.connect("./path-to-auth");

client.on("qr", (qr) => {
  console.log("Scan QR:", qr);
});
```

## Parear código

Necessita passar um método de autenticação personalizado incluindo o número do bot a ser conectado.

```ts
import Client, { WhatsAppBot, MultiFileAuthState } from "rompot";

const client = new Client(new WhatsAppBot());

client.on("code", (code) => {
  console.info("Código de pareamento gerado:", code);
});

const botPhoneNumber = "5511991234567";

const auth = new MultiFileAuthState("./path-to-auth", botPhoneNumber));

await client.connect(auth);
```

## Telegram (Beta)

Altere o valor `BOT_TOKEN` para o token do seu bot para se conectar a ele, acaso não tenha consulte a documentação do [Telegram](https://core.telegram.org/bots/api) para gerar um.

```ts
const client = new Client(new TelegramBot());
client.connect("BOT_TOKEN");

client.on("open", () => {
  console.log("Bot conectado!");
});
```

## Configurações

```ts
type ConnectionConfig = {
  /** Desativa execução do comando automático */
  disableAutoCommand: boolean;
  /** Desativa os comandos para mensagem antiga */
  disableAutoCommandForOldMessage: boolean;
  /** Desativa a execução do comando automático para mensagens não oficiais */
  disableAutoCommandForUnofficialMessage: boolean;
  /** Desativa a digitação automatica */
  disableAutoTyping: boolean;
  /** Desativa a leitura automatica de uma mensagem */
  disableAutoRead: boolean;
  /** Máximo de reconexões possíveis */
  maxReconnectTimes: number;
  /** Tempo de aguarde para se reconectar */
  reconnectTimeout: number;
  /** Máximo de tentativas de solitação acaso a primeira falhe */
  maxRequests: number;
  /** Tempo necessário de aguardo para próxima tentativa de solicitação */
  requestsDelay: number;
  /** Tempo máximo de espera */
  maxTimeout: number;
};

client.config = config;
```

## ⚙️ Criando comandos

```ts
import { CMDKey, Command, Message } from "rompot";

// Cria um comando com o nome hello
// Ao ser executado envia a mensagem "Hello World!"
class HelloCommand extends Command {
  public onRead() {
    this.keys = [CMDKey("hello")];
  }

  public async onExec(message: Message) {
    await message.reply(`Hello World!`);
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
  console.log("Cliente conectado!");
});

client.on("close", (update) => {
  console.info(`Cliente desconectou! Motivo: ${update.reason}`);
});

client.on("stop", (update) => {
  if (update.isLogout) {
    console.info(`Cliente desligado!`);
  } else {
    console.info(`Cliente parado!`);
  }
});

client.on("connecting", (conn) => {
  console.log("Conectando cliente...");
});

client.on("reconnecting", (conn) => {
  console.log("Reconectando cliente...");
});
```

### Mensagem

```ts
client.on("message", (message) => {
  console.log(`Mensagem recebida de "${message.user.name}"`);

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
client.on("error", (err) => {
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
const saveMsg = await client.send(msg);

// Edita uma mensagem enviada
await client.editMessage(saveMsg, "novo texto");

// Mencionar usuário
msg.mentions.push("userId");

// Marcar mensagem
msg.mention = message;

// Responder mensagem
msg.reply(message);

// Visualiza uma mensagem recebida
msg.read();

// Reage a mensagem
msg.addReaction("❤");

// Remove a reação de uma mensagem
msg.removeReaction();
```

## Mensagem de mídia

```ts
import { ImageMessage, VideoMessage, AudioMessage, FileMessage, StickerMessage, LocationMessage, ContactMessage } from "rompot";

// Criar mensagem de audio
const audioMessage = new AudioMessage(chat, Buffer.from(""));

// Criar mensagem com imagem
const imageMessage = new ImageMessage(chat, "texto", Buffer.from(""));

// Criar mensagem com video
const videoMessage = new VideoMessage(chat, "texto", Buffer.from(""));

// Criar mensagem de arquivo
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
import { Command, Message, CMDKey, CMDRunType, isPollMessage } from "rompot";

class ButtonCommand extends Command {
  public onRead() {
    this.keys = [CMDKey("cmd-button")];
  }

  // Recebe uma resposta ao comando
  public async onReply(message: Message) {
    await message.reply(`Button Clicked!`);
  }
}

client.addCommand(new ButtonCommand());

client.on("message", async (message: Message) => {
  if (isPollMessage(message)) {
    // Não responde caso a votação da enquete for removida
    if (message.action == "remove") return;
  }

  // Verifica o ID passado na mensagem como opção
  if (message.selected == "button-id-123") {
    const cmd = client.getCommand("cmd-button");

    // Manda a resposta ao comando
    if (cmd) client.runCommand(cmd, message, CMDRunType.Reply);
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
  - Você pode encontrar o user em `message.user`, o ID pode se encontrado em `message.user.id`

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

## 📄 Licença

Este projeto está sob a licença MIT - veja o arquivo [LICENSE](https://github.com/Laxeder/rompot/blob/main/LICENSE) para mais detalhes.
