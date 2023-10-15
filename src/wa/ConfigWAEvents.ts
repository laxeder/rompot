import { DisconnectReason, isJidGroup } from "@whiskeysockets/baileys";
import { Boom } from "@hapi/boom";

import { ConvertWAMessage } from "./ConvertWAMessage";
import { BotStatus } from "../bot/BotStatus";
import { ChatType } from "../chat/ChatType";
import WhatsAppBot from "./WhatsAppBot";
import { replaceID } from "./ID";
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
    this.configContactsUpdate();
    this.configChatsUpsert();
    this.configGroupsUpdate();
    this.configChatsDelete();
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
        for (const message of m.messages) {
          if (message.key.remoteJid == "status@broadcast") return;
          if (!message.message) return;

          const msg = await new ConvertWAMessage(this.wa, message, m.type).get();

          this.wa.emit("message", msg);
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

          this.wa.id = replaceID(this.wa.sock?.user?.id || "");

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
      const readed: string[] = [];

      await Promise.all(
        update.chats.map(async (chat) => {
          try {
            if (!chat.id.includes("@g") || readed.includes(chat.id)) return;

            readed.push(chat.id);

            await this.wa.readChat(new Chat(chat.id));
          } catch (err) {
            this.wa.emit("error", err);
          }
        })
      );

      await Promise.all(
        update.contacts.map(async (user) => {
          try {
            if (!user.id.includes("@s") || readed.includes(user.id)) return;

            readed.push(user.id);

            await this.wa.setUser((await this.wa.getUser(new User(user.id))) || new User(user.id, user.name || user.notify || user.notify));
          } catch (err) {
            this.wa.emit("error", err);
          }
        })
      );
    });
  }

  public configContactsUpdate() {
    this.wa.sock.ev.on("contacts.update", async (updates) => {
      for (const update of updates) {
        try {
          const user = (await this.wa.getUser(new User(update.id))) || new User(replaceID(update.id));
          const name = update.notify || update.name || update.verifiedName;

          if (name && user.name != name) {
            await this.wa.setUser(User.fromJSON({ ...user, name }));
          }
        } catch (err) {
          this.wa.emit("error", err);
        }
      }
    });
  }

  public configChatsUpsert() {
    this.wa.sock.ev.on("chats.upsert", async (updates) => {
      for (const update of updates) {
        try {
          const chat = (await this.wa.getChat(new Chat(update.id))) || new Chat(replaceID(update.id));
          const name = update.name;

          if (name && chat.name != name) {
            await this.wa.readChat(new Chat(chat.id, isJidGroup(chat.id) ? ChatType.Group : ChatType.PV, name));
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
          await this.wa.readChat(new Chat(update.id));
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
