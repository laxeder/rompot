/// <reference types="node" />
import { ChatType } from "rompot-base";
import Chat from "../modules/chat/models/Chat";
import User from "../modules/user/models/User";
import Message from "../messages/Message";
export declare class WAUser extends User {
    /** * Nome */
    name: string;
    /** * Descrição */
    description: string;
    /** * Foto de perfil */
    profile: Buffer;
    /** * É administrador */
    isChatAdmin: boolean;
    /** É líder */
    isChatLeader: boolean;
    constructor(id: string, name?: string, description?: string, profile?: Buffer);
}
export declare class WAChat extends Chat {
    /** * Nome */
    name: string;
    /** * Descrição */
    description: string;
    /** * Foto de perfil */
    profile: Buffer;
    /** * Usuários da sala de bate-papo */
    users: Record<string, WAUser>;
    constructor(id: string, type?: ChatType, name?: string, description?: string, profile?: Buffer, users?: Record<string, WAUser>);
    /**
     @returns Retorna o tipo da sala de bate-papo
     */
    static getChatType(chat: Chat | string): ChatType;
}
export declare class WAMessage extends Message {
    /** * Sala de bate-papo que foi enviada a mensagem */
    chat: WAChat;
    /** * Usuário que mandou a mensagem */
    user: WAUser;
    /** * Mensagem mencionada na mensagem */
    mention?: WAMessage | undefined;
    constructor(chat: WAChat | string, text: string, others: Partial<WAMessage>);
}
