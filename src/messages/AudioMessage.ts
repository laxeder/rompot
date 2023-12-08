import MediaMessage, { Media } from "./MediaMessage";
import { injectJSON } from "../utils/Generic";
import { MessageType } from "./Message";
import Chat from "../chat/Chat";

export default class AudioMessage extends MediaMessage {
  /** O tipo da mensagem é sempre MessageType.Audio. */
  public readonly type = MessageType.Audio;
  /** O tipo MIME da mensagem de áudio (padrão é "audio/mp4"). */
  public mimetype: string = "audio/mp4";
  /** É uma mensagem de audio gravada */
  public isPTT: boolean = false;
  /** Duração do audio */
  public duration: number = 0;

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
    const data: Record<string, any> = {};

    for (const key of Object.keys(this)) {
      if (key == "toJSON") continue;

      data[key] = this[key];
    }

    return JSON.parse(JSON.stringify(data));
  }

  /**
   * Desserializa um objeto JSON em uma instância de AudioMessage.
   * @param data - O objeto JSON a ser desserializado.
   * @returns Uma instância de AudioMessage.
   */
  public static fromJSON(data: any): AudioMessage {
    return MediaMessage.fix(!data || typeof data != "object" ? new AudioMessage() : injectJSON(data, new AudioMessage()));
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
