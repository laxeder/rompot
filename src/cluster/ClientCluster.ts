import { Cluster, Worker } from "cluster";
import { readFileSync } from "fs";

import { DEFAULT_CONNECTION_CONFIG } from "../configs/Defaults";
import ConnectionConfig from "../configs/ConnectionConfig";

import MessageHandler, { MessageHandlerConfig } from "../utils/MessageHandler";
import Message, { MessageStatus, MessageType } from "../messages/Message";
import WorkerMessage, { WorkerMessageTag } from "./WorkerMessage";
import { sleep, getError, injectJSON } from "../utils/Generic";
import CommandController from "../command/CommandController";
import { getMessageFromJSON } from "../utils/MessageUtils";
import ReactionMessage from "../messages/ReactionMessage";
import { CMDRunType } from "../command/CommandEnums";
import ErrorMessage from "../messages/ErrorMessage";
import MediaMessage from "../messages/MediaMessage";
import ClientEvents from "../client/ClientEvents";
import { ChatStatus } from "../chat/ChatStatus";
import Command from "../command/Command";
import BotBase from "../bot/BotBase";
import IAuth from "../client/IAuth";
import Chat from "../chat/Chat";
import User from "../user/User";
import IBot from "../bot/IBot";

/** ID dos dados globais do cluster gerenciado pelo Rompot */
export const GlobalRompotCluster = "rompot-client-cluster";

/** Configuração do cliente */
export type ClientClusterConfig = { maxTimeout: number } & ConnectionConfig;

export default class ClientCluster extends ClientEvents {
  /** Tratador de mensagens */
  public messageHandler: MessageHandler = new MessageHandler();
  /** Controlador de comandos  */
  public commandController: CommandController = new CommandController();
  /** Configuração */
  public config: ClientClusterConfig;
  /** Bot */
  public bot: IBot = new BotBase();
  /** Vezes que o bot reconectou */
  public reconnectTimes: number = 0;
  /** Id do cliente */
  public id: string;
  /** Autenticação do bot */
  public auth: IAuth | string = "./session";
  /** Processo do cliente */
  public worker: Worker;
  /** É o cliente principal */
  public isMain: boolean;
  /** Requisições */
  public requests: Record<string, (message: WorkerMessage) => any> = {};

  constructor(id: string, worker: Worker, config: Partial<ClientClusterConfig> = {}, isMain: boolean = false) {
    super();

    this.id = id;
    this.worker = worker;
    this.isMain = isMain;

    this.config = { ...DEFAULT_CONNECTION_CONFIG, maxTimeout: 60000, ...config };

    this.setWorker(worker);

    if (!isMain) {
      this.configEvents();
    }

    ClientCluster.saveClient(this);
  }

  public setWorker(worker: Worker): void {
    this.worker = worker;

    if (!global["default-rompot-worker"] && worker) {
      global["default-rompot-worker"] = worker;
    }

    this.worker.on("message", async (message) => {
      const workerMessage = WorkerMessage.fromJSON(message);

      try {
        if (workerMessage.uid != "rompot") return;
        if (workerMessage.clientId != this.id) return;
        if (workerMessage.tag == WorkerMessageTag.Void) return;
        if (workerMessage.isMain == this.isMain) return;

        const data = workerMessage.getData();

        if (workerMessage.tag == WorkerMessageTag.Event) {
          this.bot.emit(data.name || "", data.arg);
        } else if (workerMessage.tag == WorkerMessageTag.Patch) {
          injectJSON(data, this, true);
        } else if (workerMessage.tag == WorkerMessageTag.Func) {
          const clonedMessage = workerMessage.clone({ tag: WorkerMessageTag.Result, data: { result: await this[data.name](...(data.args || [])) } });

          await this.sendWorkerMessage(clonedMessage);
        } else if (this.requests.hasOwnProperty(workerMessage.id)) {
          this.requests[workerMessage.id](workerMessage);
        }
      } catch (error) {
        await this.sendWorkerMessage(workerMessage.clone({ tag: WorkerMessageTag.Error, data: { reason: error?.message || "Internal error" } }));
      }
    });
  }

  /**
   * * Gera um ID combase uma tag.
   * @param tag - Tag que será usada.
   * @returns ID gerado.
   */
  public generateIdByTag(tag: WorkerMessageTag): string {
    return `${tag}-${Date.now()}-${this.worker.process.pid}-${this.worker.id}-${Object.keys(this.requests).length}`;
  }

  /**
   * * Envia uma mensagem no worker.
   * @param tag - Tag da mensagem.
   * @param data - Data da mensagem.
   * @returns Mensagem de resposta do worker.
   */
  public async sendWorkerMessage(workerMessage: WorkerMessage): Promise<WorkerMessage> {
    const id = workerMessage.id || this.generateIdByTag(workerMessage.tag);

    const message = await new Promise<WorkerMessage>((resolve) => {
      try {
        this.requests[id] = resolve;

        workerMessage.apply({ uid: "rompot", clientId: this.id, isMain: this.isMain, id });

        process.send!(workerMessage.toJSON());

        if (
          workerMessage.isPrimary ||
          workerMessage.tag == WorkerMessageTag.Event ||
          workerMessage.tag == WorkerMessageTag.Patch ||
          workerMessage.tag == WorkerMessageTag.Result ||
          workerMessage.tag == WorkerMessageTag.Void ||
          workerMessage.tag == WorkerMessageTag.Error
        ) {
          resolve(workerMessage.clone({ tag: WorkerMessageTag.Result, data: { result: undefined } }));
        } else if (workerMessage.autoCancel) {
          setTimeout(() => {
            if (!this.requests.hasOwnProperty(id)) return;

            resolve(workerMessage.clone({ tag: WorkerMessageTag.Error, data: { reason: "Timeout" } }));
          }, this.config.maxTimeout);
        }
      } catch (error) {
        resolve(workerMessage.clone({ tag: WorkerMessageTag.Error, data: { reason: error?.message || "Internal error" } }));
      }
    });

    delete this.requests[id];

    if (message.tag == "error") {
      throw new Error((message.data as any)?.reason || "Internal error");
    }

    return message;
  }

