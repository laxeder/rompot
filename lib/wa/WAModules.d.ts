/// <reference types="node" />
/// <reference types="long" />
import type { WAUsers } from "./WATypes";
import Message from "../messages/Message";
import Chat from "../modules/Chat";
import User from "../modules/User";
import { ChatType } from "../types/Chat";
export declare class WAUser extends User {
    /** * Nome */
    name: string;
    /** * Descrição */
    description: string;
    /** * Foto de perfil */
    profile: Buffer;
    /** * É administrador */
    isAdmin: boolean;
    /** É líder */
    isLeader: boolean;
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
    users: WAUsers;
    constructor(id: string, type?: ChatType, name?: string, description?: string, profile?: Buffer, users?: WAUsers);
}
export declare class WAMessage extends Message {
    /** * Sala de bate-papo que foi enviada a mensagem */
    chat: WAChat;
    /** * Usuário que mandou a mensagem */
    user: WAUser;
    /** * Mensagem mencionada na mensagem */
    mention?: WAMessage | undefined;
    constructor(chat: WAChat | string, text: string, mention?: WAMessage, id?: string, user?: WAUser | string, fromMe?: boolean, selected?: string, mentions?: string[], timestamp?: Number | Long);
}
