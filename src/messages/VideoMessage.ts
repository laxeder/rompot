import MediaMessage, { Media } from "./MediaMessage";
import { injectJSON } from "../utils/Generic";
import { MessageType } from "./Message";
import Chat from "../chat/Chat";

/**
 * Representa uma mensagem de vídeo.
 */
export default class VideoMessage extends MediaMessage {
  /** O tipo da mensagem é sempre MessageType.Video. */
  public readonly type = MessageType.Video;

  /** O tipo MIME do vídeo (padrão é "video/mp4"). */
  public mimetype: string = "video/mp4";

  /**
   * Cria uma nova instância de VideoMessage.
   * @param chat - O chat associado à mensagem de vídeo (opcional).
   * @param text - O texto da mensagem (opcional).
   * @param file - O vídeo, que pode ser um arquivo de mídia, um Buffer ou uma string (opcional).
   * @param others - Outras propriedades da mensagem de vídeo (opcional).
   */
  constructor(chat?: Chat | string, text?: string, file?: Media | Buffer | string, others: Partial<VideoMessage> = {}) {
    super(chat, text, file);

    injectJSON(others, this);
  }

  /**
   * Obtém o vídeo como um stream ou recurso.
   * @returns Um stream ou recurso representando o vídeo.
   */
  public getVideo() {
    return this.getStream();
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
   * Cria uma instância de VideoMessage a partir de uma representação em formato JSON.
   * @param data - Os dados JSON a serem usados para criar a instância.
   * @returns Uma instância de VideoMessage criada a partir dos dados JSON.
   */
  public static fromJSON(data: any): VideoMessage {
    return MediaMessage.fix(!data || typeof data != "object" ? new VideoMessage() : injectJSON(data, new VideoMessage()));
  }

  /**
   * Verifica se um objeto é uma instância válida de VideoMessage.
   * @param message - O objeto a ser verificado.
   * @returns Verdadeiro se o objeto for uma instância válida de VideoMessage, caso contrário, falso.
   */
  public static isValid(message: any): message is VideoMessage {
    return MediaMessage.isValid(message) && message?.type == MessageType.Video;
  }
}
