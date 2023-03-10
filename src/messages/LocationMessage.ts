import Message from "@messages/Message";

import Chat from "@modules/Chat";
import User from "@modules/User";

export default class LocationMessage extends Message {
  /** * Latitude */
  public latitude: number;
  /** * Longitude */
  public longitude: number;

  constructor(
    chat: Chat | string,
    latitude: number,
    longitude: number,
    mention?: Message,
    id?: string,
    user?: User | string,
    fromMe?: boolean,
    selected?: string,
    mentions?: string[],
    timestamp?: Number | Long
  ) {
    super(chat, "", mention, id, user, fromMe, selected, mentions, timestamp);
    this.latitude = latitude;
    this.longitude = longitude;
  }

  /**
   * * Definir localização
   * @param latitude Latitude
   * @param longitude Longitude
   */
  public setLocation(latitude: number, longitude: number) {
    this.latitude = latitude;
    this.longitude = longitude;
  }
}
