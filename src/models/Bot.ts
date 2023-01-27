import { ConnectionConfig } from "@config/ConnectionConfig";
import PromiseMessages from "@utils/PromiseMessages";
import { BotInterface } from "@models/BotInterface";
import { StatusTypes } from "../types/Status";
import { Commands } from "@models/Commands";
import { Message } from "@messages/Message";
import { Emmiter } from "@utils/Emmiter";
import { getError } from "@utils/error";
import { Status } from "@models/Status";
import { PubSub } from "@utils/PubSub";
import { Chat } from "@models/Chat";
import { User } from "@models/User";
import sleep from "@utils/sleep";

export default class BotModule extends Emmiter {
  public promiseMessages: PromiseMessages;
  public pb: PubSub;

  public autoMessages: any = {};

  public bot: BotInterface;
  public config: ConnectionConfig;
  public status: StatusTypes;
  public commands: Commands;
  public id: string;

  constructor(bot: BotInterface) {
    super();

    this.promiseMessages = new PromiseMessages();
    this.pb = new PubSub();

    this.bot = bot;
    this.config = { auth: "./session" };
    this.status = "offline";
    this.id = "";

    this.commands = new Commands(this);
    this.commands.setBot(this);
  }

  /**
   * * Constrói um novo bot
   * @param bot Instância do bot que será construído
   * @returns Bot construído
   */

  public static Build<Bot extends BotInterface>(bot: Bot) {
    class BotBuild extends BotModule {
      public bot: Bot;

      constructor(bot: Bot) {
        super(bot);
        this.bot = bot;
      }
    }

    const botBuild = new BotBuild(bot);
    botBuild.configEvents();

    return { ...bot, ...botBuild };
  }

  public configEvents() {
    this.on("message", (message: Message) => {
      if (this.config.disableAutoCommand) return;
      if (message.fromMe && !this.config.autoRunBotCommand) return;

      const command = this.getCommand(message.text);

      if (command) command.execute(message);
    });

    this.on("me", (message: Message) => {
      if (!this.config.autoRunBotCommand || this.config.receiveAllMessages) return;

      const command = this.getCommand(message.text);

      if (command) command.execute(message);
    });
  }

  /**
   * * Define a lista de comandos
   * @param commands
   */
  public setCommands(commands: Commands) {
    this.commands = commands;
    this.commands.setBot(this);
  }

  /**
   * * Retorna um comando
   * @param cmd
   * @param commands
   * @returns
   */
  public getCommand(cmd: string | string[], commands: Commands = this.getCommands()) {
    return commands.getCommand(cmd);
  }

  /**
   * * Retorna os comandos do bot
   * @returns
   */
  public getCommands(): Commands {
    return this.commands;
  }

  /**
   * * Envia um conteúdo
   * @param content
   * @returns
   */
  public async send(content: Message | Status): Promise<any | Message> {
    //TODO: Fazer mapa dos valores que são retornados como o do emmiter

    if (content instanceof Message) {
      return await this.sendMessage(content);
    }

    if (content instanceof Status) {
      return this.sendStatus(content);
    }
  }

  /**
   * * Adiciona uma chamada há uma lista de chamadas para serem chamadas
   * @param fn
   * @returns
   */
  public add(fn: Function): Promise<any> {
    return new Promise((resolve, reject) => {
      this.pb.sub(async () => {
        try {
          resolve(await fn());
        } catch (err) {
          this.emit("error", getError(err));
          reject(err);
        }
      });
    });
  }

  /**
   * * Aguarda uma mensagem ser recebida em uma sala de bate-papo
   * @param chatId Sala de bate-papo que irá receber a mensagem
   * @param ignoreMessageFromMe Ignora a mensagem se quem enviou foi o próprio bot
   * @param stopRead Para de ler a mensagem no evento
   * @param ignoreMessages Não resolve a promessa se a mensagem recebida é a mesma escolhida
   * @returns
   */
  public awaitMessage(
    chat: Chat | string,
    ignoreMessageFromMe: boolean = true,
    stopRead: boolean = true,
    ...ignoreMessages: Message[]
  ): Promise<any> {
    if (chat instanceof Chat) return this.awaitMessage(chat.id, ignoreMessageFromMe, stopRead, ...ignoreMessages);

    return this.promiseMessages.addPromiseMessage(chat, ignoreMessageFromMe, stopRead, ...ignoreMessages);
  }

  /**
   * * Automotiza uma mensagem
   * @param message
   * @param timeout
   * @param chats
   * @param id
   * @returns
   */
  public async addAutomate(
    message: Message,
    timeout: number,
    chats?: { [key: string]: Chat },
    id: string = String(Date.now())
  ): Promise<any> {
    const now = Date.now();

    // Criar e atualizar dados da mensagem automatizada
    this.autoMessages[id] = { id, chats: chats || (await this.getChats()), updatedAt: now, message };

    // Aguarda o tempo definido
    await sleep(timeout - now);

    // Cancelar se estiver desatualizado
    if (this.autoMessages[id].updatedAt !== now) return;

    await Promise.all(
      this.autoMessages[id].chats.map(async (chat: Chat) => {
        const automated: any = this.autoMessages[id];

        if (automated.updatedAt !== now) return;

        automated.message?.setChat(chat);

        // Enviar mensagem
        await this.send(automated.message);

        // Remover sala de bate-papo da mensagem
        const nowChats = automated.chats;
        const index = nowChats.indexOf(automated.chats[chat.id]);
        this.autoMessages[id].chats = nowChats.splice(index + 1, nowChats.length);
      })
    );
  }

  //! ****************** Bot functions ******************

  public async sendMessage(message: Message): Promise<Message> {
    return message;
  }
  public async sendStatus(status: Status): Promise<any> {}

  public async connect(auth: any, config?: any): Promise<any> {}
  public async reconnect(config?: any): Promise<any> {}
  public async stop(reason?: any): Promise<any> {}

  public async getChat(id: string): Promise<any> {}
  public async setChat(chat: Chat) {}

  public async getChats(): Promise<any> {}
  public async setChats(chat: { [key: string]: Chat }) {}

  public async removeChat(id: Chat | string) {}
  public async addMember(chat: Chat, user: User) {}
  public async removeMember(chat: Chat, user: User) {}

  public async deleteMessage(message: Message): Promise<any> {}
  public async removeMessage(message: Message): Promise<any> {}
  public async deleteChat(message: Message): Promise<any> {}

  public async setDescription(desc: string, id?: Chat | string): Promise<any> {}
  public async getDescription(id?: User | string): Promise<any> {}

  public async setChatName(id: Chat | string, name: string): Promise<any> {}
  public async createChat(name: string): Promise<any> {}
  public async leaveChat(chat: Chat | string): Promise<any> {}

  public async unblockUser(user: User): Promise<any> {}
  public async blockUser(user: User): Promise<any> {}

  public async setBotName(name: string): Promise<any> {}

  public async setProfile(image: Buffer, id?: Chat | string): Promise<any> {}
  public async getProfile(id?: Chat | User | string): Promise<any> {}
}
