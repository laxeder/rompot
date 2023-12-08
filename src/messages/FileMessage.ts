import MediaMessage, { Media } from "./MediaMessage";
import { injectJSON } from "../utils/Generic";
import { MessageType } from "./Message";
import Chat from "../chat/Chat";

export default class FileMessage extends MediaMessage {
  /** O tipo da mensagem é sempre MessageType.File. */
  public readonly type = MessageType.File;

  /**
   * Cria uma nova instância de FileMessage.
   * @param file - O arquivo, que pode ser um objeto Media, um buffer ou uma string.
   * @param chat - O chat associado à mensagem de arquivo (opcional).
   * @param others - Outras propriedades da mensagem de arquivo (opcional).
   */
  constructor(chat?: Chat | string, text?: string, file: Media | Buffer | string = Buffer.from(""), others: Partial<FileMessage> = {}) {
    super(chat, text, file);

    injectJSON(others, this);
  }

  /**
   * Obtém o arquivo da mensagem como um fluxo de dados.
   * @returns Os dados do arquivo da mensagem.
   */
  public async getFile(): Promise<Buffer> {
    return await this.getStream();
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
   * Desserializa um objeto JSON em uma instância de FileMessage.
   * @param data - O objeto JSON a ser desserializado.
   * @returns Uma instância de FileMessage.
   */
  public static fromJSON(data: any): FileMessage {
    return MediaMessage.fix(!data || typeof data != "object" ? new FileMessage() : injectJSON(data, new FileMessage()));
  }

  /**
   * Verifica se um objeto é uma instância válida de FileMessage.
   * @param message - O objeto a ser verificado como uma instância de FileMessage.
   * @returns Verdadeiro se o objeto for uma instância válida de FileMessage, caso contrário, falso.
   */
  public static isValid(message: any): message is FileMessage {
    return MediaMessage.isValid(message) && message?.type == MessageType.File;
  }
}
