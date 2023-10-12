import MediaMessage, { Media } from "@messages/MediaMessage";
import { MessageType } from "@messages/Message";
import Chat from "@src/chat/Chat";

import { injectJSON } from "@utils/Generic";

export default class AudioMessage extends MediaMessage {
  /** O tipo da mensagem é sempre MessageType.Audio. */
  public readonly type = MessageType.Audio;
  /** O tipo MIME da mensagem de áudio (padrão é "audio/mp4"). */
  public mimetype: string = "audio/mp4";

  /**
   * Cria uma nova instância de AudioMessage.
   * @param file - O arquivo de áudio, que pode ser um objeto Media, um buffer ou uma string.
   * @param chat - O chat associado à mensagem de áudio (opcional).
   * @param others - Outras propriedades da mensagem de áudio (opcional).
   */
  constructor(chat?: Chat | string, file: Media | Buffer | string = Buffer.from(""), others: Partial<AudioMessage> = {}) {
    super(chat, "", file);

    injectJSON(others, this);
  }

  /**
   * Obtém o áudio da mensagem como um fluxo de dados.
   * @returns Uma Promise que resolve para o fluxo de áudio da mensagem.
   */
  public async getAudio() {
    return await this.getStream();
  }

  /**
   * Converte o objeto atual para uma representação em formato JSON.
   * @returns Um objeto JSON que representa o estado atual do objeto.
   */
  public toJSON(): any {
    return JSON.parse(JSON.stringify(this));
  }

  /**
   * Desserializa um objeto JSON em uma instância de AudioMessage.
   * @param data - O objeto JSON a ser desserializado.
   * @returns Uma instância de AudioMessage.
   */
  public static fromJSON(data: any): AudioMessage {
    return !data || typeof data != "object" ? new AudioMessage() : injectJSON(data, new AudioMessage());
  }

  /**
   * Verifica se um objeto é uma instância válida de AudioMessage.
   * @param message - O objeto a ser verificado como uma instância de AudioMessage.
   * @returns Verdadeiro se o objeto for uma instância válida de AudioMessage, caso contrário, falso.
   */
  public static isValid(message: any): message is AudioMessage {
    return MediaMessage.isValid(message) && message?.type == MessageType.Audio;
  }
}
