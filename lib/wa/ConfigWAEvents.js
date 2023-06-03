"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const baileys_1 = require("@whiskeysockets/baileys");
const Chat_1 = __importDefault(require("../modules/Chat"));
const Verify_1 = require("../utils/Verify");
const WAConvertMessage_1 = require("./WAConvertMessage");
const WAModules_1 = require("./WAModules");
const ID_1 = require("./ID");
class ConfigWAEvents {
    constructor(wa) {
        this.wa = wa;
    }
    configureAll() {
        this.configContactsUpdate();
        this.configChatsUpsert();
        this.configGroupsUpdate();
        this.configChatsDelete();
        this.configMessagesUpsert();
        this.configCBNotifications();
    }
    configCBNotifications() {
        this.configCBNotificationRemove();
        this.configCBNotificationAdd();
        this.configCBNotificationPromote();
        this.configCBNotificationDemote();
    }
    configCBNotificationRemove() {
        this.wa.sock.ws.on("CB:notification,,remove", (data) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            for (const content of ((_a = data.content[0]) === null || _a === void 0 ? void 0 : _a.content) || []) {
                try {
                    yield this.wa.groupParticipantsUpdate(content.attrs.jid == data.attrs.participant ? "leave" : "remove", data.attrs.from, content.attrs.jid, data.attrs.participant);
                }
                catch (err) {
                    this.wa.ev.emit("error", err);
                }
            }
        }));
    }
    configCBNotificationAdd() {
        this.wa.sock.ws.on("CB:notification,,add", (data) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            for (const content of ((_a = data.content[0]) === null || _a === void 0 ? void 0 : _a.content) || []) {
                try {
                    if (!data.attrs.participant)
                        data.attrs.participant = content.attrs.jid;
                    yield this.wa.groupParticipantsUpdate(content.attrs.jid == data.attrs.participant ? "join" : "add", data.attrs.from, content.attrs.jid, data.attrs.participant);
                }
                catch (err) {
                    this.wa.ev.emit("error", err);
                }
            }
        }));
    }
    configCBNotificationPromote() {
        this.wa.sock.ws.on("CB:notification,,promote", (data) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            for (const content of ((_a = data.content[0]) === null || _a === void 0 ? void 0 : _a.content) || []) {
                try {
                    yield this.wa.groupParticipantsUpdate("promote", data.attrs.from, content.attrs.jid, data.attrs.participant);
                }
                catch (err) {
                    this.wa.ev.emit("error", err);
                }
            }
        }));
    }
    configCBNotificationDemote() {
        this.wa.sock.ws.on("CB:notification,,demote", (data) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            for (const content of ((_a = data.content[0]) === null || _a === void 0 ? void 0 : _a.content) || []) {
                try {
                    yield this.wa.groupParticipantsUpdate("demote", data.attrs.from, content.attrs.jid, data.attrs.participant);
                }
                catch (err) {
                    this.wa.ev.emit("error", err);
                }
            }
        }));
    }
    configMessagesUpsert() {
        this.wa.sock.ev.on("messages.upsert", (m) => __awaiter(this, void 0, void 0, function* () {
            try {
                for (const message of m.messages) {
                    if (message.key.remoteJid == "status@broadcast")
                        return;
                    if (!message.message)
                        return;
                    const jid = (0, ID_1.replaceID)(message.key.remoteJid);
                    if (!this.wa.chats[jid]) {
                        yield this.wa.readChat({ id: jid });
                    }
                    if (!this.wa.chats[jid].users[this.wa.id]) {
                        this.wa.chats[jid].users[this.wa.id] = new WAModules_1.WAUser(this.wa.id);
                        yield this.wa.saveChats();
                    }
                    const msg = yield new WAConvertMessage_1.WhatsAppConvertMessage(this.wa, message, m.type).get();
                    if ((0, Verify_1.isEmptyMessage)(msg))
                        return;
                    this.wa.ev.emit("message", msg);
                }
            }
            catch (err) {
                this.wa.ev.emit("error", err);
            }
        }));
    }
    configConnectionUpdate() {
        this.wa.sock.ev.on("connection.update", (update) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e, _f;
            try {
                if (update.connection == "connecting") {
                    this.wa.ev.emit("connecting", { action: "connecting" });
                }
                if (update.qr) {
                    this.wa.ev.emit("qr", update.qr);
                }
                if (update.connection == "open") {
                    this.wa.status = "online";
                    this.wa.id = (0, ID_1.replaceID)(((_b = (_a = this.wa.sock) === null || _a === void 0 ? void 0 : _a.user) === null || _b === void 0 ? void 0 : _b.id) || "");
                    this.wa.resolveConnectionsAwait();
                    this.wa.ev.emit("open", { isNewLogin: update.isNewLogin || false });
                }
                if (update.connection == "close") {
                    const status = ((_e = (_d = (_c = update.lastDisconnect) === null || _c === void 0 ? void 0 : _c.error) === null || _d === void 0 ? void 0 : _d.output) === null || _e === void 0 ? void 0 : _e.statusCode) || ((_f = update.lastDisconnect) === null || _f === void 0 ? void 0 : _f.error) || 500;
                    if (this.wa.status == "online") {
                        this.wa.status = "offline";
                        this.wa.ev.emit("close", { status: "offline" });
                    }
                    if (status === baileys_1.DisconnectReason.loggedOut) {
                        this.wa.ev.emit("stop", { status: "offline" });
                        return;
                    }
                    if (status == baileys_1.DisconnectReason.restartRequired) {
                        return yield this.wa.reconnect(false);
                    }
                }
            }
            catch (err) {
                this.wa.ev.emit("error", err);
            }
        }));
    }
    configContactsUpdate() {
        this.wa.sock.ev.on("contacts.update", (updates) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            for (const update of updates) {
                try {
                    update.id = (0, ID_1.replaceID)(update.id);
                    if (((_a = this.wa.users[update.id]) === null || _a === void 0 ? void 0 : _a.name) != update.notify || update.verifiedName) {
                        yield this.wa.readUser(update);
                    }
                }
                catch (err) {
                    this.wa.ev.emit("error", err);
                }
            }
        }));
    }
    configChatsUpsert() {
        this.wa.sock.ev.on("chats.upsert", (updates) => __awaiter(this, void 0, void 0, function* () {
            for (const update of updates) {
                try {
                    update.id = (0, ID_1.replaceID)(update.id);
                    if (!this.wa.chats[update.id]) {
                        this.wa.readChat(update);
                    }
                    else if (!this.wa.chats[update.id].users[this.wa.id]) {
                        this.wa.chats[update.id].users[this.wa.id] = new WAModules_1.WAUser(this.wa.id);
                        yield this.wa.saveChats();
                    }
                }
                catch (err) {
                    this.wa.ev.emit("error", err);
                }
            }
        }));
    }
    configGroupsUpdate() {
        this.wa.sock.ev.on("groups.update", (updates) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            for (const update of updates) {
                try {
                    update.id = (0, ID_1.replaceID)(update.id);
                    if (((_a = this.wa.chats[update.id]) === null || _a === void 0 ? void 0 : _a.name) != update.subject) {
                        yield this.wa.readChat(update);
                    }
                }
                catch (err) {
                    this.wa.ev.emit("error", err);
                }
            }
        }));
    }
    configChatsDelete() {
        this.wa.sock.ev.on("chats.delete", (deletions) => __awaiter(this, void 0, void 0, function* () {
            for (const id of deletions) {
                try {
                    yield this.wa.removeChat(new Chat_1.default(id));
                }
                catch (err) {
                    this.wa.ev.emit("error", err);
                }
            }
        }));
    }
}
exports.default = ConfigWAEvents;
//# sourceMappingURL=ConfigWAEvents.js.map