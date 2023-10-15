import Message, { MessageType } from "./Message";
import { injectJSON } from "../utils/Generic";
import Client from "../client/Client";
import Chat from "../chat/Chat";

/** Mídia de uma mensagem */
export type Media = {
  stream: any;
};

export default class MediaMessage extends Message {
  /** O tipo de mensagem é Media. */
  public readonly type: MessageType = MessageType.Media;
  /** O tipo MIME da mídia (por padrão, application/octet-stream). */
  public mimetype: string = "application/octet-stream";
  /** O arquivo de mídia, que pode ser um objeto Media, Buffer ou uma string. */
  public file: Media | Buffer | string;
  /** Indica se a mídia é um GIF. */
  public isGIF: boolean = false;
  /** O nome da mídia. */
  public name: string = "";

  /**
   * Cria uma instância de MediaMessage.
   * @param file - O arquivo de mídia a ser anexado.
   * @param chat - O chat ou ID do chat ao qual a mensagem pertence (opcional).
   * @param text - O texto da mensagem (opcional).
   * @param others - Outros dados a serem injetados na instância (opcional).
   */
  constructor(chat?: Chat | string, text?: string, file: Media | Buffer | string = Buffer.from(""), others: Partial<MediaMessage> = {}) {
    super(chat, text);

    this.file = file;

    injectJSON(others, this);
  }

  /**
   * Obtém um stream de dados da mensagem de mídia.
   * @returns Um Buffer contendo os dados da mídia.
   */
  public async getStream(): Promise<Buffer> {
    return await Client.getClient(this.botId).downloadStreamMessage(this);
  }

  /**
   * Converte o objeto atual para uma representação em formato JSON.
   * @returns Um objeto JSON que representa o estado atual do objeto.
   */
  public toJSON(): any {
    return JSON.parse(JSON.stringify(this));
  }

  /**
   * Desserializa um objeto JSON em uma instância de MediaMessage.
   * @param data - O objeto JSON a ser desserializado.
   * @returns Uma instância de MediaMessage.
   */
  public static fromJSON(data: any): MediaMessage {
    return !data || typeof data != "object" ? new MediaMessage() : injectJSON(data, new MediaMessage());
  }

  /**
   * Verifica se um objeto é uma instância válida de MediaMessage.
   * @param message - O objeto a ser verificado.
   * @returns Verdadeiro se o objeto for uma instância válida de MediaMessage, caso contrário, falso.
   */
  public static isValid(message: any): message is MediaMessage {
    return typeof message === "object" ? Object.keys(new MediaMessage()).every((key) => message?.hasOwnProperty(key)) : false;
  }
}
