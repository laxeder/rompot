/// <reference types="long" />
/// <reference types="node" />
import type { Button, Media, PollAction, PollOption } from "../types/Message";
import type { Categories } from "@laxeder/wa-sticker/dist";
import { MessageType } from "../enums/Message";
import { IClient } from "./IClient";
import { IUser } from "./IUser";
import { IChat } from "./IChat";
export interface IMessage {
    get client(): IClient;
    set client(client: IClient);
    /** * Tipo da mensagem */
    type: MessageType;
    /** * Sala de bate-papo que foi enviada a mensagem */
    chat: IChat;
    /** * Usuário que mandou a mensagem */
    user: IUser;
    /** * Texto da mensagem */
    text: string;
    /** * Mensagem mencionada na mensagem */
    mention?: IMessage | undefined;
    /** * ID da mensagem */
    id: string;
    /** * Mensagem enviada pelo bot */
    fromMe: boolean;
    /** * Mensagem enviada pela api */
    apiSend: boolean;
    /** * Mensagem foi deletada */
    isDeleted: boolean;
    /** * Opção selecionada */
    selected: string;
    /** * Usuários mencionados na mensagem */
    mentions: string[];
    /** * Tempo em que a mensagem foi enviada */
    timestamp: Number | Long;
    /**
     * * Adiciona uma reação a mensagem
     * @param reaction Reação
     */
    addReaction(reaction: string): Promise<void>;
    /**
     * * Remove a reação da mensagem
     */
    removeReaction(): Promise<void>;
    /**
     * * Adiciona animações na reação da mensagem
     * @param reactions Reações em sequência
     * @param interval Intervalo entre cada reação
     * @param maxTimeout Maximo de tempo reagindo
     */
    addAnimatedReaction(reactions: string[], interval?: number, maxTimeout?: number): (reactionStop?: string) => Promise<void>;
    /**
     * * Envia uma mensagem mencionando a mensagem atual
     * @param message Mensagem que terá enviada
     * @param mention Se verdadeiro a mensagem é mencionada
     */
    reply(message: IMessage | string, mention?: boolean): Promise<IMessage>;
    /**
     * * Marca mensagem como visualizada
     */
    read(): Promise<void>;
}
export interface IEmptyMessage extends IMessage {
    readonly type: MessageType.Empty;
}
export interface IReactionMessage extends IMessage {
    readonly type: MessageType.Reaction;
}
export interface IContactMessage extends IMessage {
    readonly type: MessageType.Contact;
    /** * Contatos da mensagem */
    contacts: IUser[];
}
export interface ILocationMessage extends IMessage {
    readonly type: MessageType.Location;
    /** * Latitude */
    latitude: number;
    /** * Longitude */
    longitude: number;
}
export interface IListMessage extends IMessage {
    readonly type: MessageType.List;
    /** * Texto do botão */
    button: string;
    /** * Rodapé da lista */
    footer: string;
    /** * Titulo da lista */
    title: string;
    /** * Lista */
    list: List[];
}
export interface IButtonMessage extends IMessage {
    /** * Tipo dos botões */
    type: MessageType.Button | MessageType.TemplateButton;
    /** * Rodapé da mensagem */
    footer: string;
    /** * Botões da mensagem */
    buttons: Button[];
}
export interface IPollMessage extends IMessage {
    readonly type: MessageType.Poll | MessageType.PollUpdate;
    /** * Last hash votes */
    votes: {
        [user: string]: string[];
    };
    /** * Opções da enquete */
    options: PollOption[];
    /** * Chave secreta da enquete */
    secretKey: Uint8Array;
    /** * Ação da enquete */
    action: PollAction;
    /**
     * * Adiciona uma opção a enquete
     * @param name Nome da opção
     * @param id ID da opção
     */
    addOption(name: string, id?: string): any;
    /**
     * * Remove uma opção
     * @param option Opção que será removida
     */
    removeOption(option: PollOption): any;
    /**
     * * Obtem os votos de um usuário
     */
    getUserVotes(user: string): string[];
    /**
     * * Salva os votos de um usuário
     */
    setUserVotes(user: string, hashVotes: string[]): any;
}
export interface IPollUpdateMessage extends IPollMessage {
    readonly type: MessageType.PollUpdate;
}
export interface IMediaMessage extends IMessage {
    /** * Arquivo da mensagem */
    file: Media | Buffer | string;
    /** * O arquivo é um GIF */
    isGIF: boolean;
    /** * MimeType */
    mimetype: string;
    /** * Nome do arquivo */
    name: string;
    /**
     * @returns Obter arquivo
     */
    getStream(): Promise<Buffer>;
}
export interface IFileMessage extends IMediaMessage {
    readonly type: MessageType.File;
    getFile(): Promise<Buffer>;
}
export interface IAudioMessage extends IMediaMessage {
    readonly type: MessageType.Audio;
    getAudio(): Promise<Buffer>;
}
export interface IImageMessage extends IMediaMessage {
    readonly type: MessageType.Image;
    getImage(): Promise<Buffer>;
}
export interface IVideoMessage extends IMediaMessage {
    readonly type: MessageType.Video;
    getVideo(): Promise<Buffer>;
}
export interface IStickerMessage extends IMediaMessage {
    readonly type: MessageType.Sticker;
    /** * Categoria da figurinha */
    categories: Categories[];
    /** * ID da figurinha */
    stickerId: string;
    /** * Criador da figurinha */
    author: string;
    /** * Pacote da figurinha */
    pack: string;
    getSticker(): Promise<Buffer>;
}
export interface List {
    /**
     * * Titulo da lista
     */
    title: string;
    /**
     * * Items da lista
     */
    items: ListItem[];
}
export interface ListItem {
    /**
     * * Titulo do item
     */
    title: string;
    /**
     * * Descrição do item
     */
    description: string;
    /**
     * * ID do item
     */
    id: string;
}