  /** Configura os eventos do cliente */
  public configEvents() {
    this.bot.on("message", async (message: Message) => {
      try {
        if (this.isMain) {
          await this.sendWorkerMessage(new WorkerMessage(WorkerMessageTag.Event, { name: "message", arg: message }));
        } else {
          message = getMessageFromJSON(message);

          message.inject({ clientId: this.id, botId: this.bot.id });

          if (!message.fromMe && !this.config.disableAutoRead) {
            await message.read();
          }

          message.user = (await this.getUser(message.user)) || message.user;
          message.chat = (await this.getChat(message.chat)) || message.chat;

          if (message.timestamp > message.chat.timestamp) {
            message.chat.timestamp = message.timestamp;
          }

          if (message.mention) {
            if (message.mention.chat.id != message.chat.id) {
              message.mention.chat = (await this.getChat(message.mention.chat)) || message.mention.chat;
            } else {
              message.mention.chat = message.chat;
            }

            if (message.mention.user.id != message.user.id) {
              message.mention.user = (await this.getUser(message.mention.user)) || message.mention.user;
            } else {
              message.mention.user = message.user;
            }
          }

          if (this.messageHandler.resolveMessage(message)) return;

          this.emit("message", message);

          if (this.config.disableAutoCommand) return;
          if (this.config.disableAutoCommandForUnofficialMessage && message.isUnofficial) return;

          const command = this.searchCommand(message.text);

          if (command != null) {
            this.runCommand(command, message, CMDRunType.Exec);
          }
        }
      } catch (err) {
        this.emit("message", new ErrorMessage(message.chat, err));
      }
    });

    this.on("conn", async (update) => {
      try {
        if (this.isMain) {
          await this.sendWorkerMessage(new WorkerMessage(WorkerMessageTag.Event, { name: "conn", arg: update }));
        }
      } catch (err) {
        this.emit("error", getError(err));
      }
    });

    this.on("error", async (update) => {
      try {
        if (this.isMain) {
          await this.sendWorkerMessage(new WorkerMessage(WorkerMessageTag.Event, { name: "error", arg: update }));
        }
      } catch (err) {
        this.emit("error", getError(err));
      }
    });

    this.bot.on("open", async (update) => {
      try {
        if (this.isMain) {
          await this.sendWorkerMessage(new WorkerMessage(WorkerMessageTag.Event, { name: "open", arg: update }));
        } else {
          this.reconnectTimes = 0;

          this.emit("open", update);
        }
      } catch (err) {
        this.emit("error", getError(err));
      }
    });

    this.bot.on("reconnecting", async (update) => {
      try {
        if (this.isMain) {
          await this.sendWorkerMessage(new WorkerMessage(WorkerMessageTag.Event, { name: "reconnecting", arg: update }));
        } else {
          this.emit("reconnecting", update);
        }
      } catch (err) {
        this.emit("error", getError(err));
      }
    });

    this.bot.on("connecting", async (update) => {
      try {
        if (this.isMain) {
          await this.sendWorkerMessage(new WorkerMessage(WorkerMessageTag.Event, { name: "connecting", arg: update }));
        } else {
          this.emit("connecting", update);
        }
      } catch (err) {
        this.emit("error", getError(err));
      }
    });

    this.bot.on("close", async (update) => {
      try {
        if (this.isMain) {
          await this.sendWorkerMessage(new WorkerMessage(WorkerMessageTag.Event, { name: "close", arg: update }));
        } else {
          this.emit("close", update);

          if (this.reconnectTimes < this.config.maxReconnectTimes) {
            this.reconnectTimes++;

            await sleep(this.config.reconnectTimeout);

            this.reconnect();
          }
        }
      } catch (err) {
        this.emit("error", getError(err));
      }
    });

    this.bot.on("stop", async (update) => {
      try {
        if (this.isMain) {
          await this.sendWorkerMessage(new WorkerMessage(WorkerMessageTag.Event, { name: "stop", arg: update }));
        } else {
          this.emit("stop", update);
        }
      } catch (err) {
        this.emit("error", getError(err));
      }
    });

    this.bot.on("qr", async (update) => {
      try {
        if (this.isMain) {
          await this.sendWorkerMessage(new WorkerMessage(WorkerMessageTag.Event, { name: "qr", arg: update }));
        } else {
          this.emit("qr", update);
        }
      } catch (err) {
        this.emit("error", getError(err));
      }
    });

    this.bot.on("code", async (update) => {
      try {
        if (this.isMain) {
          await this.sendWorkerMessage(new WorkerMessage(WorkerMessageTag.Event, { name: "code", arg: update }));
        } else {
          this.emit("code", update);
        }
      } catch (err) {
        this.emit("error", getError(err));
      }
    });

    this.bot.on("chat", async (update) => {
      try {
        if (this.isMain) {
          await this.sendWorkerMessage(new WorkerMessage(WorkerMessageTag.Event, { name: "chat", arg: update }));
        } else {
          this.emit("chat", { ...update, chat: { ...update.chat, clientId: this.id, botId: this.bot.id } });
        }
      } catch (err) {
        this.emit("error", getError(err));
      }
    });

    this.bot.on("user", async (update) => {
      try {
        if (this.isMain) {
          await this.sendWorkerMessage(new WorkerMessage(WorkerMessageTag.Event, { name: "user", arg: update }));
        } else {
          this.emit("user", {
            event: update.event,
            action: update.action,
            chat: Chat.apply(update.chat, { clientId: this.id, botId: this.bot.id }),
            user: User.apply(update.user, { clientId: this.id, botId: this.bot.id }),
            fromUser: User.apply(update.fromUser, { clientId: this.id, botId: this.bot.id }),
          });
        }
      } catch (err) {
        this.emit("error", getError(err));
      }
    });

    this.bot.on("error", async (update) => {
      try {
        if (this.isMain) {
          await this.sendWorkerMessage(new WorkerMessage(WorkerMessageTag.Event, { name: "error", arg: update }));
        } else {
          this.emit("error", getError(update));
        }
      } catch (err) {
        this.emit("error", getError(err));
      }
    });
  }

  /** Conectar bot
   * @param auth Autenticação do bot
   */
  public async connect(auth?: IAuth | string) {
    if (this.isMain) {
      await this.bot.connect(typeof auth != "string" || !auth ? this.auth : auth);
    } else {
      await this.sendWorkerMessage(new WorkerMessage(WorkerMessageTag.Func, { name: "connect", args: [auth] }, false));
    }
  }

