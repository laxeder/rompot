/// <reference types="node" />
import { DisconnectReason, proto, MediaDownloadOptions, SocketConfig } from "@adiwajshing/baileys";
import IBot from "../interfaces/IBot";
import Auth from "../interfaces/Auth";
import Message from "../messages/Message";
import User from "../modules/User";
import Chat from "../modules/Chat";
import { BotEvents } from "../utils/Emmiter";
import WaitCallBack from "../utils/WaitCallBack";
import { ConnectionStatus } from "../types/Connection";
import { Chats, ChatStatus } from "../types/Chat";
import { Users } from "../types/User";
export default class WhatsAppBot implements IBot {
    private sock;
    DisconnectReason: typeof DisconnectReason;
    chats: Chats;
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
    addChat(chat: Chat): Promise<void>;
    removeChat(chat: Chat): Promise<void>;
    getChat(chat: Chat): Promise<Chat | null>;
    setChat(chat: Chat): Promise<void>;
    getChats(): Promise<Chats>;
    setChats(chats: Chats): Promise<void>;
    getChatAdmins(chat: Chat): Promise<Users>;
    getChatLeader(chat: Chat): Promise<User>;
    addUserInChat(chat: Chat, user: User): Promise<void>;
    removeUserInChat(chat: Chat, user: User): Promise<void>;
    promoteUserInChat(chat: Chat, user: User): Promise<void>;
    demoteUserInChat(chat: Chat, user: User): Promise<void>;
    changeChatStatus(chat: Chat, status: ChatStatus): Promise<void>;
    createChat(chat: Chat): Promise<any>;
    leaveChat(chat: Chat): Promise<any>;
    getUser(user: User): Promise<User | null>;
    setUser(user: User): Promise<void>;
    getUsers(): Promise<Users>;
    setUsers(users: Users): Promise<void>;
    addUser(user: User): Promise<void>;
    removeUser(user: User): Promise<void>;
    blockUser(user: User): Promise<void>;
    unblockUser(user: User): Promise<void>;
    getBotName(): Promise<string>;
    setBotName(name: string): Promise<any>;
    getUserName(user: User): Promise<string>;
    setUserName(user: User, name: string): Promise<any>;
    getChatName(chat: Chat): Promise<string>;
    setChatName(chat: Chat, name: string): Promise<any>;
    getBotProfile(): Promise<Buffer>;
    setBotProfile(image: Buffer): Promise<any>;
    getUserProfile(user: User): Promise<Buffer>;
    setUserProfile(user: User, image: Buffer): Promise<any>;
    getChatProfile(chat: Chat): Promise<Buffer>;
    setChatProfile(chat: Chat, image: Buffer): Promise<any>;
    getBotDescription(): Promise<any>;
    setBotDescription(description: string): Promise<any>;
    getUserDescription(user: User): Promise<any>;
    setUserDescription(user: User, description: string): Promise<any>;
    getChatDescription(chat: Chat): Promise<string>;
    setChatDescription(chat: Chat, description: string): Promise<any>;
    readMessage(message: Message): Promise<void>;
    removeMessage(message: Message): Promise<any>;
    deleteMessage(message: Message): Promise<void>;
    addReaction(message: Message, reaction: string): Promise<void>;
    removeReaction(message: Message): Promise<void>;
    send(content: Message): Promise<Message>;
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
