import { MessageType } from "@enums/Message";
import { IChat } from "@interfaces/IChat";

import { ILocationMessage } from "@interfaces/IMessage";

import Message from "@messages/Message";

import { injectJSON } from "@utils/Generic";

export default class LocationMessage extends Message implements ILocationMessage {
  public readonly type = MessageType.Location;

  public latitude: number;
  public longitude: number;

  constructor(chat: IChat | string, latitude: number, longitude: number, others: Partial<LocationMessage> = {}) {
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