  /** Reconectar bot
   * @param alert Alerta que está reconectando
   */
  public async reconnect(alert?: boolean) {
    if (this.isMain) {
      await this.bot.reconnect(alert);
    } else {
      await this.sendWorkerMessage(new WorkerMessage(WorkerMessageTag.Func, { name: "reconnect", args: [alert] }, false));
    }
  }

  /** Parar bot
   * @param reason Razão por parar bot
   */
  public async stop(reason?: any) {
    if (this.isMain) {
      await this.bot.stop(reason);
    } else {
      await this.sendWorkerMessage(new WorkerMessage(WorkerMessageTag.Func, { name: "stop", args: [reason] }));
    }
  }

  /**
   * Desconecta o bot
   */
  public async logout(): Promise<void> {
    if (this.isMain) {
      await this.bot.logout();
    } else {
      await this.sendWorkerMessage(new WorkerMessage(WorkerMessageTag.Func, { name: "logout", args: [] }));
    }
  }

  /** @returns Controlador de comando do cliente */
  public getCommandController(): CommandController {
    if (this.commandController.clientId != this.id) {
      this.commandController.clientId = this.id;
    }

    if (this.commandController.botId != this.bot.id) {
      this.commandController.botId = this.bot.id;
    }

    return this.commandController;
  }

  /** Define o controlador de comando do cliente */
  public setCommandController(controller: CommandController): void {
    controller.botId = this.bot.id;
    controller.clientId = this.id;

    this.commandController = controller;
  }

  /** Define os comandos do bot
   * @param commands Comandos que será injetado
   */
  public setCommands(commands: Command[]) {
    this.commandController.setCommands(commands);
  }

  /** @returns Retorna os comandos do bot */
  public getCommands() {
    return this.commandController.getCommands();
  }

  /** Adiciona um comando na lista de comandos
   * @param command Comando que será adicionado
   */
  public addCommand(command: Command): void {
    this.commandController.addCommand(command);
  }

  /** Remove um comando na lista de comandos
   * @param command Comando que será removido
   */
  public removeCommand(command: Command): boolean {
    return this.commandController.removeCommand(command);
  }

  /**
   * Procura um comando no texto.
   * @param text - Texto que contem o comando.
   * */
  public searchCommand(text: string): Command | null {
    const command = this.commandController.searchCommand(text);

    if (command == null) return null;

    command.clientId = this.id;
    command.botId = this.bot.id;

    return command;
  }

  /**
   * Execução do comando.
   * @param command - Comando que será executado.
   * @param message - Mensagem associada ao comando.
   */
  public runCommand(command: Command, message: Message, type?: string) {
    return this.commandController.runCommand(command, message, type);
  }

  /**
   * Deletar mensagem
   * @param message Mensagem que será deletada da sala de bate-papos
   */
  public async deleteMessage(message: Message): Promise<void> {
    if (this.isMain) {
      await this.bot.deleteMessage(getMessageFromJSON(message));
    } else {
      await this.sendWorkerMessage(new WorkerMessage(WorkerMessageTag.Func, { name: "deleteMessage", args: [message] }));
    }
  }

  /** Remover mensagem
   * @param message Mensagem que será removida da sala de bate-papo
   */
  public async removeMessage(message: Message): Promise<void> {
    if (this.isMain) {
      await this.bot.readMessage(getMessageFromJSON(message));
    } else {
      await this.sendWorkerMessage(new WorkerMessage(WorkerMessageTag.Func, { name: "removeMessage", args: [message] }));
    }
  }

  /** Marca uma mensagem como visualizada
   * @param message Mensagem que será visualizada
   */
  public async readMessage(message: Message): Promise<void> {
    if (this.isMain) {
      await this.bot.readMessage(getMessageFromJSON(message));
    } else {
      await this.sendWorkerMessage(new WorkerMessage(WorkerMessageTag.Func, { name: "readMessage", args: [message] }));

      if (message.status == MessageStatus.Sending || message.status == MessageStatus.Sended || message.status == MessageStatus.Received) {
        if (message.type == MessageType.Audio) {
          message.status = MessageStatus.Played;
        } else {
          message.status = MessageStatus.Readed;
        }
      }

      if (message.timestamp == message.chat.timestamp) {
        message.chat.unreadCount = message.chat.unreadCount - 1 || 0;
      }
    }
  }

  /** Edita o texto de uma mensagem enviada
   * @param message Mensagem que será editada
   * @param text Novo texto da mensagem
   */
  public async editMessage(message: Message, text: string): Promise<void> {
    if (this.isMain) {
      await this.bot.editMessage(getMessageFromJSON({ ...(message || {}), text, isEdited: true }));
    } else {
      message.text = text;
      message.isEdited = true;

      await this.sendWorkerMessage(new WorkerMessage(WorkerMessageTag.Func, { name: "editMessage", args: [message, text] }));
    }
  }

  /** Adiciona uma reação na mensagem
   * @param message Mensagem
   * @param reaction Reação
   */
  public async addReaction(message: Message, reaction: string): Promise<void> {
    if (this.isMain) {
      message = getMessageFromJSON(message);

      await this.bot.addReaction(new ReactionMessage(message.chat, reaction, message, { user: message.user }));
    } else {
      await this.sendWorkerMessage(new WorkerMessage(WorkerMessageTag.Func, { name: "addReaction", args: [message, reaction] }));
    }
  }

  /** Remove a reação da mensagem
   * @param message Mensagem que terá sua reação removida
   */
  public async removeReaction(message: Message): Promise<void> {
    if (this.isMain) {
      message = getMessageFromJSON(message);

      await this.bot.removeReaction(new ReactionMessage(message.chat, "", message, { user: message.user }));
    } else {
      await this.sendWorkerMessage(new WorkerMessage(WorkerMessageTag.Func, { name: "removeReaction", args: [message] }));
    }
  }

