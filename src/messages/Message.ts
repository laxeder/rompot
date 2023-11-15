import { injectJSON } from "../utils/Generic";
import Client from "../client/Client";
import Chat from "../chat/Chat";
import User from "../user/User";

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

export default class Message {
  /** ID do bot associado a esta mensagem */
  public botId: string = "";
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
  public timestamp: Number = 0;
  /** A mensagem é editada */
  public isEdited: boolean = false;
  /** A Mensagem foi deletada */
  public isDeleted: boolean = false;
  /** A mensagem foi enviada por uma API não oficial */
  public isUnofficial: boolean = false;

  constructor(chat: Chat | string = "", text: string = "", others: Partial<Message> = {}) {
    this.text = text || "";
    this.chat = Chat.get(chat || "");

    injectJSON(others, this);

    this.setBotId(this.botId);
  }

  /**
   * Define o ID do bot associado a mensagem.
   * @param botId - ID do bot associado a mensagem.
   */
  public setBotId(botId: string) {
    this.botId = botId;
    this.user.botId = botId;
    this.chat.botId = botId;

    if (this.mention) {
      this.mention.setBotId(botId);
    }
  }

  /**
   * * Adiciona uma reação a mensagem.
   * @param emoji - Emoji que será adicionado na reação.
   */
  public async addReaction(emoji: string): Promise<void> {
    return Client.getClient(this.botId).addReaction(this, emoji);
  }

  /**
   * * Remove uma reação da mensagem.
   */
  public async removeReaction(): Promise<void> {
    return Client.getClient(this.botId).removeReaction(this);
  }

  /**
   * * Adiciona animações na reação da mensagem.
   * @param reactions Reações em sequência.
   * @param interval Intervalo entre cada reação.
   * @param maxTimeout Maximo de tempo reagindo.
   */
  public addAnimatedReaction(reactions: string[], interval?: number, maxTimeout?: number): (reactionStop?: string) => Promise<void> {
    return Client.getClient(this.botId).addAnimatedReaction(this, reactions, interval, maxTimeout);
  }

  /** Envia uma mensagem mencionando a mensagem atual.
   * @param message Mensagem que será enviada.
   * @param isMention Se verdadeiro a mensagem atual é mencionada na mensagem enviada.
   */
  public async reply(message: Message | string, isMention: boolean = true) {
    const msg = Message.get(message);

    msg.chat.id = msg.chat.id || this.chat.id;
    msg.user.id = msg.chat.id || this.botId;
    msg.mention = isMention ? this : msg.mention;

    return Client.getClient(this.botId).send(msg);
  }

  /**
   * * Marca mensagem como visualizada.
   */
  public async read(): Promise<void> {
    return Client.getClient(this.botId).readMessage(this);
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
    return !data || typeof data != "object" ? new Message() : injectJSON(data, new Message());
  }

  /**
   * Obtem a mensagem apartir de um texto ou Message.
   * @param message - Mensagem que será obtida.
   * @param botId - ID do bot associado a mensagem.
   * @returns A mensagem
   */
  public static get<T extends Message>(message: T | string, botId?: string): T | Message {
    const m = typeof message == "string" ? new Message(message) : message;

    if (botId) {
      m.botId = botId;
      m.chat.botId = botId;
      m.user.botId = botId;

      if (m.mention) {
        m.mention = Message.get(m.mention, botId);
      }
    }

    return m;
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
