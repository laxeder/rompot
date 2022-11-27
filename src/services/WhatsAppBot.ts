import { Boom } from "@hapi/boom";
import makeWASocket, {
  DisconnectReason,
  useMultiFileAuthState,
  downloadMediaMessage,
  proto,
  MediaDownloadOptions,
  UserFacingSocketConfig,
  ConnectionState,
  WAMessage,
  MessageUpsertType,
  WASocket,
  WAPresence,
  makeInMemoryStore,
  ParticipantAction,
} from "@adiwajshing/baileys";

import { WhatsAppConvertMessage } from "@controllers/WAConvertMessage";
import { WhatsAppMessage } from "@controllers/WAMessage";
import { Message } from "@models/Message";
import { BaseBot } from "@utils/BaseBot";
import { loggerConfig } from "@config/logger";
import { Status } from "@models/Status";
import { Chat } from "@models/Chat";
import { User } from "@models/User";

export class WhatsAppBot extends BaseBot {
  private _auth: string = "";
  private _bot?: WASocket;

  public DisconnectReason = DisconnectReason;
  public config: UserFacingSocketConfig;
  public bot: any = {};
  public store?: any;

  public statusOpts: any = {
    typing: "composing",
    reading: "reading",
    recording: "recording",
    online: "available",
    offline: "unavailable",
  };

  constructor(config?: any) {
    super();

    this.config = config || {
      printQRInTerminal: true,
      logger: loggerConfig({ level: "silent" }),
    };
  }

  /**
   * * Conecta ao servidor do WhatsApp
   * @param auth
   * @param config
   * @returns
   */
  public async connect(auth: string, config?: UserFacingSocketConfig): Promise<any> {
    return await new Promise(async (resolve, reject) => {
      try {
        if (!config) {
          config = this.config;
        }

        this._auth = auth;
        this.config = config || this.config;

        const { state, saveCreds } = await useMultiFileAuthState(this._auth);

        this._bot = makeWASocket({ ...this.config, auth: state });
        this._bot.ev.on("creds.update", saveCreds);

        this.store = makeInMemoryStore({});
        this.store.bind(this._bot.ev);

        //! A mensagem não é recebida depois de se reconectar
        this._bot.ev.on("messages.upsert", (m: { messages: WAMessage[]; type: MessageUpsertType }) => {
          if (m.messages.length <= 0) return;

          const message: WAMessage = m.messages[m.messages.length - 1];
          const msg = new WhatsAppConvertMessage(message, m.type);

          this.events.message.next(msg.get());
        });

        this._bot.ev.on("group-participants.update", (group) => {
          group.participants.forEach((user) => {
            this.events.member.next({ action: group.action, chat: new Chat(group.id), user: new User(user) });
          });
        });

        // Verificando se bot conectou
        this._bot.ev.on("connection.update", async (update: Partial<ConnectionState>) => {
          const status =
            (update.lastDisconnect?.error as Boom)?.output?.statusCode || update.lastDisconnect?.error || 500;

          this.events.connection.next({ action: update.connection, status, login: update?.qr });

          if (update.connection == "open") {
            this.status.setStatus("online");

            // Removendo caracteres do ID do bot
            this.bot.user = { ...this._bot?.user };
            this.bot.user.id = this.bot.user.id?.replace(/:(.*)@/, "@") || "";

            resolve(true);
          }

          if (update.connection == "close") {
            this.status.setStatus("offline");

            // Bot desligado
            if (status === DisconnectReason.loggedOut) return;

            resolve(await this.reconnect(this.config));
          }
        });
      } catch (err: any) {
        reject(err?.stack || err);
      }
    });
  }

  /**
   * * Reconecta ao servidor do WhatsApp
   * @param config
   * @returns
   */
  public reconnect(config?: UserFacingSocketConfig): Promise<any> {
    this.events.connection.next({ action: "reconnecting" });
    return this.connect(this._auth, config || this.config);
  }

  /**
   * * Desliga a conexão com o servidor do WhatsApp
   * @param reason
   * @returns
   */
  public stop(reason?: Error): Promise<any> {
    return new Promise(() => {
      this._bot?.end(reason);
    });
  }

  /**
   * * Envia um conteúdo
   * @param content
   * @returns
   */
  public async send(content: Message | Status): Promise<any> {
    if (content instanceof Message) {
      const waMSG = new WhatsAppMessage(this, content);
      await waMSG.refactory(content, this);

      const { chat, message, context, relay } = waMSG;

      if (relay == true) return this._bot?.relayMessage(chat, message, {});

      return this._bot?.sendMessage(chat, message, context);
    }

    //!TODO corrigir status de leitura em grupos
    if (content instanceof Status) {
      if (content.status === "reading") {
        return this._bot?.readMessages([{ remoteJid: content.chat?.id, id: content.id }]);
      }

      const status: WAPresence = this.statusOpts[content.status];
      return this._bot?.sendPresenceUpdate(status, content.chat?.id);
    }
  }

  /**
   * * Faz o download de arquivos do WhatsApp
   * @param message
   * @param type
   * @param options
   * @param ctx
   * @returns
   */
  public download(message: any, type: "buffer" | "stream", options: MediaDownloadOptions, ctx?: any): Promise<any> {
    return downloadMediaMessage(message, type, options, ctx);
  }

  /**
   * * Verifica se o número está registrado no WhatsApp
   * @returns
   */
  public async onExists(id: string): Promise<{ exists: boolean; id: string }> {
    const user = await this._bot?.onWhatsApp(id);

    if (user && user.length > 0) return { exists: user[0].exists, id: user[0].jid };

    return { exists: false, id };
  }

  /**
   * * Atualiza uma mensagem de mídia
   * @param message
   * @returns
   */
  public updateMediaMessage(message: proto.IWebMessageInfo): Promise<proto.IWebMessageInfo> {
    if (this._bot) return this._bot?.updateMediaMessage(message);
    throw "Sock não encontrado.";
  }

  /**
   * * Aceita o convite para um grupo
   * @param code
   * @returns
   */
  public groupAcceptInvite(code: string): Promise<string | undefined> | undefined {
    return this._bot?.groupAcceptInvite(code);
  }
}
