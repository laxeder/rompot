/// <reference types="node" />
import { DisconnectReason, proto, MediaDownloadOptions, SocketConfig } from "@adiwajshing/baileys";
import { IMessage } from "../interfaces/Messages";
import { IChat } from "../interfaces/Chat";
import { IUser } from "../interfaces/User";
import IBot from "../interfaces/IBot";
import Auth from "../interfaces/Auth";
import { BotEvents } from "../utils/Emmiter";
import WaitCallBack from "../utils/WaitCallBack";
import { ConnectionStatus } from "../types/Connection";
import { ChatStatus, IChats } from "../types/Chat";
import { IUsers } from "../types/User";
export default class WhatsAppBot implements IBot {
    private sock;
    DisconnectReason: typeof DisconnectReason;
    chats: IChats;
    ev: BotEvents;
    status: ConnectionStatus;
    id: string;
    auth: Auth;
    wcb: WaitCallBack;
    config: Partial<SocketConfig>;
    constructor(config?: Partial<SocketConfig>);
    connect(auth?: string | Auth): Promise<void>;
    /**
     * * Reconecta ao servidor do WhatsApp
     * @param alert Avisa que está econectando
     * @returns
     */
    reconnect(alert?: boolean): Promise<any>;
    /**
     * * Desliga a conexão com o servidor do WhatsApp
     * @param reason
     * @returns
     */
    stop(reason?: any): Promise<void>;
    /**
     * * Salva os chats salvos
     * @param chats Sala de bate-papos
     */
    protected saveChats(chats?: any): Promise<void>;
    /**
     * * Lê o chat e seta ele
     * @param chat Sala de bate-papo
     */
    protected chatUpsert(chat: any): Promise<void>;
    addChat(chat: IChat): Promise<void>;
    removeChat(chat: IChat): Promise<void>;
    getChat(chat: IChat): Promise<IChat | null>;
    setChat(chat: IChat): Promise<void>;
    getChats(): Promise<IChats>;
    setChats(chats: IChats): Promise<void>;
    getChatAdmins(chat: IChat): Promise<IUsers>;
    getChatLeader(chat: IChat): Promise<IUser>;
    addUserInChat(chat: IChat, user: IUser): Promise<void>;
    removeUserInChat(chat: IChat, user: IUser): Promise<void>;
    promoteUserInChat(chat: IChat, user: IUser): Promise<void>;
    demoteUserInChat(chat: IChat, user: IUser): Promise<void>;
    changeChatStatus(chat: IChat, status: ChatStatus): Promise<void>;
    createChat(chat: IChat): Promise<any>;
    leaveChat(chat: IChat): Promise<any>;
    getUser(user: IUser): Promise<IUser | null>;
    setUser(user: IUser): Promise<void>;
    getUsers(): Promise<IUsers>;
    setUsers(users: IUsers): Promise<void>;
    addUser(user: IUser): Promise<void>;
    removeUser(user: IUser): Promise<void>;
    blockUser(user: IUser): Promise<void>;
    unblockUser(user: IUser): Promise<void>;
    getBotName(): Promise<string>;
    setBotName(name: string): Promise<any>;
    getUserName(user: IUser): Promise<string>;
    setUserName(user: IUser, name: string): Promise<any>;
    getChatName(chat: IChat): Promise<string>;
    setChatName(chat: IChat, name: string): Promise<any>;
    getBotProfile(): Promise<Buffer>;
    setBotProfile(image: Buffer): Promise<any>;
    getUserProfile(user: IUser): Promise<Buffer>;
    setUserProfile(user: IUser, image: Buffer): Promise<any>;
    getChatProfile(chat: IChat): Promise<Buffer>;
    setChatProfile(chat: IChat, image: Buffer): Promise<any>;
    getBotDescription(): Promise<any>;
    setBotDescription(description: string): Promise<any>;
    getUserDescription(user: IUser): Promise<any>;
    setUserDescription(user: IUser, description: string): Promise<any>;
    getChatDescription(chat: IChat): Promise<string>;
    setChatDescription(chat: IChat, description: string): Promise<any>;
    readMessage(message: IMessage): Promise<void>;
    removeMessage(message: IMessage): Promise<any>;
    deleteMessage(message: IMessage): Promise<void>;
    addReaction(message: IMessage, reaction: string): Promise<void>;
    removeReaction(message: IMessage): Promise<void>;
    send(content: IMessage): Promise<IMessage>;
    /**
     * * Faz o download de arquivos do WhatsApp
     * @param message
     * @param type
     * @param options
     * @param ctx
     * @returns
     */
    download(message: proto.WebMessageInfo, type: "buffer" | "stream", options: MediaDownloadOptions, ctx?: any): Promise<any>;
    /**
     * * Verifica se o número está registrado no WhatsApp
     * @returns
     */
    onExists(id: string): Promise<{
        exists: boolean;
        id: string;
    }>;
    /**
     * * Atualiza uma mensagem de mídia
     * @param message
     * @returns
     */
    updateMediaMessage(message: proto.IWebMessageInfo): Promise<proto.IWebMessageInfo>;
    /**
     * * Aceita o convite para um grupo
     * @param code
     * @returns
     */
    groupAcceptInvite(code: string): Promise<string | undefined> | undefined;
}
