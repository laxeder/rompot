/// <reference types="node" />
import type { ConnectionStatus } from "../types/Connection";
import type { UserAction } from "../types/User";
import type { ChatStatus } from "../types/Chat";
import type { Media } from "../types/Message";
import { DisconnectReason, proto, MediaDownloadOptions, WASocket, SocketConfig } from "@whiskeysockets/baileys";
import ConfigWAEvents from "./ConfigWAEvents";
import { WAChats, WAUsers } from "./WATypes";
import { WAChat, WAUser } from "./WAModules";
import { IMessage, IPollMessage } from "../interfaces/IMessage";
import { IChat } from "../interfaces/IChat";
import { IUser } from "../interfaces/IUser";
import { IAuth } from "../interfaces/IAuth";
import { IBot } from "../interfaces/IBot";
import WaitCallBack from "../utils/WaitCallBack";
import { BotEvents } from "../utils/Emmiter";
export default class WhatsAppBot implements IBot {
    sock: WASocket;
    DisconnectReason: typeof DisconnectReason;
    users: WAUsers;
    ev: BotEvents;
    status: ConnectionStatus;
    id: string;
    auth: IAuth;
    logger: any;
    wcb: WaitCallBack;
    config: Partial<SocketConfig>;
    configEvents: ConfigWAEvents;
    chats: WAChats;
    apiMessagesId: string[];
    polls: {
        [id: string]: IPollMessage;
    };
    constructor(config?: Partial<SocketConfig>);
    connect(auth?: string | IAuth): Promise<void>;
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
    saveChats(chats?: any): Promise<void>;
    /**
     * * Salva os usuários salvos
     * @param users Usuários
     */
    saveUsers(users?: any): Promise<void>;
    /**
     * * Salva as mensagem de enquete salvas
     * @param polls Enquetes
     */
    savePolls(polls?: any): Promise<void>;
    /**
     * * Salva as mensagens enviadas salvas
     * @param messages Mensagens enviadas
     */
    saveApiMessagesId(messages?: any): Promise<void>;
    /**
     * * Obtem os chats salvos
     */
    readChats(): Promise<void>;
    /**
     * * Obtem os usuários salvos
     */
    readUsers(): Promise<void>;
    /**
     * * Obtem as mensagem de enquete salvas
     */
    readPolls(): Promise<void>;
    /**
     * * Obtem as mensagem enviadas salvas
     */
    readApiMessagesId(): Promise<void>;
    /**
     * * Lê o chat
     * @param chat Sala de bate-papo
     */
    readChat(chat: any): Promise<WAChat>;
    /**
     * * Lê o usuário
     * @param user Usuário
     * @param save Salva usuário lido
     */
    readUser(user: any): Promise<WAUser>;
    /**
     * * Trata atualizações de participantes
     * @param action Ação realizada
     * @param chatId Sala de bate-papo que a ação foi realizada
     * @param userId Usuário que foi destinado a ação
     * @param fromId Usuário que realizou a ação
     */
    groupParticipantsUpdate(action: UserAction, chatId: string, userId: string, fromId: string): Promise<void>;
    getChatName(chat: IChat): Promise<string>;
    setChatName(chat: IChat, name: string): Promise<void>;
    getChatDescription(chat: IChat): Promise<string>;
    setChatDescription(chat: IChat, description: string): Promise<any>;
    getChatProfile(chat: IChat): Promise<Buffer>;
    setChatProfile(chat: IChat, image: Buffer): Promise<void>;
    addChat(chat: IChat): Promise<void>;
    removeChat(chat: IChat): Promise<void>;
    getChat(chat: IChat): Promise<WAChat | null>;
    setChat(chat: IChat): Promise<void>;
    getChats(): Promise<WAChats>;
    setChats(chats: WAChats): Promise<void>;
    getChatUsers(chat: IChat): Promise<WAUsers>;
    getChatAdmins(chat: IChat): Promise<WAUsers>;
    getChatLeader(chat: IChat): Promise<WAUser>;
    addUserInChat(chat: IChat, user: IUser): Promise<void>;
    removeUserInChat(chat: IChat, user: IUser): Promise<void>;
    promoteUserInChat(chat: IChat, user: IUser): Promise<void>;
    demoteUserInChat(chat: IChat, user: IUser): Promise<void>;
    changeChatStatus(chat: IChat, status: ChatStatus): Promise<void>;
    createChat(chat: IChat): Promise<void>;
    leaveChat(chat: IChat): Promise<void>;
    getUserName(user: IUser): Promise<string>;
    setUserName(user: IUser, name: string): Promise<void>;
    getUserDescription(user: IUser): Promise<string>;
    setUserDescription(user: IUser, description: string): Promise<void>;
    getUserProfile(user: IUser, lowQuality?: boolean): Promise<Buffer>;
    setUserProfile(user: IUser, image: Buffer): Promise<void>;
    getUser(user: IUser): Promise<WAUser | null>;
    setUser(user: IUser): Promise<void>;
    getUsers(): Promise<WAUsers>;
    setUsers(users: WAUsers): Promise<void>;
    addUser(user: IUser): Promise<void>;
    removeUser(user: IUser): Promise<void>;
    blockUser(user: IUser): Promise<void>;
    unblockUser(user: IUser): Promise<void>;
    getBotName(): Promise<string>;
    setBotName(name: string): Promise<void>;
    getBotDescription(): Promise<string>;
    setBotDescription(description: string): Promise<void>;
    getBotProfile(): Promise<Buffer>;
    setBotProfile(image: Buffer): Promise<void>;
    /**
     * * Adiciona uma mensagem na lista de mensagens enviadas
     * @param msgId ID da mensagem que será adicionada
     */
    addApiMessageId(msgId: string): Promise<void>;
    /**
     * * Remove uma mensagem da lista de mensagens enviadas
     * @param message Mensagem que será removida
     */
    removeMessageIgnore(msgId: string): Promise<void>;
    readMessage(message: IMessage): Promise<void>;
    removeMessage(message: IMessage): Promise<void>;
    deleteMessage(message: IMessage): Promise<void>;
    addReaction(message: IMessage, reaction: string): Promise<void>;
    removeReaction(message: IMessage): Promise<void>;
    send(content: IMessage): Promise<IMessage>;
    downloadStreamMessage(media: Media): Promise<Buffer>;
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
    groupAcceptInvite(code: string): Promise<string>;
    /**
     * * Gera a configuração de navegador
     * @param name Nome da plataforma
     * @param browser Nome do navegador
     * @param version Versão do navegador
     */
    static Browser(name?: string, browser?: string, version?: string): [string, string, string];
}
