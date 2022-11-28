import { DisconnectReason, proto, MediaDownloadOptions, UserFacingSocketConfig } from "@adiwajshing/baileys";
import { Message } from "../buttons/Message";
import { BaseBot } from "../utils/BaseBot";
import { Status } from "../models/Status";
export declare class WhatsAppBot extends BaseBot {
    private _auth;
    private _bot?;
    DisconnectReason: typeof DisconnectReason;
    config: UserFacingSocketConfig;
    bot: any;
    store?: any;
    statusOpts: any;
    constructor(config?: any);
    /**
     * * Conecta ao servidor do WhatsApp
     * @param auth
     * @param config
     * @returns
     */
    connect(auth: string, config?: UserFacingSocketConfig): Promise<any>;
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
