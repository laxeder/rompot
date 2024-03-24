import { DisconnectReason, MessageUpsertType, isJidGroup, proto } from "@whiskeysockets/baileys";
import { Boom } from "@hapi/boom";
import Long from "long";

import ErrorMessage from "../messages/ErrorMessage";
import ConvertWAMessage from "./ConvertWAMessage";
import { fixID, getPhoneNumber } from "./ID";
import { BotStatus } from "../bot/BotStatus";
import WhatsAppBot from "./WhatsAppBot";
import Chat from "../chat/Chat";

export default class ConfigWAEvents {
  public wa: WhatsAppBot;

  constructor(wa: WhatsAppBot) {
    this.wa = wa;
  }

  public configureAll() {
    this.configConnectionUpdate();
    this.configHistorySet();
    this.configContactsUpsert();
    this.configContactsUpdate();
    this.configChatsDelete();
    this.configGroupsUpdate();
    this.configMessagesUpsert();
    this.configMessagesUpdate();
    this.configCBNotifications();
  }

  public configCBNotifications() {
    this.configCBNotificationRemove();
    this.configCBNotificationAdd();
    this.configCBNotificationPromote();
    this.configCBNotificationDemote();
  }

  public configCBNotificationRemove() {
    this.wa.sock.ws.on("CB:notification,,remove", async (data) => {
      for (const content of data.content[0]?.content || []) {
        try {
          await this.wa.groupParticipantsUpdate(content.attrs.jid == data.attrs.participant ? "leave" : "remove", data.attrs.from, content.attrs.jid, data.attrs.participant);
        } catch (err) {
          this.wa.emit("error", err);
        }
      }
    });
  }

  public configCBNotificationAdd() {
    this.wa.sock.ws.on("CB:notification,,add", async (data) => {
      for (const content of data.content[0]?.content || []) {
        try {
          if (!data.attrs.participant) data.attrs.participant = content.attrs.jid;

          await this.wa.groupParticipantsUpdate(content.attrs.jid == data.attrs.participant ? "join" : "add", data.attrs.from, content.attrs.jid, data.attrs.participant);
        } catch (err) {
          this.wa.emit("error", err);
        }
      }
    });
  }

  public configCBNotificationPromote() {
    this.wa.sock.ws.on("CB:notification,,promote", async (data) => {
      for (const content of data.content[0]?.content || []) {
        try {
          await this.wa.groupParticipantsUpdate("promote", data.attrs.from, content.attrs.jid, data.attrs.participant);
        } catch (err) {
          this.wa.emit("error", err);
        }
      }
    });
  }

  public configCBNotificationDemote() {
    this.wa.sock.ws.on("CB:notification,,demote", async (data) => {
      for (const content of data.content[0]?.content || []) {
        try {
          await this.wa.groupParticipantsUpdate("demote", data.attrs.from, content.attrs.jid, data.attrs.participant);
        } catch (err) {
          this.wa.emit("error", err);
        }
      }
    });
  }

