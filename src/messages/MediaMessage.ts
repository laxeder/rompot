import { Message } from "@messages/Message";
import { Chat } from "@modules/Chat";

export class MediaMessage extends Message {
  private _getStream?: Function;
  private _image?: any;
  private _video?: any;
  private _audio?: any;

  public isGIF: boolean = false;

  constructor(chat: Chat, text: string, mention?: Message, id?: string) {
    super(chat, text, mention, id);
  }

  /**
   * * Define o meio de leitura da midia da mensagem
   * @param fnStream
   */
  public setSream(fnStream: Function) {
    this._getStream = fnStream;
  }

  /**
   * * Obtem a midia da mensagem
   * @param stream
   * @returns
   */
  public async getStream(stream: any) {
    if (stream instanceof Buffer) return stream;
    if (this._getStream) return await this._getStream(stream);
    return Buffer.from("");
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
    if (!!!this._image) return undefined;
    return await this.getStream(this._image);
  }

  /**
   * * Define o video da mensagem
   * @param video
   */
  public setVideo(video: any) {
    this._video = video;
  }

  /**
   * * Obtem o video da mensagem
   * @returns
   */
  public async getVideo() {
    if (!!!this._video) return undefined;
    return await this.getStream(this._video);
  }

  /**
   * * Define o audio da mensagem
   * @param audio
   */
  public setAudio(audio: any) {
    this._audio = audio;
  }

  /**
   * * Obtem o audio da mensagem
   * @returns
   */
  public async getAudio() {
    if (!!!this._audio) return undefined;
    return await this.getStream(this._audio);
  }

  /**
   * * Define se a imagem é um GIF
   * @param gif
   */
  public setIsGIF(gif: boolean) {
    this.isGIF = gif;
  }

  /**
   * * Retorna se a imagem é um GIF
   * @returns
   */
  public getIsGIF(): boolean {
    return this.isGIF;
  }
}
