import { MediaMessage } from "./MediaMessage";
import { Button } from "../types/Button";
import { Chat } from "@models/Chat";

export class ButtonMessage extends MediaMessage {
  private _image?: any;

  public buttons: Array<Button> = [];
  public footer: string;
  public type: number;

  constructor(chat: Chat, text: string, footer: string = "", type: number = 1) {
    super(chat, text);

    this.footer = footer;
    this.type = type;
  }

  /**
   * * Define a imagem da mensagem
   * @param image
   */
  public setImage(image: any) {
    this._image = image;
  }

  /**
   * * Obtem a imagem da mensagem
   * @returns
   */
  public async getImage() {
    return await this.getStream(this._image);
  }

  /**
   * * Define o rodapé da mensagem
   * @param footer
   */
  public setFooter(footer: string) {
    this.footer = footer;
  }

  /**
   * * Define o tipo da mensagem
   * @param type
   */
  public setType(type: number) {
    this.type = type;
  }

  /**
   * * Adiciona um botão com uma url
   * @param text
   * @param url
   * @param index
   * @returns
   */
  public addUrl(text: string, url: string, index: number = this.buttons.length + 1): ButtonMessage {
    this.buttons.push({ index, url: { text, url } });
    return this;
  }

  /**
   * * Adiciona um botão com um telefone
   * @param text
   * @param call
   * @param index
   * @returns
   */
  public addCall(text: string, phone: number, index: number = this.buttons.length + 1): ButtonMessage {
    this.buttons.push({ index, call: { text, phone } });
    return this;
  }

  /**
   * * Adiciona um botão respondivel
   * @param text
   * @param id
   * @param index
   * @returns
   */
  public addReply(
    text: string,
    id: string = this.generateID(),
    index: number = this.buttons.length + 1
  ): ButtonMessage {
    this.buttons.push({ index, reply: { text, id } });
    return this;
  }

  /**
   * * Remove um botão
   * @param index
   */
  public remove(index: number) {
    this.buttons = this.buttons.filter((button: Button) => {
      if (button.index !== index) return button;
    });
  }

  /**
   * * Gera um novo ID
   * @returns
   */
  public generateID(): string {
    return String(this.buttons.length + 1);
  }
}
