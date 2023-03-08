/// <reference types="long" />
/// <reference types="node" />
import { Chat } from "@adiwajshing/baileys";
import { IChat } from "@interfaces/Chat";
import { IUser } from "@interfaces/User";
import { ClientType } from "@modules/Client";
import User from "@modules/User";
import { Button, List, ListItem } from "../types/Message";
export interface IMessage {
    /**
     * * ID da mensagem
     */
    id: string;
    /**
     * * Sala de bate-papo que foi enviada a mensagem
     */
    chat: IChat;
    /**
     * * Usuário que mandou a mensagem
     */
    user: IUser;
    /**
     * * Texto da mensagem
     */
    text: string;
    /**
     * * Mensagem enviada por mim
     */
    fromMe: boolean;
    /** * Opção selecionada */
    selected: string;
    /**
     * * Usuários que foram mencionados na mensagem
     */
    mentions: string[];
    /**
     * * Mensagem mencionada na mensagem
     */
    mention?: IMessage;
    /**
     * * Tempo em que a mensagem foi enviada
     */
    timestamp: Number | Long;
}
export interface IMediaMessage extends IMessage {
    /**
     * * Conteúdo da mensagem
     */
    file: any;
    /**
     * * Retorna se o conteúdo é um GIF
     */
    isGIF: boolean;
    /**
     * * Método para obter o conteúdo da mensagem
     * @param stream Conteúdo que será obtido
     * @return Conteúdo da mensagem
     */
    getStream(stream: any): Promise<Buffer>;
}
export interface IImageMessage extends IMediaMessage {
    /**
     * @return Retorna a imagem da mensagem
     */
    getImage(): Promise<Buffer>;
}
export interface IVideoMessage extends IMediaMessage {
    /**
     * @returns Retorna o video da mensagem
     */
    getVideo(): Promise<Buffer>;
}
export interface IAudioMessage extends IMediaMessage {
    /**
     * @return Retorna o audio da mensagem
     */
    getAudio(): Promise<Buffer>;
}
export interface ILocationMessage extends IMessage {
    /**
     * * Longitude da localização
     */
    latitude: number;
    /**
     * * Latitude da localização
     */
    longitude: number;
    /**
     * * Define a latitude e longitude da localização
     * @param latitude
     * @param longitude
     */
    setLocation(latitude: number, longitude: number): void;
}
export interface IContactMessage extends IMessage {
    /**
     * * Contatos da mensagem
     */
    contacts: IUser[];
}
export interface IListMessage extends IMessage {
    /**
     * * Titulo da mensagem
     */
    title: string;
    /**
     * * Rodapé da mensagem
     */
    footer: string;
    /**
     * * Botão da mensagem
     */
    button: string;
    /**
     * * Lista da mensagem
     */
    list: List[];
    /**
     * * Adiciona uma seção
     * @param title Titulo da lista
     * @param items Items da lista
     * @returns Categoria criada
     */
    addCategory(title: string, items?: ListItem[]): number;
    /**
     * * Adiciona um item a lista
     * @param index Categoria do item
     * @param title Titulo do item
     * @param description Descrição do item
     * @param id ID do item
     */
    addItem(index: number, title: string, description: string, id: string): void;
}
export interface IButtonMessage extends IMessage {
    /**
     * * Botões da mensagem
     */
    buttons: Button[];
    /**
     * * Rodapé da mensagem
     */
    footer: string;
    /**
     * * Adiciona um botão com uma url
     * @param text Texto da botão
     * @param url Url do botão
     * @param index Posição do botão
     */
    addUrl(text: string, url: string, index?: number): void;
    /**
     * * Adiciona um botão com um telefone
     * @param text Texto do botão
     * @param phone Tefefone do botão
     * @param index Posição do botão
     */
    addCall(text: string, phone: string, index?: number): void;
    /**
     * * Adiciona um botão respondivel
     * @param text Texto do botão
     * @param id ID do botão
     * @param index Posição do botão
     */
    addReply(text: string, id: string, index?: number): void;
    /**
     * * Remove um botão
     * @param index Posição do botão
     */
    remove(index: number): void;
}
export interface IMessageModule {
    /** * Cliente do modulo */
    client: ClientType;
    /** * Sala de bate-papo que foi enviado a mensagem */
    chat: Chat;
    /** * Usuário que enviou a mensagem */
    user: User;
    /** * Mnesagem mencionada */
    mention?: IMessage & IMessageModule;
    /**
     * * Adiciona uma reação a mensagem
     * @param reaction Reação
     */
    addReaction(reaction: string): Promise<void>;
    /**
     * * Envia uma mensagem mencionando a mensagem atual
     * @param message Mensagem que terá enviada
     * @param mention Se verdadeiro a mensagem é mencionada
     */
    reply(message: IMessage | string, mention?: boolean): Promise<IMessage & IMessageModule>;
    /**
     * * Marca mensagem como visualizada
     */
    read(): Promise<void>;
}
