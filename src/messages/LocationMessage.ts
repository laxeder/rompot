import Message, { MessageType } from "./Message";
import { injectJSON } from "../utils/Generic";
import Chat from "../chat/Chat";

/**
 * Representa uma mensagem de localização.
 */
export default class LocationMessage extends Message {
  /** O tipo da mensagem é sempre MessageType.Location. */
  public readonly type = MessageType.Location;

  /** A latitude da localização. */
  public latitude: number;

  /** A longitude da localização. */
  public longitude: number;

  /**
   * Cria uma nova instância de LocationMessage.
   * @param latitude - A latitude da localização (padrão é 0).
   * @param longitude - A longitude da localização (padrão é 0).
   * @param chat - O chat associado à mensagem de localização (opcional).
   * @param others - Outras propriedades da mensagem de localização (opcional).
   */
  constructor(chat?: Chat | string, latitude: number = 0, longitude: number = 0, others: Partial<LocationMessage> = {}) {
    super(chat);

    this.latitude = latitude;
    this.longitude = longitude;

    injectJSON(others, this);
  }

  /**
   * Define a localização da mensagem.
   * @param latitude - A nova latitude.
   * @param longitude - A nova longitude.
   */
  public setLocation(latitude: number, longitude: number) {
    this.latitude = latitude;
    this.longitude = longitude;
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
   * Desserializa um objeto JSON em uma instância de LocationMessage.
   * @param data - O objeto JSON a ser desserializado.
   * @returns Uma instância de LocationMessage.
   */
  public static fromJSON(data: any): LocationMessage {
    return !data || typeof data != "object" ? new LocationMessage() : injectJSON(data, new LocationMessage());
  }

  /**
   * Verifica se um objeto é uma instância válida de LocationMessage.
   * @param message - O objeto a ser verificado como uma instância de LocationMessage.
   * @returns Verdadeiro se o objeto for uma instância válida de LocationMessage, caso contrário, falso.
   */
  public static isValid(message: any): message is LocationMessage {
    return typeof message === "object" && Object.keys(new LocationMessage()).every((key) => message?.hasOwnProperty(key));
  }
}
