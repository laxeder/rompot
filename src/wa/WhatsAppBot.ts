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

import { WhatsAppConvertMessage } from "@wa/WAConvertMessage";
import { WhatsAppMessage } from "@wa/WAMessage";
import { loggerConfig } from "@config/logger";
import { Message } from "@messages/Message";
import { BaseBot } from "@utils/BaseBot";
import { Status } from "@models/Status";
import { Chat } from "@models/Chat";
import { User } from "@models/User";
import { BuildConfig } from "@config/BuildConfig";

export class WhatsAppBot extends BaseBot {
  private _auth: string = "";
  private _bot?: WASocket;

  public DisconnectReason = DisconnectReason;
  public chats: { [key: string]: Chat } = {};
  public config: any;

  public statusOpts: any = {
    typing: "composing",
    reading: "reading",
    recording: "recording",
    online: "available",
    offline: "unavailable",
  };

  constructor(config: BuildConfig = {}) {
    super();

    this.config = {
      printQRInTerminal: true,
      logger: loggerConfig({ level: "silent" }),
      patchMessageBeforeSending: (message: any) => {
        const requiresPatch = !!(
          message.buttonsMessage ||
          // || message.templateMessage
          message.listMessage
        );
        if (requiresPatch) {
          message = {
            viewOnceMessage: {
              message: {
                messageContextInfo: {
                  deviceListMetadataVersion: 2,
                  deviceListMetadata: {},
                },
                ...message,
              },
            },
          };
        }

        return message;
      },
      ...config,
    };
  }

  /**
   * * Conecta ao servidor do WhatsApp
   * @param auth
   * @param config
   * @returns
   */
  public async connect(auth: string, config: BuildConfig = {}): Promise<any> {
    return await new Promise(async (resolve, reject) => {
      try {
        this._auth = auth;
        this.config = { ...this.config, ...config };

        const { state, saveCreds } = await useMultiFileAuthState(this._auth);

        this._bot = makeWASocket({ ...this.config, auth: state });
        this._bot.ev.on("creds.update", saveCreds);

        this._bot.ev.on("messages.upsert", async (m: { messages: WAMessage[]; type: MessageUpsertType }) => {
          if (m.messages.length <= 0) return;

          const message: WAMessage = m.messages[m.messages.length - 1];

          if (message.key.remoteJid == "status@broadcast") return;

          const msg = new WhatsAppConvertMessage(this, message, m.type);

          if (message.key.fromMe) {
            this.events["bot-message"].next(await msg.get());
            return;
          }

          this.events.message.next(await msg.get());
        });

        // Verificando se bot conectou
        this._bot.ev.on("connection.update", async (update: Partial<ConnectionState>) => {
          if (update.connection == "open") {
            this.status.setStatus("online");

            // Removendo caracteres do ID do bot
            this.user = { ...this._bot?.user };
            this.user.id = this.user.id?.replace(/:(.*)@/, "@") || "";

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

        this._bot.ev.on("contacts.update", (updates) => {
          for (const update of updates) this.chatUpsert(update);
        });

        this._bot.ev.on("chats.upsert", (newChats) => {
          for (const chat of newChats) this.chatUpsert(chat);
        });

        this._bot.ev.on("chats.update", (updates) => {
          for (const update of updates) if (update.id?.includes("@g")) this.chatUpsert(update);
        });

        this._bot.ev.on("chats.delete", (deletions) => {
          for (const id of deletions) this.removeChat(id);
        });

        this._bot.ev.on("groups.update", (updates) => {
          for (const update of updates) this.chatUpsert(update);
        });

        this._bot.ev.on("group-participants.update", async ({ id, participants, action }) => {
          if (!this.chats[id]) await this.chatUpsert({ id });

          for (const u of participants) {
            const member = new User(u);

            if (action == "add") await this.chats[id].addMember(member, false);
            if (action == "promote") this.chats[id].members[u].setAdmin(true);
            if (action == "demote") {
              this.chats[id].members[u].setAdmin(false);
              this.chats[id].members[u].setLeader(false);
            }

            const user = this.chats[id].getMember(member);

            if (action == "remove") await this.chats[id].removeMember(member, false);

            this.events.member.next({ action, chat: this.chats[id], user });
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
   * * Lê o chat e seta ele
   * @param chat
   */
  private async chatUpsert(chat: any) {
    if (chat.id || chat.newJId) {
      const newChat = new Chat(chat.id || chat.newJid, chat.name || chat.verifiedName || chat.notify || chat.subject);

      if (newChat.id.includes("@g")) {
        if (!chat.participants) {
          const metadata = await this._bot?.groupMetadata(newChat.id);

          chat.participants = metadata?.participants || [];
          newChat.name = metadata?.subject;
        }

        for (const user of chat.participants) {
          const u = new User(user.id);

          u.setAdmin(!!user.admin || user.isAdmin || user.isSuperAdmin || false);
          u.setLeader(user.isSuperAdmin || false);

          newChat.addMember(u, false);
        }
      }

      this.setChat(newChat);
    }
  }

  /**
   * * Obter uma sala de bate-papo
   * @param id
   * @returns
   */
  public async getChat(id: string): Promise<Chat | null> {
    if (!this.chats[id]) {
      if (id.includes("@s")) {
        const [user] = (await this._bot?.onWhatsApp(id)) || [];
        if (user && user.exists) await this.chatUpsert(new Chat(user.jid));
      }

      if (id.includes("@g")) {
        const metadata = await this._bot?.groupMetadata(id);
        if (metadata) await this.chatUpsert(new Chat(metadata.id, metadata.subject));
      }
    }

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
    if (chat.id == "status@broadcast" || this.chats[chat.id]) return;
    if (chat.id.includes("@g")) chat.setType("group");
    if (chat.id.includes("@s")) chat.setType("pv");

    this.chats[chat.id] = chat;
    this.events.chat.next(chat);
  }

  /**
   * * Define as salas de bate-papo
   * @param chats
   */
  public async setChats(chats: { [key: string]: Chat }) {
    this.chats = chats;
  }

  /**
   * * Remove uma sala de bate-papo
   * @param id
   */
  public async removeChat(id: Chat | string) {
    delete this.chats[typeof id == "string" ? id : id.id];
  }

  /**
   * * Adiciona um usuário a uma sala de bate-papo
   * @param chat
   * @param user
   */
  public async addMember(chat: Chat, user: User) {
    if (!chat.id.includes("@g.us")) return;

    const bot = (await this.getChat(chat.id))?.getMember(new User(this.user?.id || ""));

    if (!bot || !bot.getAdmin()) return;

    await this._bot?.groupParticipantsUpdate(chat.id, [user.id], "add");
  }

  /**
   * * Remove um usuário da sala de bate-papo
   * @param chat
   * @param user
   */
  public async removeMember(chat: Chat, user: User) {
    if (!chat.id.includes("@g.us")) return;

    const bot = (await this.getChat(chat.id))?.getMember(new User(this.user?.id || ""));

    if (!bot || !bot.getAdmin()) return;

    await this._bot?.groupParticipantsUpdate(chat.id, [user.id], "remove");
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

      // if (message.hasOwnProperty("templateButtons")) {
      //   const fullMsg = await generateWAMessage(chat, message, {
      //     userJid: this._bot?.user?.id,
      //     logger: this.config.logger,
      //     ...context,
      //   });

      //   fullMsg.message = { viewOnceMessage: { message: fullMsg.message } };

      //   return this._bot?.relayMessage(chat, fullMsg.message!, { messageId: fullMsg.key.id! });
      // }

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
