import { Message } from "./Message";
import { Chat } from "../models/Chat";
export declare class MediaMessage extends Message {
    private _getStream?;
    private _image?;
    private _video?;
    private _audio?;
    isGIF: boolean;
    constructor(chat: Chat, text: string, mention?: Message, id?: string);
    /**
     * * Define o meio de leitura da midia da mensagem
     * @param fnStream
     */
    setSream(fnStream: Function): void;
    /**
     * * Obtem a midia da mensagem
     * @param stream
     * @returns
     */
    getStream(stream: any): Promise<any>;
    /**
     * * Define a imagem da mensagem
     * @param image
     */
    setImage(image: any): void;
    /**
     * * Obtem a imagem da mensagem
     * @returns
     */
    getImage(): Promise<any>;
    /**
     * * Define o video da mensagem
     * @param video
     */
    setVideo(video: any): void;
    /**
     * * Obtem o video da mensagem
     * @returns
     */
    getVideo(): Promise<any>;
    /**
     * * Define o audio da mensagem
     * @param audio
     */
    setAudio(audio: any): void;
    /**
     * * Obtem o audio da mensagem
     * @returns
     */
    getAudio(): Promise<any>;
    /**
     * * Define se a imagem é um GIF
     * @param gif
     */
    setIsGIF(gif: boolean): void;
    /**
     * * Retorna se a imagem é um GIF
     * @returns
     */
    getIsGIF(): boolean;
}
