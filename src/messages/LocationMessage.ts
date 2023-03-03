import { ILocationMessage } from "@interfaces/Messages";
import { IChat } from "@interfaces/Chat";

import Message from "@messages/Message";

export default class LocationMessage extends Message implements ILocationMessage {
  public latitude: number;
  public longitude: number;

  constructor(chat: IChat | string, latitude: number, longitude: number, mention?: Message, id?: string) {
    super(chat, "", mention, id);

    this.latitude = latitude;
    this.longitude = longitude;
  }

  public setLocation(latitude: number, longitude: number) {
    this.latitude = latitude;
    this.longitude = longitude;
  }
}