  public async readMessages(messages: proto.IWebMessageInfo[], type: MessageUpsertType = "notify") {
    try {
      for (const message of messages || []) {
        try {
          if (!message) return;
          if (message.key.remoteJid == "status@broadcast") return;

          if (!message.message) {
            if (!(message.messageStubType == proto.WebMessageInfo.StubType.CIPHERTEXT)) {
              return; // Not read other null messages
            }

            const msgRetryCount = this.wa.config.msgRetryCounterCache?.get<number>(message.key.id!);

            if (msgRetryCount != this.wa.config.maxMsgRetryCount) {
              const time = this.wa.config.retryRequestDelayMs || 1000;

              await new Promise((res) => setTimeout(res, time * 3));

              const newMsgRetryCount = this.wa.config.msgRetryCounterCache?.get<number>(message.key.id!);

              if (!this.wa.config.readAllFailedMessages) {
                if (msgRetryCount && newMsgRetryCount && msgRetryCount != newMsgRetryCount) {
                  return; // Not read duplicated failed message
                }
              }
            }
          }

          if (
            message.message?.protocolMessage?.type == proto.Message.ProtocolMessage.Type.EPHEMERAL_SYNC_RESPONSE ||
            message.message?.protocolMessage?.type == proto.Message.ProtocolMessage.Type.APP_STATE_SYNC_KEY_SHARE ||
            message.message?.protocolMessage?.type == proto.Message.ProtocolMessage.Type.APP_STATE_SYNC_KEY_REQUEST ||
            message.message?.protocolMessage?.type == proto.Message.ProtocolMessage.Type.APP_STATE_FATAL_EXCEPTION_NOTIFICATION ||
            message.message?.protocolMessage?.type == proto.Message.ProtocolMessage.Type.EPHEMERAL_SETTING ||
            message.message?.protocolMessage?.type == proto.Message.ProtocolMessage.Type.HISTORY_SYNC_NOTIFICATION ||
            message.message?.protocolMessage?.type == proto.Message.ProtocolMessage.Type.INITIAL_SECURITY_NOTIFICATION_SETTING_SYNC
          ) {
            return; // Not read empty messages
          }

          if (this.wa.messagesCached.includes(message.key.id!)) return;

          this.wa.addMessageCache(message.key.id!);

          const chatId = fixID(message.key.remoteJid || this.wa.id);

          const chat = await this.wa.getChat(new Chat(chatId));

          let timestamp: number | undefined;

          if (message.messageTimestamp) {
            if (Long.isLong(message.messageTimestamp)) {
              timestamp = message.messageTimestamp.toNumber() * 1000;
            } else {
              timestamp = (message.messageTimestamp as number) * 1000;
            }
          }

          await this.wa.updateChat({
            id: chatId,
            unreadCount: (chat?.unreadCount || 0) + 1,
            timestamp,
            name: message.key.id?.includes("@s") && !message.key.fromMe ? message.pushName || message.verifiedBizName || undefined : undefined,
          });

          const userId = fixID(message.key.fromMe ? this.wa.id : message.key.participant || message.participant || message.key.remoteJid || "");

          await this.wa.updateUser({ id: userId, name: message.pushName || message.verifiedBizName || undefined });

          const msg = await new ConvertWAMessage(this.wa, message, type).get();

          if (msg.fromMe && msg.isUnofficial) {
            await this.wa.updateChat({ id: msg.chat.id, unreadCount: 0 });
          }

          this.wa.emit("message", msg);
        } catch (err) {
          this.wa.emit("message", new ErrorMessage(fixID(message?.key?.remoteJid || ""), err && err instanceof Error ? err : new Error(JSON.stringify(err))));
        }
      }
    } catch (err) {
      this.wa.emit("error", err);
    }
  }

  public configMessagesUpsert() {
    this.wa.sock.ev.on("messages.upsert", async (m) => {
      try {
        await this.readMessages(m?.messages || [], m.type);
      } catch (err) {
        this.wa.emit("error", err);
      }
    });
  }

  public configMessagesUpdate() {
    this.wa.sock.ev.on("messages.update", async (messages) => {
      try {
        for (const message of messages || []) {
          try {
            if (message.key.remoteJid == "status@broadcast") return;

            await this.readMessages([{ key: message.key, ...message.update }]);

            if (!message?.update?.status) return;

            const msg = await new ConvertWAMessage(this.wa, message).get();

            msg.isUpdate = true;

            this.wa.emit("message", msg);
          } catch (err) {
            this.wa.emit("message", new ErrorMessage(fixID(message?.key?.remoteJid || ""), err && err instanceof Error ? err : new Error(JSON.stringify(err))));
          }
        }
      } catch (err) {
        this.wa.emit("error", err);
      }
    });
  }

  public configConnectionUpdate() {
    this.wa.sock.ev.on("connection.update", async (update) => {
      try {
        this.wa.connectionListeners = this.wa.connectionListeners.filter((listener) => !listener(update));

        if (update.connection == "connecting") {
          this.wa.lastConnectionUpdateDate = Date.now();
          this.wa.status = BotStatus.Offline;
          this.wa.emit("connecting", { action: "connecting" });
        }

        if (update.qr) {
          this.wa.emit("qr", update.qr);
        }

        if (update.connection == "open") {
          const uptime = Date.now();

          this.wa.lastConnectionUpdateDate = uptime;
          this.wa.status = BotStatus.Online;

          this.wa.id = fixID(this.wa.sock?.user?.id || "");
          this.wa.phoneNumber = getPhoneNumber(this.wa.id);
          this.wa.name = this.wa.sock?.user?.name || this.wa.sock?.user?.notify || this.wa.sock?.user?.verifiedName || "";
          this.wa.profileUrl = this.wa.sock?.user?.imgUrl || "";

          this.wa.readUser({ id: this.wa.id }, { notify: this.wa.name || undefined, imgUrl: this.wa.profileUrl || undefined });
          this.wa.readChat({ id: this.wa.id }, { subject: this.wa.name || undefined });

          this.wa.emit("open", { isNewLogin: update.isNewLogin || false });

          setTimeout(async () => {
            try {
              if (this.wa.lastConnectionUpdateDate != uptime) return;

              await this.wa.reconnect(true, false);
            } catch (error) {
              this.wa.emit("error", error);
            }
          }, this.wa.config.autoRestartInterval);

          this.wa.eventsIsStoped = false;

          await this.wa.sock.groupFetchAllParticipating();
        }

        if (update.connection == "close") {
          this.wa.lastConnectionUpdateDate = Date.now();
          this.wa.status = BotStatus.Offline;

          const status = (update.lastDisconnect?.error as Boom)?.output?.statusCode || update.lastDisconnect?.error || 500;

          if (status === DisconnectReason.loggedOut) {
            this.wa.emit("stop", { isLogout: true });
          } else if (status === 402) {
            this.wa.emit("stop", { isLogout: false });
          } else if (status == DisconnectReason.restartRequired) {
            await this.wa.saveCreds(this.wa.sock.authState.creds);
            await this.wa.reconnect(true, true);
          } else {
            this.wa.emit("close", { reason: status });
          }
        }
      } catch (err) {
        this.wa.emit("error", err);
      }
    });
  }

