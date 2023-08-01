/// <reference types="node" />
import { DisconnectReason, proto, MediaDownloadOptions, WASocket, SocketConfig, makeInMemoryStore, AuthenticationCreds, WAConnectionState, ConnectionState } from "@whiskeysockets/baileys";
import { BotStatus, ChatStatus, IAuth, IBot, IChat, IMessage, IPollMessage, IReactionMessage, IUser, Media, UserAction } from "rompot-base";
import ConfigWAEvents from "./ConfigWAEvents";
import { WAChat, WAUser } from "./WAModules";
import { BotEvents } from "../modules/bot";
import WaitCallBack from "../utils/WaitCallBack";
export default class WhatsAppBot implements IBot {
    sock: WASocket;
    config: Partial<SocketConfig & {
        usePairingCode: boolean;
    }>;
    store: ReturnType<typeof makeInMemoryStore>;
    saveCreds: (creds: Partial<AuthenticationCreds>) => Promise<void>;
    DisconnectReason: typeof DisconnectReason;
    logger: any;
    id: string;
    status: BotStatus;
    ev: BotEvents;
    auth: IAuth;
    configEvents: ConfigWAEvents;
    wcb: WaitCallBack;
    chatWCB: WaitCallBack;
    msgWCB: WaitCallBack;
    chats: Record<string, WAChat>;
    users: Record<string, WAUser>;
    polls: {
        [id: string]: IPollMessage;
    };
    constructor(config?: Partial<SocketConfig & {
        usePairingCode: boolean;
    }>);
    connect(auth?: string | IAuth): Promise<void>;
    connectByCode(phoneNumber: string, auth: string | IAuth): Promise<string>;
    internalConnect(): Promise<void>;
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
     * * Aguarda um status de conexão
     */
    awaitConnectionState(connection: WAConnectionState): Promise<ConnectionState>;
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
    getChats(): Promise<Record<string, WAChat>>;
    setChats(chats: Record<string, WAChat>): Promise<void>;
    getChatUsers(chat: IChat): Promise<Record<string, WAUser>>;
    getChatAdmins(chat: IChat): Promise<Record<string, WAUser>>;
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
    getUsers(): Promise<Record<string, WAUser>>;
    setUsers(users: Record<string, WAUser>): Promise<void>;
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
    readMessage(message: IMessage): Promise<void>;
    removeMessage(message: IMessage): Promise<void>;
    deleteMessage(message: IMessage): Promise<void>;
    addReaction(message: IReactionMessage): Promise<void>;
    removeReaction(message: IReactionMessage): Promise<void>;
    editMessage(message: IMessage): Promise<void>;
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
