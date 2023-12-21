import Chat from "../chat/Chat";
import User from "../user/User";

import { ClientUtils } from "../utils/ClientUtils";
import { injectJSON } from "../utils/Generic";

/**
 * Tipo da mensagem
 */
export enum MessageType {
  Empty = "empty",
  Error = "error",
  Text = "text",
  Media = "media",
  File = "file",
  Video = "video",
  Image = "image",
  Audio = "audio",
  Sticker = "sticker",
  Reaction = "reaction",
  Contact = "contact",
  Location = "location",
  Poll = "poll",
  PollUpdate = "pollUpdate",
  List = "list",
  Button = "button",
  TemplateButton = "templateButton",
}

/**
 * Status da mensagem
 */
export enum MessageStatus {
  Error = "ERROR",
  Sending = "SENDING",
  Sended = "SENDED",
  Received = "RECEIVED",
  Readed = "READED",
  Played = "PLAYED",
}

export default class Message {
  /** ID do bot associado a esta mensagem */
  public botId: string = "";
  /** ID do cliente associado a este usuário */
  public clientId: string = "";
  /** Tipo da mensagem */
  public type: MessageType = MessageType.Text;
  /** Sala de bate-papo que foi enviada a mensagem */
  public chat: Chat = new Chat("");
  /** Usuário que mandou a mensagem */
  public user: User = new User("");
  /** Texto da mensagem */
  public text: string = "";
  /** Mensagem mencionada na mensagem */
  public mention?: Message | undefined = undefined;
  /** ID da mensagem */
  public id: string = "";
  /** Mensagem enviada pelo bot */
  public fromMe: boolean = false;
  /** Opção selecionada */
  public selected: string = "";
  /** Usuários mencionados na mensagem */
  public mentions: string[] = [];
  /** Tempo em que a mensagem foi enviada */
  public timestamp: number = 0;
  /** Status da mensagem */
  public status: MessageStatus = MessageStatus.Sending;
  /** É uma mensasgem de atualização */
  public isUpdate: boolean = false;
  /** A mensagem é editada */
  public isEdited: boolean = false;
  /** A mensagem foi deletada */
  public isDeleted: boolean = false;
  /** A mensagem é de visualização única */
  public isViewOnce: boolean = false;
  /** A mensagem foi enviada por uma API não oficial */
  public isUnofficial: boolean = false;
  /** A mensagem recebida é antiga */
  public isOld: boolean = false;

  constructor(chat: Chat | string = "", text: string = "", others: Partial<Message> = {}) {
    this.text = text || "";
    this.chat = Chat.apply(chat || "");

    this.inject(others);
  }

  /**
   * Injeta dados de ujma mensagem na mesnagem atual.
   * @param data - Os dados que serão injetados.
   */
  public inject(data: Partial<Message>) {
    for (const key of Object.keys(data)) {
      this[key] = data[key];
    }

    if (data.clientId) {
      this.clientId = data.clientId;
      this.user.clientId = data.clientId;
      this.chat.clientId = data.clientId;
      this.mention?.inject({ clientId: data.clientId });
    }

    if (data.botId) {
      this.botId = data.botId;
      this.user.botId = data.botId;
      this.chat.botId = data.botId;
      this.mention?.inject({ botId: data.botId });
    }
  }

  /**
   * * Adiciona uma reação a mensagem.
   * @param emoji - Emoji que será adicionado na reação.
   */
  public async addReaction(emoji: string): Promise<void> {
    return ClientUtils.getClient(this.clientId).addReaction(this, emoji);
  }

  /**
   * * Remove uma reação da mensagem.
   */
  public async removeReaction(): Promise<void> {
    return ClientUtils.getClient(this.clientId).removeReaction(this);
  }

  /**
   * * Adiciona animações na reação da mensagem.
   * @param reactions Reações em sequência.
   * @param interval Intervalo entre cada reação.
   * @param maxTimeout Maximo de tempo reagindo.
   */
  public addAnimatedReaction(reactions: string[], interval?: number, maxTimeout?: number): (reactionStop?: string) => Promise<void> {
    return ClientUtils.getClient(this.clientId).addAnimatedReaction(this, reactions, interval, maxTimeout);
  }

  /** Envia uma mensagem mencionando a mensagem atual.
   * @param message Mensagem que será enviada.
   * @param isMention Se verdadeiro a mensagem atual é mencionada na mensagem enviada.
   */
  public async reply(message: Message | string, isMention: boolean = true) {
    const msg = Message.apply(message);

    msg.chat.id = msg.chat.id || this.chat.id;
    msg.user.id = msg.chat.id || this.clientId;
    msg.mention = isMention ? this : msg.mention;

    return ClientUtils.getClient(this.clientId).send(msg);
  }

  /**
   * * Marca mensagem como visualizada.
   */
  public async read(): Promise<void> {
    return ClientUtils.getClient(this.clientId).readMessage(this);
  }

  /**
   * Converte o objeto atual para uma representação em formato JSON.
   * @returns Um objeto JSON que representa o estado atual do objeto.
   */
  public toJSON(): any {
    const data: Record<string, any> = {};

    for (const key of Object.keys(this)) {
      if (key == "toJSON") continue;

      data[key] = this[key];
    }

    return JSON.parse(JSON.stringify(data));
  }

  /**
   * Cria uma instância de Message a partir de uma representação em formato JSON.
   * @param data - Os dados JSON a serem usados para criar a instância.
   * @returns Uma instância de Message criada a partir dos dados JSON.
   */
  public static fromJSON(data: any): Message {
    return Message.fix(!data || typeof data != "object" ? new Message() : injectJSON(data, new Message(), false, true));
  }

  public static fix<T extends Message>(message: T): T {
    message.chat = Chat.fromJSON(message.chat);
    message.user = User.fromJSON(message.user);

    if (message.mention && !(message.mention instanceof Message)) {
      message.mention = Message.fromJSON(message.mention);
    }

    return message;
  }

  /**
   * Obtém uma instância de Message com base em um ID e/ou dados passados.
   * @param message - O ID da mensagem ou uma instância existente de Message.
   * @param data - Dados que serão aplicados na mensagem,.
   * @returns Uma instância de Message com os dados passados.
   */
  public static apply(message: Message | string, data?: Partial<Message>) {
    if (!message || typeof message != "object") {
      message = new Message("", `${message}`);
    }

    message.inject(data || {});

    return message;
  }

  /**
   * Verifica se um objeto é uma instância válida de Message.
   * @param message - O objeto a ser verificado.
   * @returns Verdadeiro se o objeto for uma instância válida de Message, caso contrário, falso.
   */
  public static isValid(message: any): message is Message {
    return typeof message === "object" && Object.keys(new Message()).every((key) => message?.hasOwnProperty(key));
  }
}
