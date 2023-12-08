import MediaMessage, { Media } from "./MediaMessage";
import { injectJSON } from "../utils/Generic";
import { MessageType } from "./Message";
import Chat from "../chat/Chat";

/**
 * Representa uma mensagem de imagem.
 */
export default class ImageMessage extends MediaMessage {
  /** O tipo da mensagem é sempre MessageType.Image. */
  public readonly type = MessageType.Image;

  /** O tipo MIME da imagem (padrão é "image/png"). */
  public mimetype: string = "image/png";

  /**
   * Cria uma nova instância de ImageMessage.
   * @param file - A imagem, que pode ser um objeto Media, um buffer ou uma string.
   * @param chat - O chat associado à mensagem de imagem (opcional).
   * @param others - Outras propriedades da mensagem de imagem (opcional).
   */
  constructor(chat?: Chat | string, text?: string, file: Media | Buffer | string = Buffer.from(""), others: Partial<ImageMessage> = {}) {
    super(chat, text, file);

    injectJSON(others, this);
  }

  /**
   * Obtém a imagem da mensagem como um fluxo de dados.
   * @returns Os dados da imagem da mensagem.
   */
  public async getImage(): Promise<Buffer> {
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
   * Desserializa um objeto JSON em uma instância de ImageMessage.
   * @param data - O objeto JSON a ser desserializado.
   * @returns Uma instância de ImageMessage.
   */
  public static fromJSON(data: any): ImageMessage {
    return MediaMessage.fix(!data || typeof data != "object" ? new ImageMessage() : injectJSON(data, new ImageMessage()));
  }

  /**
   * Verifica se um objeto é uma instância válida de ImageMessage.
   * @param message - O objeto a ser verificado como uma instância de ImageMessage.
   * @returns Verdadeiro se o objeto for uma instância válida de ImageMessage, caso contrário, falso.
   */
  public static isValid(message: any): message is ImageMessage {
    return MediaMessage.isValid(message) && message?.type == MessageType.Image;
  }
}
