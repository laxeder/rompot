/// <reference types="node" />
import type { Media } from "../types/Message";
import { MessageType } from "../enums/Message";
import { IFileMessage } from "../interfaces/IMessage";
import { IChat } from "../interfaces/IChat";
import MediaMessage from "./MediaMessage";
export default class FileMessage extends MediaMessage implements IFileMessage {
    readonly type = MessageType.File;
    constructor(chat: IChat | string, text: string, file: Media | Buffer | string, others?: Partial<FileMessage>);
    /**
     * @returns Obter arquivo
     */
    getFile(): Promise<Buffer>;
}
