import { DisconnectReason, proto, MediaDownloadOptions, UserFacingSocketConfig } from "@adiwajshing/baileys";
import { Message } from "../messages/Message";
import { BaseBot } from "../utils/BaseBot";
import { Status } from "../models/Status";
import { Chat } from "../models/Chat";
import { User } from "../models/User";
import { BuildConfig } from "../config/BuildConfig";
export declare class WhatsAppBot extends BaseBot {
    private _auth;
    private _bot?;
    DisconnectReason: typeof DisconnectReason;
    chats: {
        [key: string]: Chat;
    };
    config: any;
    statusOpts: any;
    constructor(config?: BuildConfig);
    /**
     * * Conecta ao servidor do WhatsApp
     * @param auth
     * @param config
     * @returns
     */
    connect(auth: string, config?: BuildConfig): Promise<any>;
    /**
     * * Reconecta ao servidor do WhatsApp
     * @param config
     * @returns
     */
    reconnect(config?: UserFacingSocketConfig): Promise<any>;
    /**
     * * Desliga a conexão com o servidor do WhatsApp
     * @param reason
     * @returns
     */
    stop(reason?: Error): Promise<any>;
    /**
     * * Lê o chat e seta ele
     * @param chat
     */
    private chatUpsert;
    /**
     * * Obter uma sala de bate-papo
     * @param id
     * @returns
     */
    getChat(id: string): Promise<Chat | null>;
    /**
     * * Obter todas as salas de bate-papo
     * @returns
     */
    getChats(): Promise<{
        [key: string]: Chat;
    }>;
    /**
     * * Define uma sala de bate-papo
     * @param chat
     */
    setChat(chat: Chat): Promise<void>;
    /**
     * * Define as salas de bate-papo
     * @param chats
     */
    setChats(chats: {
        [key: string]: Chat;
    }): Promise<void>;
    /**
     * * Remove uma sala de bate-papo
     * @param id
     */
    removeChat(id: Chat | string): Promise<void>;
    /**
     * * Adiciona um usuário a uma sala de bate-papo
     * @param chat
     * @param user
     */
    addMember(chat: Chat, user: User): Promise<void>;
    /**
     * * Remove um usuário da sala de bate-papo
     * @param chat
     * @param user
     */
    removeMember(chat: Chat, user: User): Promise<void>;
    /**
     * * Remove uma mensagem da sala de bate-papo
     * @param message
     * @returns
     */
    removeMessage(message: Message): Promise<void | undefined>;
    /**
     * * Deleta uma mensagem da sala de bate-papo
     * @param message
     * @returns
     */
    deleteMessage(message: Message): Promise<any>;
    /**
     * * Envia um conteúdo
     * @param content
     * @returns
     */
    send(content: Message | Status): Promise<any>;
    /**
     * * Faz o download de arquivos do WhatsApp
     * @param message
     * @param type
     * @param options
     * @param ctx
     * @returns
     */
    download(message: any, type: "buffer" | "stream", options: MediaDownloadOptions, ctx?: any): Promise<any>;
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
