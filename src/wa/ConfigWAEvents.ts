import { DisconnectReason, isJidGroup } from "@whiskeysockets/baileys";
import { Boom } from "@hapi/boom";

import { ConvertWAMessage } from "./ConvertWAMessage";
import ErrorMessage from "../messages/ErrorMessage";
import { fixID, getPhoneNumber } from "./ID";
import { BotStatus } from "../bot/BotStatus";
import WhatsAppBot from "./WhatsAppBot";
import Chat from "../chat/Chat";
import User from "../user/User";

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
    this.configChatsUpdate();
    this.configChatsDelete();
    this.configGroupsUpdate();
    this.configMessagesUpsert();
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

  public configMessagesUpsert() {
    this.wa.sock.ev.on("messages.upsert", async (m) => {
      try {
        for (const message of m?.messages || []) {
          try {
            if (message.key.remoteJid == "status@broadcast") return;
            if (!message.message) return;

            const msg = await new ConvertWAMessage(this.wa, message, m.type).get();

            this.wa.emit("message", msg);
          } catch (err) {
            this.wa.emit("message", new ErrorMessage(message?.key?.remoteJid || "", err && err instanceof Error ? err : new Error(JSON.stringify(err))));
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
          this.wa.emit("connecting", { action: "connecting" });
        }

        if (update.qr) {
          this.wa.emit("qr", update.qr);
        }

        if (update.connection == "open") {
          this.wa.status = BotStatus.Online;

          this.wa.id = fixID(this.wa.sock?.user?.id || "");
          this.wa.phoneNumber = getPhoneNumber(this.wa.id);
          this.wa.name = this.wa.sock?.user?.name || this.wa.sock?.user?.notify || this.wa.sock?.user?.verifiedName || "";
          this.wa.profileUrl = this.wa.sock?.user?.imgUrl || "";

          this.wa.readUser({ id: this.wa.id }, { notify: this.wa.name, imgUrl: this.wa.profileUrl });
          this.wa.readChat({ id: this.wa.id }, { subject: this.wa.name });

          this.wa.emit("open", { isNewLogin: update.isNewLogin || false });
        }

        if (update.connection == "close") {
          this.wa.status = BotStatus.Offline;

          const status = (update.lastDisconnect?.error as Boom)?.output?.statusCode || update.lastDisconnect?.error || 500;

          if (status === DisconnectReason.loggedOut) {
            this.wa.emit("stop", { status: "offline" });
          } else if (status == DisconnectReason.restartRequired) {
            this.wa.saveCreds(this.wa.sock.authState.creds);

            await this.wa.reconnect(false);
          } else {
            this.wa.emit("close", { status: "offline" });
          }
        }
      } catch (err) {
        this.wa.emit("error", err);
      }
    });
  }

  public configHistorySet() {
    this.wa.sock.ev.on("messaging-history.set", async (update) => {
      for (const chat of update.chats || []) {
        try {
          if (!chat?.hasOwnProperty("pinned")) return;

          await this.wa.readChat({ id: chat.id }, chat);
        } catch (err) {
          this.wa.emit("error", err);
        }
      }

      for (const message of update?.messages || []) {
        try {
          if (message.key.remoteJid == "status@broadcast") return;
          if (!message.message) return;

          const msg = await new ConvertWAMessage(this.wa, message).get();

          msg.isOld = true;

          this.wa.emit("message", msg);
        } catch (err) {
          const msg = new ErrorMessage(message?.key?.remoteJid || "", err && err instanceof Error ? err : new Error(JSON.stringify(err)));

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
            await this.wa.readChat({ id: update.id });
          } else {
            await this.wa.readUser({ id: update.id }, update);
          }
        } catch (err) {
          this.wa.emit("error", err);
        }
      }
    });
  }
  public configChatsUpdate() {
    this.wa.sock.ev.on("chats.update", async (updates) => {
      for (const update of updates) {
        try {
          const chat = await this.wa.getChat(new Chat(update.id));

          if (update.unreadCount) {
            update.unreadCount += chat.unreadCount;
          }

          if (chat == null) {
            await this.wa.readChat({ id: update.id }, update);
          } else {
            const timestamp = !update.conversationTimestamp
              ? undefined
              : typeof update.conversationTimestamp == "number" || typeof update.conversationTimestamp == "string"
              ? Number(update.conversationTimestamp) * 1000
              : (update.conversationTimestamp?.toNumber() || 0) * 1000;

            await this.wa.updateChat({
              id: update.id,
              timestamp,
              name: update.name || undefined,
              unreadCount: update.unreadCount != undefined ? update.unreadCount : undefined,
            });
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
          await this.wa.readChat({ id: update.id }, update);
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
