import { ClientType } from "@modules/Client";
import { ClientBase } from "@modules/Base";

import User from "@modules/User";
import Chat from "@modules/Chat";

export default class Message {
  #client: ClientType = ClientBase();

  /** * Sala de bate-papo que foi enviada a mensagem */
  public chat: Chat;
  /** * Usuário que mandou a mensagem */
  public user: User;
  /** * Texto da mensagem */
  public text: string;
  /** * Mensagem mencionada na mensagem */
  public mention?: Message | undefined;
  /** * ID da mensagem */
  public id: string;
  /** * Mensagem enviada pelo bot */
  public fromMe: boolean;
  /** * Opção selecionada */
  public selected: string;
  /** * Mensagem mencionada na mensagem */
  public mentions: string[];
  /** * Tempo em que a mensagem foi enviada */
  public timestamp: Number | Long;

  get client(): ClientType {
    return this.#client;
  }

  set client(client: ClientType) {
    this.#client = client;

    this.chat.client = this.client;
    this.user.client = this.client;

    if (this.mention) this.mention.client = this.client;
  }

  constructor(chat: Chat | string, text: string, mention?: Message, id?: string, user?: User | string, fromMe?: boolean, selected?: string, mentions?: string[], timestamp?: Number | Long) {
    this.chat = Chat.Client(this.client, chat || "");
    this.user = User.Client(this.client, user || "");

    this.id = id || "";
    this.text = text || "";
    this.fromMe = !!fromMe;
    this.selected = selected || "";
    this.mentions = mentions || [];
    this.timestamp = timestamp || Date.now();

    if (mention) this.mention = Message.Client(this.client, mention);
  }

  /**
   * * Adiciona uma reação a mensagem
   * @param reaction Reação
   */
  public async addReaction(reaction: string): Promise<void> {
    return this.client.addReaction(this, reaction);
  }

  /**
   * * Envia uma mensagem mencionando a mensagem atual
   * @param message Mensagem que terá enviada
   * @param mention Se verdadeiro a mensagem é mencionada
   */
  public async reply(message: Message | string, mention: boolean = true) {
    const msg = Message.get(message);

    if (mention) msg.mention = this;

    return this.client.send(msg);
  }

  /**
   * * Marca mensagem como visualizada
   */
  public async read(): Promise<void> {
    return this.client.readMessage(this);
  }

  /**
   * @param message Mensagem que será obtida
   * @returns Retorna a mensagem
   */
  public static get<MSG extends Message>(message: MSG | string): MSG | Message {
    if (typeof message == "string") {
      return new Message(new Chat(""), message);
    }

    return message;
  }

  /**
   * @param message Mensagem
   * @returns Retorna o ID da mensagem
   */
  public static getId(message: Message | string): string {
    if (typeof message == "string") {
      return String(message || "");
    }

    if (typeof message == "object" && !Array.isArray(message) && message?.id) {
      return String(message.id);
    }

    return String(message || "");
  }

  /**
   * * Cria uma mensagem com cliente instanciado
   * @param client Cliente
   * @param msg Mensagem
   * @returns
   */
  public static Client<MSG extends Message>(client: ClientType, message: MSG): MSG {
    message.client = client;

    return message;
  }
}
