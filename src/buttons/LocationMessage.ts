import { Message } from "@buttons/Message";
import { Chat } from "@models/Chat";

export class LocationMessage extends Message {
  public latitude: number;
  public longitude: number;

  constructor(chat: Chat, latitude: number, longitude: number, mention?: Message, id?: string) {
    super(chat, "", mention, id);

    this.latitude = latitude;
    this.longitude = longitude;
  }

  /**
   * * Define a latitude e longitude da localização
   * @param latitude
   * @param longitude
   */
  public setLocation(latitude: number, longitude: number) {
    this.latitude = latitude;
    this.longitude = longitude;
  }

  /**
   * * Define a latitude
   * @param longitude
   */
  public setLongitude(longitude: number) {
    this.longitude = longitude;
  }

  /**
   * * Define a longitude
   * @param latitude
   */
  public setLatitude(latitude: number) {
    this.latitude = latitude;
  }

  /**
   * * Retorna a longitude
   * @returns
   */
  public getLongitude(): number {
    return this.longitude;
  }

  /**
   * * retorna a latitude
   * @returns
   */
  public getLatitude(): number {
    return this.latitude;
  }
}
