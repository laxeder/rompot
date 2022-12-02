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
  generateWAMessage,
} from "@adiwajshing/baileys";
import { existsSync, readFileSync, writeFileSync } from "fs";

import { WhatsAppConvertMessage } from "@wa/WAConvertMessage";
import { WhatsAppMessage } from "@wa/WAMessage";
import { loggerConfig } from "@config/logger";
import { Message } from "@messages/Message";
import { BaseBot } from "@utils/BaseBot";
import { Status } from "@models/Status";
import { Chat } from "@models/Chat";
import { User } from "@models/User";

export class WhatsAppBot extends BaseBot {
  private _auth: string = "";
  private _bot?: WASocket;

  public DisconnectReason = DisconnectReason;
  public chats: { [key: string]: Chat } = {};
  public config: UserFacingSocketConfig;
  public bot: any = {};

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

        //! A mensagem não é recebida depois de se reconectar
        this._bot.ev.on("messages.upsert", (m: { messages: WAMessage[]; type: MessageUpsertType }) => {
          if (m.messages.length <= 0) return;

          const message: WAMessage = m.messages[m.messages.length - 1];

          if (message.key.remoteJid == "status@broadcast") return;

          const msg = new WhatsAppConvertMessage(message, m.type);

          if (message.key.fromMe) {
            this.events["bot-message"].next(msg.get());
            return;
          }

          this.events.message.next(msg.get());
        });

        this._bot.ev.on("group-participants.update", (group) => {
          group.participants.forEach((user) => {
            this.events.member.next({ action: group.action, chat: new Chat(group.id), user: new User(user) });
          });
        });

        // Verificando se bot conectou
        this._bot.ev.on("connection.update", async (update: Partial<ConnectionState>) => {
          if (update.connection == "open") {
            this.status.setStatus("online");

            // Removendo caracteres do ID do bot
            this.bot.user = { ...this._bot?.user };
            this.bot.user.id = this.bot.user.id?.replace(/:(.*)@/, "@") || "";

            // Restaurando salas de bate-papo
            if (existsSync(`${this._auth}/chats.json`)) {
              const readedChats: any = JSON.parse(readFileSync(`${this._auth}/chats.json`, "utf-8") || "{}") || {};

              const chats = Object.keys(readedChats);

              for (const chatId of chats) {
                const readedChat = readedChats[chatId];
                const chat = new Chat(readedChat.id, readedChat.name);

                this.chats[chatId] = chat;
              }
            }

            this.events.connection.next({ action: update.connection, status: this.status, login: update?.qr });

            resolve(true);
          }

          if (update.connection == "close") {
            this.status.setStatus("offline");

            // Bot desligado
            const status =
              (update.lastDisconnect?.error as Boom)?.output?.statusCode || update.lastDisconnect?.error || 500;

            if (status === DisconnectReason.loggedOut) return;

            resolve(await this.reconnect(this.config));
          }
        });

        const chatUpsert = (chat: any) => {
          if (chat.id || chat.newJId) {
            const newChat = new Chat(chat.id || chat.newJid, chat.name || chat.verifiedName);
            this.setChat(newChat);
          }
        };

        this._bot.ev.on("contacts.update", (updates) => {
          for (const update of updates) chatUpsert(update);
        });

        this._bot.ev.on("chats.upsert", (newChats) => {
          for (const chat of newChats) chatUpsert(chat);
        });

        this._bot.ev.on("chats.update", (updates) => {
          for (const update of updates) chatUpsert(update);
        });

        this._bot.ev.on("chats.delete", (deletions) => {
          for (const id of deletions) this.removeChat(id);
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

  public saveChats() {
    writeFileSync(`${this._auth}/chats.json`, JSON.stringify(this.chats));
  }

  /**
   * * Obter uma sala de bate-papo
   * @param id
   * @returns
   */
  public async getChat(id: string): Promise<Chat | null> {
    return this.chats[id];
  }

  /**
   * * Obter todas as salas de bate-papo
   * @returns
   */
  public async getChats(): Promise<{ [key: string]: Chat }> {
    return this.chats;
  }

  /**
   * * Define uma sala de bate-papo
   * @param chat
   */
  public async setChat(chat: Chat) {
    if (chat.id == "status@broadcast") return;

    this.chats[chat.id] = chat;
    this.events.chat.next(chat);

    this.saveChats();
  }

  /**
   * * Define as salas de bate-papo
   * @param chats
   */
  public async setChats(chats: { [key: string]: Chat }) {
    this.chats = chats;
    this.saveChats();
  }

  /**
   * * Remove uma sala de bate-papo
   * @param id
   */
  public async removeChat(id: Chat | string) {
    delete this.chats[typeof id == "string" ? id : id.id];
    this.saveChats();
  }

  /**
   * * Envia um conteúdo
   * @param content
   * @returns
   */
  public async send(content: Message | Status): Promise<any> {
    if (content instanceof Message) {
      const waMSG = new WhatsAppMessage(this, content);
      await waMSG.refactory(content);

      const { chat, message, context } = waMSG;

      if (message.hasOwnProperty("templateButtons")) {
        const fullMsg = await generateWAMessage(chat, message, {
          userJid: this._bot?.user?.id,
          logger: this.config.logger,
          ...context,
        });

        fullMsg.message = { viewOnceMessage: { message: fullMsg.message } };

        return this._bot?.relayMessage(chat, fullMsg.message!, { messageId: fullMsg.key.id! });
      }

      return this._bot?.sendMessage(chat, message, context);
    }

    if (content instanceof Status) {
      if (content.status === "reading") {
        return this._bot?.readMessages([
          { remoteJid: content.chat?.id, id: content.message?.id, participant: content.message?.user.id },
        ]);
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
