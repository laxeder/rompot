/// <reference types="node" />
import { DisconnectReason, proto, MediaDownloadOptions, WASocket, SocketConfig } from "baileys";
import ConfigWAEvents from "./ConfigWAEvents";
import { WAChats, WAUsers } from "./WATypes";
import { WAChat, WAUser } from "./WAModules";
import IAuth from "../interfaces/IAuth";
import IBot from "../interfaces/IBot";
import PollMessage from "../messages/PollMessage";
import Message from "../messages/Message";
import Chat from "../modules/Chat";
import User from "../modules/User";
import { BotEvents } from "../utils/Emmiter";
import WaitCallBack from "../utils/WaitCallBack";
import { ConnectionStatus } from "../types/Connection";
import { UserAction } from "../types/User";
import { ChatStatus } from "../types/Chat";
import { Media } from "../types/Message";
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
    polls: {
        [id: string]: PollMessage;
    };
    sendedMessages: {
        [id: string]: Message;
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
    saveSendedMessages(messages?: any): Promise<void>;
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
    readSendedMessages(): Promise<void>;
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
    getChatName(chat: Chat): Promise<string>;
    setChatName(chat: Chat, name: string): Promise<void>;
    getChatDescription(chat: Chat): Promise<string>;
    setChatDescription(chat: Chat, description: string): Promise<any>;
    getChatProfile(chat: Chat): Promise<Buffer>;
    setChatProfile(chat: Chat, image: Buffer): Promise<void>;
    addChat(chat: Chat): Promise<void>;
    removeChat(chat: Chat): Promise<void>;
    getChat(chat: Chat): Promise<WAChat | null>;
    setChat(chat: Chat): Promise<void>;
    getChats(): Promise<WAChats>;
    setChats(chats: WAChats): Promise<void>;
    getChatUsers(chat: Chat): Promise<WAUsers>;
    getChatAdmins(chat: Chat): Promise<WAUsers>;
    getChatLeader(chat: Chat): Promise<WAUser>;
    addUserInChat(chat: Chat, user: User): Promise<void>;
    removeUserInChat(chat: Chat, user: User): Promise<void>;
    promoteUserInChat(chat: Chat, user: User): Promise<void>;
    demoteUserInChat(chat: Chat, user: User): Promise<void>;
    changeChatStatus(chat: Chat, status: ChatStatus): Promise<void>;
    createChat(chat: Chat): Promise<void>;
    leaveChat(chat: Chat): Promise<any>;
    getUserName(user: User): Promise<string>;
    setUserName(user: User, name: string): Promise<void>;
    getUserDescription(user: User): Promise<string>;
    setUserDescription(user: User, description: string): Promise<any>;
    getUserProfile(user: User, lowQuality?: boolean): Promise<Buffer>;
    setUserProfile(user: User, image: Buffer): Promise<void>;
    getUser(user: User): Promise<WAUser | null>;
    setUser(user: User): Promise<void>;
    getUsers(): Promise<WAUsers>;
    setUsers(users: WAUsers): Promise<void>;
    addUser(user: User): Promise<void>;
    removeUser(user: User): Promise<void>;
    blockUser(user: User): Promise<void>;
    unblockUser(user: User): Promise<void>;
    getBotName(): Promise<string>;
    setBotName(name: string): Promise<void>;
    getBotDescription(): Promise<string>;
    setBotDescription(description: string): Promise<void>;
    getBotProfile(): Promise<Buffer>;
    setBotProfile(image: Buffer): Promise<void>;
    /**
     * * Adiciona uma mensagem na lista de mensagens enviadas
     * @param message Mensagem que será adicionada
     */
    addSendedMessage(message: any | Message): Promise<void>;
    /**
     * * Remove uma mensagem da lista de mensagens enviadas
     * @param message Mensagem que será removida
     */
    removeMessageIgnore(message: Message): Promise<void>;
    readMessage(message: Message): Promise<void>;
    removeMessage(message: Message): Promise<void>;
    deleteMessage(message: Message): Promise<void>;
    addReaction(message: Message, reaction: string): Promise<void>;
    removeReaction(message: Message): Promise<void>;
    send(content: Message): Promise<Message>;
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
    groupAcceptInvite(code: string): Promise<string | undefined> | undefined;
    /**
     * * Gera a configuração de navegador
     * @param name Nome da plataforma
     * @param browser Nome do navegador
     * @param version Versão do navegador
     */
    static Browser(name?: string, browser?: string, version?: string): [string, string, string];
}
