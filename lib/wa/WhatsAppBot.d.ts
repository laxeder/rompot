/// <reference types="node" />
import { DisconnectReason, proto, MediaDownloadOptions, UserFacingSocketConfig } from "@adiwajshing/baileys";
import { BuildConfig } from "../config/BuildConfig";
import { StatusOptions } from "../types/Status";
import { Message } from "../messages/Message";
import { Status } from "../models/Status";
import { Chat } from "../models/Chat";
import { User } from "../models/User";
import { Bot } from "../models/Bot";
export declare class WhatsAppBot extends Bot {
    private _auth;
    private _bot;
    statusOpts: keyof StatusOptions | any;
    DisconnectReason: typeof DisconnectReason;
    chats: {
        [key: string]: Chat;
    };
    private _savedChats;
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
    reconnect(config?: UserFacingSocketConfig, alert?: boolean): Promise<any>;
    /**
     * * Desliga a conexão com o servidor do WhatsApp
     * @param reason
     * @returns
     */
    stop(reason?: any): Promise<any>;
    /**
     * * Salva os chats salvos
     * @param chats
     */
    private saveChats;
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
    removeMessage(message: Message): Promise<any>;
    /**
     * * Deleta uma mensagem da sala de bate-papo
     * @param message
     * @returns
     */
    deleteMessage(message: Message): Promise<any>;
    /**
     * * Bloqueia um usuário
     * @param user
     */
    blockUser(user: User): Promise<any>;
    /**
     * * Desbloqueia um usuário
     * @param user
     */
    unblockUser(user: User): Promise<any>;
    /**
     * * Define o nome do bot
     * @param name
     * @returns
     */
    setBotName(name: string): Promise<any>;
    /**
     * * Retorna a imagem do bot / usuário / chat
     * @param id
     * @returns
     */
    getProfile(id?: string | Chat | User): Promise<any>;
    /**
     * * Define a imagem do bot ou de um grupo
     * @param image
     * @param id
     * @returns
     */
    setProfile(image: Buffer, id?: Chat | string): Promise<any>;
    /**
     * * Cria uma nova sala de bate-papo
     * @param name
     * @returns
     */
    createChat(name: string): Promise<any>;
    /**
     * * Define o nome da sala de bate-papo
     * @param id
     * @param name
     * @returns
     */
    setChatName(id: string | Chat, name: string): Promise<any>;
    /**
     * * Retorna a descrição do bot ou de um usuário
     * @param id
     * @returns
     */
    getDescription(id?: User | string): Promise<any>;
    /**
     * * Define a descrição do bot ou de uma sala de bate-papo
     * @param desc
     * @param id
     * @returns
     */
    setDescription(desc: string, id?: string | Chat): Promise<any>;
    /**
     * * Sai da sala de bate-papo
     * @param chat
     * @returns
     */
    leaveChat(chat: Chat | string): Promise<any>;
    sendMessage(content: Message): Promise<Message>;
    /**
     * * Envia um conteúdo
     * @param content
     * @returns
     */
    sendStatus(content: Status): Promise<any>;
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
