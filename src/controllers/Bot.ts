import { Subject, map } from "rxjs";
import { uuid } from "uuidv4";

import { BuildConfig } from "@config/BuildConfig";
import { DataBase } from "@controllers/DataBase";
import { EventsName } from "../types/Events";
import { Commands } from "@models/Commands";
import { Message } from "@messages/Message";
import { BaseDB } from "@services/BaseDB";
import { BaseBot } from "@utils/BaseBot";
import { Status } from "@models/Status";
import { Chat } from "@models/Chat";
import { User } from "@models/User";

export class Bot {
  private _awaitSendMessages: Subject<any> = new Subject();
  private _awaitSendMessagesObservers: any[] = [];
  private _autoMessages: any = {};
  private _plataform: BaseBot;
  private _db: DataBase;

  public config: BuildConfig = {};
  public commands: Commands;

  constructor(plataform: BaseBot, commands: Commands = new Commands(), db: DataBase = new DataBase(new BaseDB())) {
    this._plataform = plataform;
    this.commands = commands;
    this._db = db;

    this.setCommands(commands);
  }

  public setCommands(commands: Commands) {
    commands.setBot(this);
    this.commands = commands;
  }

  /**
   * * Construir bot
   * @param auth
   * @param config
   */
  public build(auth: string, config: BuildConfig = {}): Promise<any> {
    this.config = config;

    this.on("message", (message: Message) => {
      if (this.config.disableAutoCommand) return;

      const command = this.getCMD(message.text);

      if (command) command.execute(message);
    });

    return this._plataform.connect(auth, config);
  }

  /**
   * * Reconstruir o bot
   * @param config
   * @returns
   */
  public async rebuild(config: BuildConfig = this.config): Promise<any> {
    this.config = config;

    return this._plataform?.reconnect(this.config);
  }

  /**
   * * Obter Bot
   * @returns
   */
  public getBot(): BaseBot {
    return this._plataform;
  }

  /**
   * * Retorna um comando
   * @param cmd
   * @param commands
   * @returns
   */
  public getCMD(cmd: string, commands: Commands = this.commands) {
    const text = cmd.split(/\s+/i)[0];
    const lowText = text.toLowerCase().trim();

    return commands.get([cmd, text, lowText]);
  }

  /**
   * * Obter DataBase
   * @returns
   */
  public getDB(): DataBase {
    return this._db;
  }

  /**
   * * Definir DataBase
   */
  public setDB(DB: DataBase) {
    this._db = DB;
  }

  /**
   * * Retorna o status do bot
   * @returns
   */
  public getStatus(): Status {
    return this._plataform.status;
  }

  /**
   * * Retorna uma salade bate-papo
   * @param id
   * @returns
   */
  public getChat(id: string) {
    return this._plataform.getChat(id);
  }

  /**
   * * Retorna todas as salas de bate-papo
   * @returns
   */
  public getChats() {
    return this._plataform.getChats();
  }

  /**
   * * Define uma sala de bate-papo
   * @param chat
   */
  public async setChat(chat: Chat) {
    await this._plataform.setChat(chat);
  }

  /**
   * * Define as salas de bate-papo
   * @param chats
   */
  public async setChats(chats: { [key: string]: Chat }) {
    await this._plataform.setChats(chats);
  }

  /**
   * * Remove uma sala de bate-papo
   * @param id
   */
  public async removeChat(id: Chat | string) {
    await this._plataform.removeChat(id);
  }

  /**
   * * Adiciona um usuário a uma sala de bate-papo
   * @param chat
   * @param user
   */
  public async addMember(chat: Chat, user: User) {
    await this._plataform.addMember(chat, user);
  }

  /**
   * * Remove um usuário da sala de bate-papo
   * @param chat
   * @param user
   */
  public async removeMember(chat: Chat, user: User) {
    await this._plataform.removeMember(chat, user);
  }

  /**
   * * Remove uma mensagem da sala de bate-papo
   * @param message
   * @returns
   */
  public async removeMessage(message: Message) {
    return this._plataform.removeMessage(message);
  }

  /**
   * * Deleta uma mensagem da sala de bate-papo
   * @param message
   * @returns
   */
  public async deleteMessage(message: Message) {
    return this._plataform.deleteMessage(message);
  }

  /**
   * * Adiciona um evento
   * @param name
   * @param event
   */
  public on(name: keyof EventsName, event: Function) {
    return this._plataform.on(
      name,
      event,
      map((v: any) => {
        if (v instanceof Message) {
          v.setBot(this);
          v.chat.setBot(this);

          if (!this.config.disableAutoRead) v.read();
        }

        if (v instanceof Chat) {
          v.setBot(this);
        }

        return v;
      })
    );
  }

  /**
   * * Envia um conteúdo
   * @param content
   * @returns
   */
  public async send(content: Message | Status, interval?: number): Promise<any | Message> {
    if (content instanceof Message) {
      return await this.addMessage(content, interval);
    }

    return this._plataform.send(content);
  }

  /**
   * * Adiciona a mensagem há uma lista de mensagens para serem enviadas
   * @param message
   * @param interval
   * @returns
   */
  public addMessage(message: Message, interval: number = 1000): Promise<Message> {
    return new Promise((resolve, reject) => {
      const observer = this._awaitSendMessages.subscribe(async (obs) => {
        try {
          if (obs !== observer) return;

          await this.sleep(interval);
          const sendedMSG = await this._plataform.send(message);

          observer.unsubscribe();

          const index = this._awaitSendMessagesObservers.indexOf(observer);
          this._awaitSendMessagesObservers.splice(index, 1);

          if (this._awaitSendMessagesObservers.length > 0) {
            this._awaitSendMessages.next(this._awaitSendMessagesObservers[index]);
          }

          resolve(sendedMSG);
        } catch (err) {
          reject(err);
        }
      });

      this._awaitSendMessagesObservers.push(observer);

      if (this._awaitSendMessagesObservers.length <= 1) {
        this._awaitSendMessages.next(observer);
      }
    });
  }

  /**
   * * Cria um tempo de espera
   * @param timeout
   * @returns
   */
  public sleep(timeout: number = 1000): Promise<any> {
    return new Promise((resolve) => setTimeout(resolve, timeout));
  }

  /**
   * * Automotiza uma mensagem
   * @param message
   * @param timeout
   * @param interval
   * @param chats
   * @param id
   * @returns
   */
  public async addAutomate(
    message: Message,
    timeout: number,
    interval?: number,
    chats?: { [key: string]: Chat },
    id: string = uuid()
  ): Promise<any> {
    const now = Date.now();

    // Criar e atualizar dados da mensagem automatizada
    this._autoMessages[id] = { id, chats: chats || await this.getChats(), updatedAt: now, message };

    // Aguarda o tempo definido
    await this.sleep(timeout - now);

    // Cancelar se estiver desatualizado
    if (this._autoMessages[id].updatedAt !== now) return;

    await Promise.all(
      this._autoMessages[id].chats.map(async (chat: Chat) => {
        const automated: any = this._autoMessages[id];

        if (automated.updatedAt !== now) return;

        automated.message?.setChat(chat);

        // Enviar mensagem
        await this.send(automated.message, interval);

        // Remover sala de bate-papo da mensagem
        const nowChats = automated.chats;
        const index = nowChats.indexOf(automated.chats[chat.id]);
        this._autoMessages[id].chats = nowChats.splice(index + 1, nowChats.length);
      })
    );
  }
}
