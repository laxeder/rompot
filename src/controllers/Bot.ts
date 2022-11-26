import { Subject } from "rxjs";
import { uuid } from "uuidv4";

import { DataBase } from "@controllers/DataBase";
import { Commands } from "@models/Commands";
import { BaseDB } from "@services/BaseDB";
import { Message } from "@models/Message";
import { BaseBot } from "@utils/BaseBot";
import { Status } from "@models/Status";
import { Chat } from "@models/Chat";

export class Bot {
  private _awaitSendMessages: Subject<any> = new Subject();
  private _awaitSendMessagesObservers: any[] = [];
  private _autoMessages: any = {};
  private _plataform: BaseBot;
  private _db: DataBase;

  public commands: Commands;

  constructor(plataform: BaseBot, commands: Commands = new Commands(), db: DataBase = new DataBase(new BaseDB())) {
    this._plataform = plataform;
    this.commands = commands;
    this._db = db;
  }

  /**
   * * Construir bot
   * @param auth
   * @param config
   */
  public build(auth: string, config?: any): Promise<any> {
    return this._plataform.connect(auth, config);
  }

  /**
   * * Reconstruir o bot
   * @param config
   * @returns
   */
  public rebuild(config?: any): Promise<any> {
    return this._plataform.reconnect(config);
  }

  /**
   * * Obter Bot
   * @returns
   */
  public get(): BaseBot {
    return this._plataform;
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
  public getChat(id: string): Chat | undefined {
    return this._plataform.chats[id];
  }

  /**
   * * Retorna todas as salas de bate-papo
   * @returns
   */
  public getChats(): { [key: string]: Chat } {
    return this._plataform.chats;
  }

  /**
   * * Adiciona um evento
   * @param eventName
   * @param event
   */
  public addEvent(eventName: "chats" | "messages" | "connection", event: any) {
    this._plataform.addEvent(eventName, event);
  }

  /**
   * * Envia um conteúdo
   * @param content
   * @returns
   */
  public async send(content: Message | Status, interval?: number): Promise<any> {
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
  public addMessage(message: Message, interval: number = 1000): Promise<any> {
    return new Promise((resolve, reject) => {
      const observer = this._awaitSendMessages.subscribe(async (obs) => {
        try {
          if (obs !== observer) return;

          await this.sleep(interval);
          await this._plataform.send(message);

          observer.unsubscribe();

          const index = this._awaitSendMessagesObservers.indexOf(observer);
          this._awaitSendMessagesObservers.splice(index, 1);

          if (this._awaitSendMessagesObservers.length > 0) {
            this._awaitSendMessages.next(this._awaitSendMessagesObservers[index]);
          }

          resolve(null);
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
    this._autoMessages[id] = { id, chats: chats || this.getChats(), updatedAt: now, message };

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
