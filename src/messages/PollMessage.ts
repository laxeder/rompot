import Message, { MessageType } from "./Message";
import { injectJSON } from "../utils/Generic";
import Chat from "../chat/Chat";

/**
 * Representa uma opção em uma enquete.
 */
export type PollOption = {
  /** Identificador exclusivo da opção. */
  id: string;
  /** Nome ou descrição da opção. */
  name: string;
};

/**
 * Enumerador que define as ações relacionadas a uma enquete.
 */
export enum PollAction {
  /** Ação de criação de uma nova enquete. */
  Create = "create",
  /** Ação de adição de opções a uma enquete existente. */
  Add = "add",
  /** Ação de remoção de opções de uma enquete existente. */
  Remove = "remove",
}

/**
 * Representa uma mensagem de enquete.
 */
export default class PollMessage extends Message {
  /** O tipo da mensagem é MessageType.Poll ou MessageType.PollUpdate. */
  public readonly type: MessageType.Poll | MessageType.PollUpdate = MessageType.Poll;

  /** Mapa de votos por usuário. */
  public votes: { [user: string]: string[] } = {};

  /** Chave secreta associada à enquete. */
  public secretKey: Uint8Array = Buffer.from("");

  /** Lista de opções da enquete. */
  public options: PollOption[] = [];

  /** Ação relacionada à enquete (Create, Add ou Remove). */
  public action: PollAction = PollAction.Create;

  /**
   * Cria uma nova instância de PollMessage.
   * @param chat - O chat associado à mensagem de enquete (opcional).
   * @param text - O texto da mensagem (opcional).
   * @param options - Lista de opções da enquete (padrão é uma lista vazia).
   * @param others - Outras propriedades da mensagem de enquete (opcional).
   */
  constructor(chat?: Chat | string, text?: string, options: PollOption[] = [], others: Partial<PollMessage> = {}) {
    super(chat, text);

    this.options = options;

    injectJSON(others, this);
  }

  /**
   * Adiciona uma nova opção à enquete.
   * @param name - Nome da nova opção.
   * @param id - Identificador da nova opção (padrão é um timestamp em forma de string).
   */
  public addOption(name: string, id: string = `${Date.now()}`) {
    this.options.push({ name, id });
  }

  /**
   * Remove uma opção da enquete.
   * @param option - Opção a ser removida.
   */
  public removeOption(option: PollOption) {
    this.options = this.options.filter((opt) => !(opt.id == option.id && opt.name == option.name));
  }

  /**
   * Obtém os votos de um usuário na enquete.
   * @param user - ID do usuário.
   * @returns Uma matriz de votos do usuário.
   */
  public getUserVotes(user: string) {
    return this.votes[user] || [];
  }

  /**
   * Define os votos de um usuário na enquete.
   * @param user - ID do usuário.
   * @param hashVotes - Uma matriz de votos do usuário.
   */
  public setUserVotes(user: string, hashVotes: string[]) {
    this.votes[user] = hashVotes;
  }

  /**
   * Serializa a mensagem de enquete em um objeto JSON.
   * @returns O objeto JSON representando a mensagem de enquete.
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
   * Desserializa um objeto JSON em uma instância de PollMessage.
   * @param message - O objeto JSON a ser desserializado.
   * @returns Uma instância de PollMessage.
   */
  public static fromJSON(message: any): PollMessage {
    if (!message || typeof message != "object") {
      return new PollMessage();
    }

    const pollMessage = Message.fix(injectJSON(message, new PollMessage()));

    pollMessage.secretKey = Buffer.from(message?.secretKey || "");
    pollMessage.votes = message?.votes || [];

    return pollMessage;
  }

  /**
   * Verifica se um objeto é uma instância válida de PollMessage.
   * @param message - O objeto a ser verificado como uma instância de PollMessage.
   * @returns `true` se o objeto for uma instância válida de PollMessage, caso contrário, `false`.
   */
  public static isValid(message: any): message is PollMessage {
    return Message.isValid(message) && (message?.type == MessageType.Poll || message?.type == MessageType.PollUpdate);
  }
}