  /** Adiciona animações na reação da mensagem
   * @param message Mensagem que receberá a animação
   * @param reactions Reações em sequência
   * @param interval Intervalo entre cada reação
   * @param maxTimeout Maximo de tempo reagindo
   */
  public addAnimatedReaction(message: Message, reactions: string[], interval: number = 2000, maxTimeout: number = 60000): (reactionStop?: string) => Promise<void> {
    var isStoped: boolean = false;
    const now = Date.now();

    const stop = async (reactionStop?: string) => {
      if (isStoped) return;

      isStoped = true;

      if (!!!reactionStop) {
        await this.removeReaction(message);
      } else {
        await this.addReaction(message, reactionStop);
      }
    };

    const addReaction = async (index: number) => {
      if (isStoped || now + maxTimeout < Date.now()) {
        return stop();
      }

      if (reactions[index]) {
        await this.addReaction(message, reactions[index]);
      }

      await sleep(interval);

      addReaction(index + 1 >= reactions.length ? 0 : index + 1);
    };

    addReaction(0);

    return stop;
  }

  /** Envia uma mensagem
   * @param message Menssagem que será enviada
   * @returns Retorna o conteudo enviado
   */
  public async send(message: Message): Promise<Message> {
    if (this.isMain) {
      return Message.apply(await this.bot.send(getMessageFromJSON(message)), { clientId: this.id, botId: this.bot.id });
    } else {
      if (!this.config.disableAutoTyping) {
        await this.changeChatStatus(message.chat, message.type == "audio" ? ChatStatus.Recording : ChatStatus.Typing);
      }

      const workerMessage = await this.sendWorkerMessage(new WorkerMessage(WorkerMessageTag.Func, { name: "send", args: [message] }));

      return getMessageFromJSON(workerMessage.getData().result || message);
    }
  }

  /** Envia uma mensagem
   * @param chat Sala de bate-papo onde irá ser enviado a mensagem
   * @param message Mensagem que será enviada
   * @param mention Mensagem que será mencionada
   */
  public async sendMessage(chat: Chat | string, message: string | Message, mention?: Message): Promise<Message> {
    if (Message.isValid(message)) {
      message = Message.apply(message, { clientId: this.id, botId: this.bot.id });
      message.chat = Chat.apply(chat, { clientId: this.id, botId: this.bot.id });
      message.mention = mention;

      return await this.send(message);
    }

    return await this.send(new Message(chat, message, { mention }));
  }

  /** Aguarda uma mensagem ser recebida em uma sala de bate-papo
   * @param chat Sala de bate-papo que irá receber a mensagem
   * @param config Configuração do aguardo da mensagem
   */
  public async awaitMessage(chat: Chat | string, config: Partial<MessageHandlerConfig> = {}): Promise<Message> {
    return Message.apply(await this.messageHandler.addMessage(Chat.getId(chat), config), { clientId: this.id, botId: this.bot.id });
  }

  /**
   * Retorna a stream da mídia
   * @param message Mídia que será baixada
   * @returns Stream da mídia
   */
  public async downloadStreamMessage(message: MediaMessage): Promise<Buffer> {
    if (!message.file) return Buffer.from("");

    if (Buffer.isBuffer(message.file)) return message.file;

    if (typeof message.file == "string") {
      return readFileSync(message.file);
    }

    if (this.isMain) {
      return await this.bot.downloadStreamMessage(message.file);
    } else {
      const workerMessage = await this.sendWorkerMessage(new WorkerMessage(WorkerMessageTag.Func, { name: "downloadStreamMessage", args: [message] }));

      return workerMessage.getData().result || Buffer.from("");
    }
  }

  /** @returns Retorna o nome do bot */
  public async getBotName(): Promise<string> {
    if (this.isMain) {
      return await this.bot.getBotName();
    } else {
      const workerMessage = await this.sendWorkerMessage(new WorkerMessage(WorkerMessageTag.Func, { name: "getBotName", args: [] }));

      return workerMessage.getData().result || "";
    }
  }

  /** Define o nome do bot
   * @param name Nome do bot
   */
  public async setBotName(name: string): Promise<void> {
    if (this.isMain) {
      await this.bot.setBotName(name);
    } else {
      await this.sendWorkerMessage(new WorkerMessage(WorkerMessageTag.Func, { name: "setBotName", args: [name] }));
    }
  }

  /** @returns Retorna a descrição do bot */
  public async getBotDescription(): Promise<string> {
    if (this.isMain) {
      return await this.bot.getBotDescription();
    } else {
      const workerMessage = await this.sendWorkerMessage(new WorkerMessage(WorkerMessageTag.Func, { name: "getBotDescription", args: [] }));

      return workerMessage.getData().result || "";
    }
  }

  /** Define a descrição do bot
   * @param description Descrição do bot
   */
  public async setBotDescription(description: string): Promise<void> {
    if (this.isMain) {
      await this.bot.setBotDescription(description);
    } else {
      await this.sendWorkerMessage(new WorkerMessage(WorkerMessageTag.Func, { name: "setBotDescription", args: [description] }));
    }
  }

  /** @returns Retorna foto de perfil do bot */
  public async getBotProfile(lowQuality?: boolean): Promise<Buffer> {
    if (this.isMain) {
      return await this.bot.getBotProfile(lowQuality);
    } else {
      const workerMessage = await this.sendWorkerMessage(new WorkerMessage(WorkerMessageTag.Func, { name: "getBotProfile", args: [lowQuality] }));

      return workerMessage.getData().result || Buffer.from("");
    }
  }

  /** Define a imagem de perfil do bot
   * @param image Imagem de perfil do bot
   */
  public async setBotProfile(profile: Buffer) {
    if (this.isMain) {
      await this.bot.setBotProfile(profile);
    } else {
      await this.sendWorkerMessage(new WorkerMessage(WorkerMessageTag.Func, { name: "setBotProfile", args: [profile] }));
    }
  }

  /**
   * @param chat Sala de bate-papo
   * @returns Retorna uma sala de bate-papo
   */
  public async getChat(chat: Chat | string): Promise<Chat | null> {
    if (this.isMain) {
      const chatData = await this.bot.getChat(Chat.apply(chat, { clientId: this.id, botId: this.bot.id }));

      if (chatData == null) return null;

      return Chat.apply(chatData, { clientId: this.id, botId: this.bot.id });
    } else {
      const workerMessage = await this.sendWorkerMessage(new WorkerMessage(WorkerMessageTag.Func, { name: "getChat", args: [chat] }));

      const chatData = workerMessage.getData().result || null;

      if (chatData == null) return null;

      return Chat.fromJSON(chatData);
    }
  }

