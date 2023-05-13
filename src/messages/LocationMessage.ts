import { MessageType } from "@enums/Message";

import Message from "@messages/Message";

import Chat from "@modules/Chat";

import { injectJSON } from "@utils/Generic";

export default class LocationMessage extends Message {
  public readonly type: MessageType = MessageType.Location;

  /** * Latitude */
  public latitude: number;
  /** * Longitude */
  public longitude: number;

  constructor(chat: Chat | string, latitude: number, longitude: number, others: Partial<LocationMessage> = {}) {
    super(chat, "");

    injectJSON(others, this);

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