  public configHistorySet() {
    const ignoreChats: string[] = [];

    this.wa.sock.ev.on("messaging-history.set", async (update) => {
      if (!this.wa.config.autoSyncHistory) return;

      for (const chat of update.chats || []) {
        try {
          if (!chat?.hasOwnProperty("unreadCount") || chat.isDefaultSubgroup === true) {
            ignoreChats.push(chat.id);

            continue;
          }

          const isGroup = isJidGroup(chat.id);

          if (!chat?.hasOwnProperty("pinned") || isGroup) {
            if (!isGroup) {
              ignoreChats.push(chat.id);

              continue;
            }

            if (chat?.hasOwnProperty("endOfHistoryTransferType") && !chat.hasOwnProperty("isDefaultSubgroup")) {
              ignoreChats.push(chat.id);

              continue;
            }
          }

          if ((chat.participant?.length || 0) > 0) {
            if (!chat.participant?.some((p) => p.userJid == this.wa.id)) {
              ignoreChats.push(chat.id);

              continue;
            }
          }

          await this.wa.readChat({ id: chat.id }, chat);
        } catch (err) {
          this.wa.emit("error", err);
        }
      }

      for (const message of update?.messages || []) {
        try {
          if (!message?.message || message.key.remoteJid == "status@broadcast") continue;
          if (ignoreChats.includes(fixID(message.key.remoteJid || ""))) continue;

          const msg = await new ConvertWAMessage(this.wa, message).get();

          msg.isOld = true;

          this.wa.emit("message", msg);
        } catch (err) {
          const msg = new ErrorMessage(fixID(message?.key?.remoteJid || ""), err && err instanceof Error ? err : new Error(JSON.stringify(err)));

          msg.isOld = true;

          this.wa.emit("message", msg);
        }
      }
    });
  }

  public configContactsUpdate() {
    this.wa.sock.ev.on("contacts.update", async (updates) => {
      for (const update of updates) {
        try {
          if (isJidGroup(update.id)) {
            await this.wa.readChat({ id: update.id }, update);
          } else {
            await this.wa.readUser({ id: update.id }, update);
          }
        } catch (err) {
          this.wa.emit("error", err);
        }
      }
    });
  }

  public configContactsUpsert() {
    this.wa.sock.ev.on("contacts.upsert", async (updates) => {
      for (const update of updates) {
        try {
          if (isJidGroup(update.id)) {
            await this.wa.readChat({ id: update.id }, update);
          } else {
            await this.wa.readUser({ id: update.id }, update);
          }
        } catch (err) {
          this.wa.emit("error", err);
        }
      }
    });
  }

  public configGroupsUpdate() {
    this.wa.sock.ev.on("groups.update", async (updates) => {
      for (const update of updates) {
        try {
          if (!update?.id) continue;

          const chat = await this.wa.getChat(new Chat(update.id));

          if (chat == null) {
            await this.wa.readChat({ id: update.id }, update, true);
          } else {
            await this.wa.readChat({ id: update.id }, update, false);
          }
        } catch (err) {
          this.wa.emit("error", err);
        }
      }
    });
  }

  public configChatsDelete() {
    this.wa.sock.ev.on("chats.delete", async (deletions) => {
      for (const id of deletions) {
        try {
          await this.wa.removeChat(new Chat(id));
        } catch (err) {
          this.wa.emit("error", err);
        }
      }
    });
  }
}
