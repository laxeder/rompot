import { DisconnectReason, WAMessage } from "@whiskeysockets/baileys";
import { Boom } from "@hapi/boom";

import Chat from "@modules/Chat";

import { isEmptyMessage } from "@utils/Verify";

import { WhatsAppConvertMessage } from "./WAConvertMessage";
import WhatsAppBot from "./WhatsAppBot";
import { WAUser } from "./WAModules";
import { replaceID } from "./ID";

export default class ConfigWAEvents {
  public wa: WhatsAppBot;
  public connectionResolve: (...args: any[]) => any;

  constructor(wa: WhatsAppBot) {
    this.wa = wa;
    this.connectionResolve = () => undefined;
  }

  public configure() {
    this.configCBNotifications();
    this.configConnectionUpdate();
    this.configContactsUpdate();
    this.configChatsUpsert();
    this.configGroupsUpdate();
    this.configChatsDelete();
    this.configMessagesUpsert();
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
          this.wa.ev.emit("error", err);
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
          this.wa.ev.emit("error", err);
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
          this.wa.ev.emit("error", err);
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
          this.wa.ev.emit("error", err);
        }
      }
    });
  }

  public configMessagesUpsert() {
    this.wa.sock.ev.on("messages.upsert", async (m) => {
      try {
        if (m.messages.length <= 0) return;

        const message: WAMessage = m.messages[m.messages.length - 1];

        if (message.key.remoteJid == "status@broadcast") return;
        if (!message.message) return;

        const jid = replaceID(message.key.remoteJid);

        if (!this.wa.chats[jid]) {
          await this.wa.readChat({ id: jid });
        } else if (!this.wa.chats[jid].users[this.wa.id]) {
          this.wa.chats[jid].users[this.wa.id] = new WAUser(this.wa.id);

          await this.wa.saveChats();
        }

        const msg = await new WhatsAppConvertMessage(this.wa, message, m.type).get();

        if (isEmptyMessage(msg)) return;

        this.wa.ev.emit("message", msg);
      } catch (err) {
        this.wa.ev.emit("error", err);
      }
    });
  }

  public configConnectionUpdate() {
    this.wa.sock.ev.on("connection.update", async (update) => {
      try {
        if (update.connection == "connecting") {
          this.wa.ev.emit("connecting", { action: "connecting" });
        }

        if (update.qr) {
          this.wa.ev.emit("qr", update.qr);
        }

        if (update.connection == "open") {
          this.wa.status = "online";

          this.wa.id = replaceID(this.wa.sock?.user?.id || "");

          await this.wa.readChats();
          await this.wa.readUsers();
          await this.wa.readPolls();
          await this.wa.readSendedMessages();

          this.wa.ev.emit("open", { isNewLogin: update.isNewLogin || false });

          this.connectionResolve();
        }

        if (update.connection == "close") {
          // Client desligado
          const status = (update.lastDisconnect?.error as Boom)?.output?.statusCode || update.lastDisconnect?.error || 500;
          const botStatus = String(this.wa.status);

          if (this.wa.status == "online") {
            this.wa.status = "offline";

            this.wa.ev.emit("close", { status: "offline" });
          }

          if (status == DisconnectReason.badSession || status === DisconnectReason.loggedOut) {
            this.wa.ev.emit("closed", { status: "offline" });
            return;
          }

          if (status == DisconnectReason.restartRequired) {
            return this.connectionResolve(await this.wa.reconnect(false));
          }

          setTimeout(async () => this.connectionResolve(await this.wa.reconnect(botStatus != "online")), 1000);
        }
      } catch (err) {
        this.wa.ev.emit("error", err);
      }
    });
  }

  public configContactsUpdate() {
    this.wa.sock.ev.on("contacts.update", async (updates) => {
      for (const update of updates) {
        try {
          update.id = replaceID(update.id);

          if (this.wa.users[update.id]?.name != update.notify || update.verifiedName) {
            await this.wa.readUser(update);
          }
        } catch (err) {
          this.wa.ev.emit("error", err);
        }
      }
    });
  }

  public configChatsUpsert() {
    this.wa.sock.ev.on("chats.upsert", async (updates) => {
      for (const update of updates) {
        try {
          update.id = replaceID(update.id);

          if (!this.wa.chats[update.id]) {
            this.wa.readChat(update);
          } else if (!this.wa.chats[update.id].users[this.wa.id]) {
            this.wa.chats[update.id].users[this.wa.id] = new WAUser(this.wa.id);

            await this.wa.saveChats();
          }
        } catch (err) {
          this.wa.ev.emit("error", err);
        }
      }
    });
  }

  public configGroupsUpdate() {
    this.wa.sock.ev.on("groups.update", async (updates) => {
      for (const update of updates) {
        try {
          update.id = replaceID(update.id);

          if (this.wa.chats[update.id]?.name != update.subject) {
            await this.wa.readChat(update);
          }
        } catch (err) {
          this.wa.ev.emit("error", err);
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
          this.wa.ev.emit("error", err);
        }
      }
    });
  }
}
