import MediaMessage, { Media } from "./MediaMessage";
import { injectJSON } from "../utils/Generic";
import { MessageType } from "./Message";
import Chat from "../chat/Chat";

/**
 * Representa uma mensagem de figurinha (sticker).
 */
export default class StickerMessage extends MediaMessage {
  /** O tipo da mensagem é sempre MessageType.Sticker. */
  public readonly type = MessageType.Sticker;

  /** O tipo MIME da figurinha (padrão é "image/webp"). */
  public mimetype: string = "image/webp";

  /** Categorias associadas à figurinha. */
  public categories: string[] = [];

  /** Identificador único da figurinha. */
  public stickerId: string = "";

  /** Autor ou criador da figurinha. */
  public author: string = "";

  /** Pacote ao qual a figurinha pertence. */
  public pack: string = "";

  /**
   * Cria uma nova instância de StickerMessage.
   * @param chat - O chat associado à mensagem de figurinha (opcional).
   * @param file - A figurinha, que pode ser um arquivo de mídia, um Buffer ou uma string (opcional).
   * @param others - Outras propriedades da mensagem de figurinha (opcional).
   */
  constructor(chat?: Chat | string, file?: Media | Buffer | string, others: Partial<StickerMessage> = {}) {
    super(chat, "", file);

    injectJSON(others, this);
  }

  /**
   * Obtém a figurinha como um stream ou recurso.
   * @returns Um stream ou recurso representando a figurinha.
   */
  public getSticker() {
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
   * Desserializa um objeto JSON em uma instância de StickerMessage.
   * @param data - O objeto JSON a ser desserializado.
   * @returns Uma instância de StickerMessage.
   */
  public static fromJSON(data: any): StickerMessage {
    return !data || typeof data != "object" ? new StickerMessage() : injectJSON(data, new StickerMessage());
  }

  /**
   * Verifica se um objeto é uma instância válida de StickerMessage.
   * @param message - O objeto a ser verificado como uma instância de StickerMessage.
   * @returns `true` se o objeto for uma instância válida de StickerMessage, caso contrário, `false`.
   */
  public static isValid(message: any): message is StickerMessage {
    return typeof message === "object" && Object.keys(new StickerMessage()).every((key) => message?.hasOwnProperty(key));
  }
}