  /**
   * Atualiza os dados de um chat.
   * @param id - Id do chat que será atualizado.
   * @param chat - Dados do chat que será atualizado.
   */
  public async updateChat(id: string, chat: Partial<Chat>): Promise<void> {
    if (this.isMain) {
      await this.bot.updateChat({ ...chat, id });
    } else {
      await this.sendWorkerMessage(new WorkerMessage(WorkerMessageTag.Func, { name: "updateChat", args: [id, chat] }));
    }
  }

  /** @returns Retorna as sala de bate-papo que o bot está */
  public async getChats(): Promise<Chat[]> {
    if (this.isMain) {
      const ids: string[] = await this.bot.getChats();
      const chats: Chat[] = [];

      await Promise.all(
        ids.map(async (id) => {
          const chat = await this.bot.getChat(new Chat(id));

          if (chat == null) return;

          chats.push(Chat.apply(chat, { clientId: this.id, botId: this.bot.id }));
        })
      );

      return chats;
    } else {
      const workerMessage = await this.sendWorkerMessage(new WorkerMessage(WorkerMessageTag.Func, { name: "getChats", args: [] }));

      return (workerMessage.getData().result || []).map((chat: Chat) => Chat.fromJSON(chat)) as Chat[];
    }
  }

  /** Define as salas de bate-papo que o bot está
   * @param chats Salas de bate-papo
   */
  public async setChats(chats: Chat[]): Promise<void> {
    if (this.isMain) {
      await this.bot.setChats((chats || []).map((chat) => Chat.fromJSON(chat)));
    } else {
      await this.sendWorkerMessage(new WorkerMessage(WorkerMessageTag.Func, { name: "setChats", args: [chats] }));
    }
  }

  /** Remove uma sala de bate-papo
   * @param chat Sala de bate-papo
   */
  public async removeChat(chat: string | Chat): Promise<void> {
    if (this.isMain) {
      await this.bot.removeChat(Chat.apply(chat, { clientId: this.id, botId: this.bot.id }));
    } else {
      await this.sendWorkerMessage(new WorkerMessage(WorkerMessageTag.Func, { name: "removeChat", args: [chat] }));
    }
  }

  /** Cria uma sala de bate-papo
   * @param chat Sala de bate-papo
   */
  public async createChat(chat: Chat): Promise<void> {
    if (this.isMain) {
      await this.bot.createChat(Chat.apply(chat, { clientId: this.id, botId: this.bot.id }));
    } else {
      await this.sendWorkerMessage(new WorkerMessage(WorkerMessageTag.Func, { name: "createChat", args: [chat] }));
    }
  }

  /** Sai de uma sala de bate-papo
   * @param chat Sala de bate-papo
   */
  public async leaveChat(chat: Chat | string): Promise<void> {
    if (this.isMain) {
      await this.bot.leaveChat(Chat.apply(chat, { clientId: this.id, botId: this.bot.id }));
    } else {
      await this.sendWorkerMessage(new WorkerMessage(WorkerMessageTag.Func, { name: "leaveChat", args: [chat] }));
    }
  }

  /**
   * @param chat Sala de bate-papo
   * @returns Retorna o nome da sala de bate-papo
   */
  public async getChatName(chat: Chat | string): Promise<string> {
    if (this.isMain) {
      return await this.bot.getChatName(Chat.apply(chat, { clientId: this.id, botId: this.bot.id }));
    } else {
      const workerMessage = await this.sendWorkerMessage(new WorkerMessage(WorkerMessageTag.Func, { name: "getChatName", args: [chat] }));

      return workerMessage.getData().result || "";
    }
  }

  /** Define o nome da sala de bate-papo
   * @param chat Sala de bate-papo
   * @param name Nome da sala de bate-papo
   */
  public async setChatName(chat: Chat | string, name: string): Promise<void> {
    if (this.isMain) {
      await this.bot.setChatName(Chat.apply(chat, { clientId: this.id, botId: this.bot.id }), name);
    } else {
      await this.sendWorkerMessage(new WorkerMessage(WorkerMessageTag.Func, { name: "setChatName", args: [chat, name] }));
    }
  }

  /**
   * @param chat Sala de bate-papo
   * @returns Retorna a descrição da sala de bate-papo
   */
  public async getChatDescription(chat: Chat | string): Promise<string> {
    if (this.isMain) {
      return await this.bot.getChatDescription(Chat.apply(chat, { clientId: this.id, botId: this.bot.id }));
    } else {
      const workerMessage = await this.sendWorkerMessage(new WorkerMessage(WorkerMessageTag.Func, { name: "getChatDescription", args: [chat] }));

      return workerMessage.getData().result || "";
    }
  }

  /** Define a descrição da sala de bate-papo
   * @param chat Sala de bate-papo
   * @param description Descrição da sala de bate-papo
   */
  public async setChatDescription(chat: Chat | string, description: string): Promise<void> {
    if (this.isMain) {
      await this.bot.setChatDescription(Chat.apply(chat, { clientId: this.id, botId: this.bot.id }), description);
    } else {
      await this.sendWorkerMessage(new WorkerMessage(WorkerMessageTag.Func, { name: "setChatDescription", args: [chat, description] }));
    }
  }

  /**
   * @param chat Sala de bate-papo
   * @returns Retorna a imagem de perfil da sala de bate-papo
   */
  public async getChatProfile(chat: Chat | string, lowQuality?: boolean): Promise<Buffer> {
    if (this.isMain) {
      return await this.bot.getChatProfile(Chat.apply(chat, { clientId: this.id, botId: this.bot.id }), lowQuality);
    } else {
      const workerMessage = await this.sendWorkerMessage(new WorkerMessage(WorkerMessageTag.Func, { name: "getChatProfile", args: [chat, lowQuality] }));

      return workerMessage.getData().result || Buffer.from("");
    }
  }

