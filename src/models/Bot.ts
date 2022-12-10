import { BehaviorSubject, catchError, map, of, OperatorFunction, Subject } from "rxjs";

import { Events, EventsName } from "../types/index";
import { BuildConfig } from "@config/BuildConfig";
import { Commands } from "@models/Commands";
import { Message } from "@messages/Message";
import { Status } from "@models/Status";
import { Chat } from "@models/Chat";
import { User } from "@models/User";
import { uuid } from "uuidv4";

export class Bot {
  public events: Events = {
    connection: new BehaviorSubject({}),
    "bot-message": new Subject(),
    message: new Subject(),
    member: new Subject(),
    chat: new Subject(),
    error: new Subject(),
  };

  private _await: Subject<any> = new Subject();
  private _awaitObv: any[] = [];

  private _autoMessages: any = {};
  private _commands?: Commands;

  public status: Status = new Status("offline");
  public config: BuildConfig | any = {};
  public id: string = "";

  constructor(commands?: Commands) {
    if (commands) {
      this.setCommands(commands);
    }

    this.on("message", (message: Message) => {
      if (this.config.disableAutoCommand) return;

      const command = this.getCommand(message.text);

      if (command) command.execute(message);
    });
  }

  /**
   * * Adiciona um evento
   * @param eventName
   * @param event
   * @returns
   */
  on(eventName: keyof EventsName, event: any, pipe?: OperatorFunction<any, unknown>) {
    const error = catchError((err) => {
      this.events.error.next(err);
      return of("Error in event");
    });

    const m = map((v: any) => {
      if (v.setBot) {
        v.setBot(this);
      }

      return v;
    });

    if (!!!pipe) return this.events[eventName].pipe(error, m).subscribe(event);
    return this.events[eventName].pipe(error, pipe, m).subscribe(event);
  }

  /**
   * * Define a lista de comandos
   * @param commands
   */
  public setCommands(commands: Commands) {
    this._commands = commands;
    this._commands.setBot(this);
  }

  /**
   * * Retorna um comando
   * @param cmd
   * @param commands
   * @returns
   */
  public getCommand(cmd: string, commands: Commands = this.getCommands()) {
    const text = cmd.split(/\s+/i)[0];
    const lowText = text.toLowerCase().trim();

    return commands.get([cmd, text, lowText]);
  }

  /**
   * * Retorna os comandos do bot
   * @returns
   */
  public getCommands(): Commands {
    if (!this._commands) {
      this._commands = new Commands({}, this);
    }

    return this._commands;
  }

  /**
   * * Retorna o status do bot
   * @returns
   */
  public getStatus(): Status {
    return this.status;
  }

  /**
   * * Envia um conteúdo
   * @param content
   * @returns
   */
  public async send(content: Message | Status): Promise<any | Message> {
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
      const observer = this._await.subscribe(async (obs) => {
        try {
          if (obs !== observer) return;

          try {
            var response = await fn();
          } catch (e) {
            reject(e);
          }

          observer.unsubscribe();

          const index = this._awaitObv.indexOf(observer);
          this._awaitObv.splice(index, 1);

          if (this._awaitObv.length > 0) {
            this._await.next(this._awaitObv[index]);
          }

          resolve(response);
        } catch (err) {
          reject(err);
        }
      });

      this._awaitObv.push(observer);

      if (this._awaitObv.length <= 1) {
        this._await.next(observer);
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
   * @param chats
   * @param id
   * @returns
   */
  public async addAutomate(
    message: Message,
    timeout: number,
    chats?: { [key: string]: Chat },
    id: string = uuid()
  ): Promise<any> {
    const now = Date.now();

    // Criar e atualizar dados da mensagem automatizada
    this._autoMessages[id] = { id, chats: chats || (await this.getChats()), updatedAt: now, message };

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
        await this.send(automated.message);

        // Remover sala de bate-papo da mensagem
        const nowChats = automated.chats;
        const index = nowChats.indexOf(automated.chats[chat.id]);
        this._autoMessages[id].chats = nowChats.splice(index + 1, nowChats.length);
      })
    );
  }

  /**
   * * Retorna o ID do bot
   * @returns
   */
  public getId(): string {
    return this.id;
  }

  /**
   * * Define o ID do bot
   * @param id
   */
  public setId(id: string) {
    this.id = id;
  }

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