  /** Define a imagem de perfil da sala de bate-papo
   * @param chat Sala de bate-papo
   * @param profile Imagem de perfil da sala de bate-papo
   */
  public async setChatProfile(chat: Chat | string, profile: Buffer): Promise<void> {
    if (this.isMain) {
      await this.bot.setChatProfile(Chat.apply(chat, { clientId: this.id, botId: this.bot.id }), profile);
    } else {
      await this.sendWorkerMessage(new WorkerMessage(WorkerMessageTag.Func, { name: "setChatProfile", args: [chat, profile] }));
    }
  }

  /**
   * @param chat Sala de bate-papo
   * @returns Retorna o lider da sala de bate-papo
   */
  public async getChatLeader(chat: Chat | string): Promise<User> {
    if (this.isMain) {
      return User.apply(await this.bot.getChatLeader(Chat.apply(chat, { clientId: this.id, botId: this.bot.id })), { clientId: this.id, botId: this.bot.id });
    } else {
      const workerMessage = await this.sendWorkerMessage(new WorkerMessage(WorkerMessageTag.Func, { name: "getChatLeader", args: [chat] }));

      return User.fromJSON(workerMessage.getData().result || {});
    }
  }

  /**
   * @param chat Sala de bate-papo
   * @returns Retorna os usuários de uma sala de bate-papo
   */
  public async getChatUsers(chat: Chat | string): Promise<string[]> {
    if (this.isMain) {
      return await this.bot.getChatUsers(Chat.apply(chat, { clientId: this.id, botId: this.bot.id }));
    } else {
      const workerMessage = await this.sendWorkerMessage(new WorkerMessage(WorkerMessageTag.Func, { name: "getChatUsers", args: [chat] }));

      return workerMessage.getData().result || [];
    }
  }

  /**
   * @param chat Sala de bate-papo
   * @returns Retorna os administradores de uma sala de bate-papo
   */
  public async getChatAdmins(chat: Chat | string): Promise<string[]> {
    if (this.isMain) {
      return await this.bot.getChatAdmins(Chat.apply(chat, { clientId: this.id, botId: this.bot.id }));
    } else {
      const workerMessage = await this.sendWorkerMessage(new WorkerMessage(WorkerMessageTag.Func, { name: "getChatAdmins", args: [chat] }));

      return workerMessage.getData().result || [];
    }
  }

  /** Adiciona um novo usuário a uma sala de bate-papo
   * @param chat Sala de bate-papo
   * @param user Usuário
   */
  public async addUserInChat(chat: Chat | string, user: User | string): Promise<void> {
    if (this.isMain) {
      await this.bot.addUserInChat(Chat.apply(chat, { clientId: this.id, botId: this.bot.id }), User.apply(user, { clientId: this.id, botId: this.bot.id }));
    } else {
      await this.sendWorkerMessage(new WorkerMessage(WorkerMessageTag.Func, { name: "addUserInChat", args: [chat, user] }));
    }
  }

  /** Adiciona um novo usuário a uma sala de bate-papo
   * @param chat Sala de bate-papo
   * @param user Usuário
   */
  public async removeUserInChat(chat: Chat | string, user: User | string): Promise<void> {
    if (this.isMain) {
      await this.bot.removeUserInChat(Chat.apply(chat, { clientId: this.id, botId: this.bot.id }), User.apply(user, { clientId: this.id, botId: this.bot.id }));
    } else {
      await this.sendWorkerMessage(new WorkerMessage(WorkerMessageTag.Func, { name: "removeUserInChat", args: [chat, user] }));
    }
  }

  /** Promove há administrador um usuário da sala de bate-papo
   * @param chat Sala de bate-papo
   * @param user Usuário
   */
  public async promoteUserInChat(chat: Chat | string, user: User | string): Promise<void> {
    if (this.isMain) {
      await this.bot.promoteUserInChat(Chat.apply(chat, { clientId: this.id, botId: this.bot.id }), User.apply(user, { clientId: this.id, botId: this.bot.id }));
    } else {
      await this.sendWorkerMessage(new WorkerMessage(WorkerMessageTag.Func, { name: "promoteUserInChat", args: [chat, user] }));
    }
  }

  /** Remove a administração um usuário da sala de bate-papo
   * @param chat Sala de bate-papo
   * @param user Usuário
   */
  public async demoteUserInChat(chat: Chat | string, user: User | string): Promise<void> {
    if (this.isMain) {
      await this.bot.demoteUserInChat(Chat.apply(chat, { clientId: this.id, botId: this.bot.id }), User.apply(user, { clientId: this.id, botId: this.bot.id }));
    } else {
      await this.sendWorkerMessage(new WorkerMessage(WorkerMessageTag.Func, { name: "demoteUserInChat", args: [chat, user] }));
    }
  }

  /** Altera o status da sala de bate-papo
   * @param chat Sala de bate-papo
   * @param status Status da sala de bate-papo
   */
  public async changeChatStatus(chat: Chat | string, status: ChatStatus): Promise<void> {
    if (this.isMain) {
      await this.bot.changeChatStatus(Chat.apply(chat, { clientId: this.id, botId: this.bot.id }), status);
    } else {
      await this.sendWorkerMessage(new WorkerMessage(WorkerMessageTag.Func, { name: "changeChatStatus", args: [chat, status] }));
    }
  }

  /**
   * Entra no chat pelo código de convite.
   * @param code - Código de convite do chat.
   */
  public async joinChat(code: string): Promise<void> {
    if (this.isMain) {
      await this.bot.joinChat(code);
    } else {
      await this.sendWorkerMessage(new WorkerMessage(WorkerMessageTag.Func, { name: "joinChat", args: [code] }));
    }
  }

  /**
   * Obtem o código de convite do chat.
   * @param chat - Chat que será obtido o código de convite.
   * @returns O código de convite do chat.
   */
  public async getChatEnvite(chat: Chat | string): Promise<string> {
    if (this.isMain) {
      return await this.bot.getChatEnvite(Chat.apply(chat, { clientId: this.id, botId: this.bot.id }));
    } else {
      const workerMessage = await this.sendWorkerMessage(new WorkerMessage(WorkerMessageTag.Func, { name: "getChatEnvite", args: [chat] }));

      return workerMessage.getData().result || "";
    }
  }

  /**
   * Revoga o código de convite do chat.
   * @param chat - Chat que terá seu código de convite revogado.
   * @returns O novo código de convite do chat.
   */
  public async revokeChatEnvite(chat: Chat | string): Promise<string> {
    if (this.isMain) {
      return await this.bot.revokeChatEnvite(Chat.apply(chat, { clientId: this.id, botId: this.bot.id }));
    } else {
      const workerMessage = await this.sendWorkerMessage(new WorkerMessage(WorkerMessageTag.Func, { name: "revokeChatEnvite", args: [chat] }));

      return workerMessage.getData().result || "";
    }
  }

  /** @returns Retorna a lista de usuários do bot */
  public async getUsers(): Promise<User[]> {
    if (this.isMain) {
      const ids: string[] = await this.bot.getUsers();
      const users: User[] = [];

      await Promise.all(
        ids.map(async (id) => {
          const user = await this.bot.getUser(new User(id));

          if (user == null) return;

          users.push(User.apply(user, { clientId: this.id, botId: this.bot.id }));
        })
      );

      return users;
    } else {
      const workerMessage = await this.sendWorkerMessage(new WorkerMessage(WorkerMessageTag.Func, { name: "getUsers", args: [] }));

      return (workerMessage.getData().result || []).map((user: User) => User.fromJSON(user)) as User[];
    }
  }

  /**
   * Obter lista de usuários salvos.
   * @returns Lista de usuários salvos.
   */
  public async getSavedUsers(): Promise<User[]> {
    if (this.isMain) {
      const ids: string[] = await this.bot.getUsers();
      const users: User[] = [];

      await Promise.all(
        ids.map(async (id) => {
          const user = await this.bot.getUser(new User(id));

          if (user == null || !user.savedName) return;

          users.push(User.apply(user, { clientId: this.id, botId: this.bot.id }));
        })
      );

      return users;
    } else {
      const workerMessage = await this.sendWorkerMessage(new WorkerMessage(WorkerMessageTag.Func, { name: "getSavedUsers", args: [] }));

      return (workerMessage.getData().result || []).map((user: User) => User.fromJSON(user)) as User[];
    }
  }

  /** Define a lista de usuários do bot
   * @param users Usuários
   */
  public async setUsers(users: User[]): Promise<void> {
    if (this.isMain) {
      await this.bot.setUsers(users);
    } else {
      await this.sendWorkerMessage(new WorkerMessage(WorkerMessageTag.Func, { name: "setUsers", args: [users] }));
    }
  }

  /**
   * @param user Usuário
   * @returns Retorna um usuário
   */
  public async getUser(user: User | string): Promise<User | null> {
    if (this.isMain) {
      const userData = await this.bot.getUser(User.apply(user, { clientId: this.id, botId: this.bot.id }));

      if (userData == null) return null;

      return User.apply(userData, { clientId: this.id, botId: this.bot.id });
    } else {
      const workerMessage = await this.sendWorkerMessage(new WorkerMessage(WorkerMessageTag.Func, { name: "getUser", args: [user] }));

      const userData = workerMessage.getData().result || null;

      if (userData == null) return null;

      return User.fromJSON(userData);
    }
  }

  /**
   * Atualiza os dados de um usuário.
   * @param id - Id do usuário que será atualizado.
   * @param user - Dados do usuário que será atualizado.
   */
  public async updateUser(id: string, user: Partial<User>): Promise<void> {
    if (this.isMain) {
      await this.bot.updateUser({ ...user, id });
    } else {
      await this.sendWorkerMessage(new WorkerMessage(WorkerMessageTag.Func, { name: "updateUser", args: [id, user] }));
    }
  }

  /** Remove um usuário
   * @param user Usuário
   */
  public async removeUser(user: User | string): Promise<void> {
    if (this.isMain) {
      await this.bot.removeUser(User.apply(user, { clientId: this.id, botId: this.bot.id }));
    } else {
      await this.sendWorkerMessage(new WorkerMessage(WorkerMessageTag.Func, { name: "removeUser", args: [user] }));
    }
  }

  /**
   * @param user Usuário
   * @returns Retorna o nome do usuário
   */
  public async getUserName(user: User | string): Promise<string> {
    if (this.isMain) {
      if (User.getId(user) == this.id) return this.getBotName();

      return await this.bot.getUserName(User.apply(user, { clientId: this.id, botId: this.bot.id }));
    } else {
      const workerMessage = await this.sendWorkerMessage(new WorkerMessage(WorkerMessageTag.Func, { name: "getUserName", args: [user] }));

      return workerMessage.getData().result || "";
    }
  }

  /** Define o nome do usuário
   * @param user Usuário
   * @param name Nome do usuário
   */
  public async setUserName(user: User | string, name: string): Promise<void> {
    if (this.isMain) {
      if (User.getId(user) == this.id) {
        await this.setBotName(name);
      }

      await this.bot.setUserName(User.apply(user, { clientId: this.id, botId: this.bot.id }), name);
    } else {
      await this.sendWorkerMessage(new WorkerMessage(WorkerMessageTag.Func, { name: "setUserName", args: [user, name] }));
    }
  }

  /**
   * @param user Usuário
   * @returns Retorna a descrição do usuário
   */
  public async getUserDescription(user: User | string): Promise<string> {
    if (this.isMain) {
      if (User.getId(user) == this.id) {
        return await this.getBotDescription();
      }

      return await this.bot.getUserDescription(User.apply(user, { clientId: this.id, botId: this.bot.id }));
    } else {
      const workerMessage = await this.sendWorkerMessage(new WorkerMessage(WorkerMessageTag.Func, { name: "getUserDescription", args: [user] }));

      return workerMessage.getData().result || "";
    }
  }

  /** Define a descrição do usuário
   * @param user Usuário
   * @param description Descrição do usuário
   */
  public async setUserDescription(user: User | string, description: string): Promise<void> {
    if (this.isMain) {
      if (User.getId(user) == this.id) {
        await this.setBotDescription(description);
      }

      await this.bot.setUserDescription(User.apply(user, { clientId: this.id, botId: this.bot.id }), description);
    } else {
      await this.sendWorkerMessage(new WorkerMessage(WorkerMessageTag.Func, { name: "setUserDescription", args: [user, description] }));
    }
  }

  /**
   * @param user Usuário
   * @returns Retorna a foto de perfil do usuário
   */
  public async getUserProfile(user: User | string, lowQuality?: boolean): Promise<Buffer> {
    if (this.isMain) {
      if (User.getId(user) == this.id) {
        return await this.getBotProfile(lowQuality);
      }

      return await this.bot.getUserProfile(User.apply(user, { clientId: this.id, botId: this.bot.id }), lowQuality);
    } else {
      const workerMessage = await this.sendWorkerMessage(new WorkerMessage(WorkerMessageTag.Func, { name: "getUserProfile", args: [user, lowQuality] }));

      return workerMessage.getData().result || Buffer.from("");
    }
  }

  /** Define a imagem de perfil do usuário
   * @param user Usuário
   * @param profile Imagem de perfil do usuário
   */
  public async setUserProfile(user: User | string, profile: Buffer): Promise<void> {
    if (this.isMain) {
      if (User.getId(user) == this.id) {
        await this.setBotProfile(profile);
      }

      await this.bot.setUserProfile(User.apply(user, { clientId: this.id, botId: this.bot.id }), profile);
    } else {
      await this.sendWorkerMessage(new WorkerMessage(WorkerMessageTag.Func, { name: "setUserProfile", args: [user, profile] }));
    }
  }

  /** Desbloqueia um usuário
   * @param user Usuário
   */
  public async unblockUser(user: User | string): Promise<void> {
    if (this.isMain) {
      await this.bot.unblockUser(User.apply(user, { clientId: this.id, botId: this.bot.id }));
    } else {
      await this.sendWorkerMessage(new WorkerMessage(WorkerMessageTag.Func, { name: "unblockUser", args: [user] }));
    }
  }

  /** Bloqueia um usuário
   * @param user Usuário
   */
  public async blockUser(user: User | string): Promise<void> {
    if (this.isMain) {
      await this.bot.blockUser(User.apply(user, { clientId: this.id, botId: this.bot.id }));
    } else {
      await this.sendWorkerMessage(new WorkerMessage(WorkerMessageTag.Func, { name: "blockUser", args: [user] }));
    }
  }

  /**
   * Retorna a lista de clientes diponíveis.
   * @returns Clientes ordenados pelo ID.
   */
  public static getClients(): Record<string, ClientCluster> {
    if (!global.hasOwnProperty("rompot-clients-cluster") || typeof global["rompot-clients-cluster"] != "object") {
      global["rompot-clients-cluster"] = {};
    }

    return global["rompot-clients-cluster"];
  }

  /**
   * Define todos os clientes diponíveis.
   * @param clients - Clientes que serão definidios.
   */
  public static saveClients(clients: Record<string, ClientCluster>): void {
    global["rompot-clients-cluster"] = clients;
  }

  /**
   * Retorna o cliente pelo seu respectivo ID.
   * @param id - ID do cliente.
   * @returns O cliente associado ao ID.
   */
  public static getClient(id: string): ClientCluster {
    const clients = ClientCluster.getClients();

    if (clients.hasOwnProperty(id) && typeof clients[id] == "object") {
      return clients[id];
    }

    return new ClientCluster(id, global["default-rompot-worker"] || global["rompot-cluster-save"]?.worker);
  }

  /**
   * Define um cliente disponível
   * @param client - Cliente que será definido
   */
  public static saveClient(client: ClientCluster): void {
    if (!global.hasOwnProperty("rompot-clients-cluster") || typeof global["rompot-clients-cluster"] != "object") {
      global["rompot-clients-cluster"] = {};
    }

    global["rompot-clients-cluster"][client.id] = client;

    const workerMessage = new WorkerMessage(WorkerMessageTag.Patch, {});

    workerMessage.id = "save-client";
    workerMessage.isPrimary = true;

    client.sendWorkerMessage(workerMessage);
  }

  /** Gera um id único */
  public static generateId(): string {
    return `${process.pid}-${Date.now()}-${Object.keys(ClientCluster.getClients()).length}`;
  }

  /**
   * * Cria um cliente principal para o bot.
   * @param id - ID do cliente.
   * @param worker - Worker do cliente.
   * @param bot - Bot do cliente.
   * @param auth - Autenticação do bot.
   * @returns Instância principal do cliente.
   */
  public static createMain(id: string, worker: Worker, bot: IBot, auth: IAuth | string, config: Partial<ClientClusterConfig>): ClientCluster {
    const clientMain = new ClientCluster(id, worker, config, true);

    clientMain.bot = bot;
    clientMain.auth = auth;

    clientMain.configEvents();

    return clientMain;
  }

  /** Configura o cluster para o cliente */
  public static configCluster(cluster: Cluster) {
    global["rompot-cluster-save"] = cluster;

    global[GlobalRompotCluster] = {
      workers: { ...(global[GlobalRompotCluster]?.workers || {}) },
      clients: { ...(global[GlobalRompotCluster]?.clients || {}) },
    };

    cluster.on("fork", (worker) => {
      global[GlobalRompotCluster].workers[`${worker.id}`] = worker;
    });

    cluster.on("message", (worker, message) => {
      const workerMessage = WorkerMessage.fromJSON(message);

      try {
        if (workerMessage.uid != "rompot") return;

        if (!global[GlobalRompotCluster].clients[worker.id]?.includes(workerMessage.clientId)) {
          global[GlobalRompotCluster].clients[worker.id] = [...(global[GlobalRompotCluster].clients[worker.id] || []), workerMessage.clientId];
        }

        if (workerMessage.isPrimary) return;

        for (const workerId of Object.keys(global[GlobalRompotCluster]?.clients || {})) {
          try {
            for (const clientId of global[GlobalRompotCluster]?.clients[workerId] || []) {
              if (clientId != workerMessage.clientId) continue;

              const workerReceive = global[GlobalRompotCluster].workers[workerId] as Worker;

              if (!workerReceive) continue;

              workerReceive.send(workerMessage);
            }
          } catch (error) {
            worker.send(workerMessage.clone({ tag: WorkerMessageTag.Error, data: { reason: "Error in send message from worker" } }));
          }
        }
      } catch (error) {
        worker.send(workerMessage.clone({ tag: WorkerMessageTag.Error, data: { reason: "Error in receive message from worker" } }));
      }
    });
  }
}
