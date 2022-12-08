"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WhatsAppBot = void 0;
const baileys_1 = __importStar(require("@adiwajshing/baileys"));
const WAConvertMessage_1 = require("./WAConvertMessage");
const WAMessage_1 = require("./WAMessage");
const logger_1 = require("../config/logger");
const Message_1 = require("../messages/Message");
const BaseBot_1 = require("../utils/BaseBot");
const Status_1 = require("../models/Status");
const Chat_1 = require("../models/Chat");
const User_1 = require("../models/User");
class WhatsAppBot extends BaseBot_1.BaseBot {
    constructor(config = {}) {
        super();
        this._auth = "";
        this.DisconnectReason = baileys_1.DisconnectReason;
        this.chats = {};
        this.statusOpts = {
            typing: "composing",
            reading: "reading",
            recording: "recording",
            online: "available",
            offline: "unavailable",
        };
        this.config = Object.assign({ printQRInTerminal: true, logger: (0, logger_1.loggerConfig)({ level: "silent" }) }, config);
    }
    /**
     * * Conecta ao servidor do WhatsApp
     * @param auth
     * @param config
     * @returns
     */
    connect(auth, config = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                try {
                    this._auth = auth;
                    this.config = Object.assign(Object.assign({}, this.config), config);
                    const { state, saveCreds } = yield (0, baileys_1.useMultiFileAuthState)(this._auth);
                    this._bot = (0, baileys_1.default)(Object.assign(Object.assign({}, this.config), { auth: state }));
                    this._bot.ev.on("creds.update", saveCreds);
                    // Verificando se bot conectou
                    this._bot.ev.on("connection.update", (update) => __awaiter(this, void 0, void 0, function* () {
                        var _a, _b, _c, _d, _e, _f;
                        if (update.connection == "open") {
                            this.status.setStatus("online");
                            // Removendo caracteres do ID do bot
                            this.user = Object.assign({}, (_a = this._bot) === null || _a === void 0 ? void 0 : _a.user);
                            this.user.id = ((_b = this.user.id) === null || _b === void 0 ? void 0 : _b.replace(/:(.*)@/, "@")) || "";
                            this.events.connection.next({ action: update.connection, status: this.status, login: update === null || update === void 0 ? void 0 : update.qr });
                            resolve(true);
                        }
                        if (update.connection == "close") {
                            this.status.setStatus("offline");
                            // Bot desligado
                            const status = ((_e = (_d = (_c = update.lastDisconnect) === null || _c === void 0 ? void 0 : _c.error) === null || _d === void 0 ? void 0 : _d.output) === null || _e === void 0 ? void 0 : _e.statusCode) || ((_f = update.lastDisconnect) === null || _f === void 0 ? void 0 : _f.error) || 500;
                            if (status === baileys_1.DisconnectReason.loggedOut)
                                return;
                            resolve(yield this.reconnect(this.config));
                        }
                    }));
                    this._bot.ev.on("contacts.update", (updates) => {
                        for (const update of updates)
                            this.chatUpsert(update);
                    });
                    this._bot.ev.on("chats.upsert", (newChats) => {
                        for (const chat of newChats)
                            this.chatUpsert(chat);
                    });
                    this._bot.ev.on("chats.update", (updates) => {
                        var _a;
                        for (const update of updates) {
                            if (((_a = update.id) === null || _a === void 0 ? void 0 : _a.includes("@g")) && !this.chats[update.id])
                                this.chatUpsert(update);
                        }
                    });
                    this._bot.ev.on("chats.delete", (deletions) => {
                        for (const id of deletions)
                            this.removeChat(id);
                    });
                    this._bot.ev.on("groups.update", (updates) => {
                        for (const update of updates)
                            this.chatUpsert(update);
                    });
                    this._bot.ev.on("group-participants.update", ({ id, participants, action }) => __awaiter(this, void 0, void 0, function* () {
                        if (!this.chats[id])
                            yield this.chatUpsert({ id });
                        for (const u of participants) {
                            const member = new User_1.User(u);
                            if (action == "add")
                                yield this.chats[id].addMember(member, false);
                            if (action == "promote")
                                this.chats[id].members[u].setAdmin(true);
                            if (action == "demote") {
                                this.chats[id].members[u].setAdmin(false);
                                this.chats[id].members[u].setLeader(false);
                            }
                            const user = this.chats[id].getMember(member);
                            if (action == "remove")
                                yield this.chats[id].removeMember(member, false);
                            this.events.member.next({ action, chat: this.chats[id], user });
                        }
                    }));
                    this._bot.ev.on("messages.upsert", (m) => __awaiter(this, void 0, void 0, function* () {
                        if (m.messages.length <= 0)
                            return;
                        const message = m.messages[m.messages.length - 1];
                        if (message.key.remoteJid == "status@broadcast")
                            return;
                        const msg = new WAConvertMessage_1.WhatsAppConvertMessage(this, message, m.type);
                        if (message.key.fromMe) {
                            this.events["bot-message"].next(yield msg.get());
                            return;
                        }
                        this.events.message.next(yield msg.get());
                    }));
                }
                catch (err) {
                    reject((err === null || err === void 0 ? void 0 : err.stack) || err);
                }
            }));
        });
    }
    /**
     * * Reconecta ao servidor do WhatsApp
     * @param config
     * @returns
     */
    reconnect(config) {
        return __awaiter(this, void 0, void 0, function* () {
            this.events.connection.next({ action: "reconnecting" });
            if (this.status.getStatus() == "online") {
                this.stop(baileys_1.DisconnectReason.loggedOut);
            }
            this.status.setStatus("offline");
            return this.connect(this._auth, config || this.config);
        });
    }
    /**
     * * Desliga a conexão com o servidor do WhatsApp
     * @param reason
     * @returns
     */
    stop(reason) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            (_a = this._bot) === null || _a === void 0 ? void 0 : _a.end(reason);
        });
    }
    /**
     * * Lê o chat e seta ele
     * @param chat
     */
    chatUpsert(chat) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            if (chat.id || chat.newJId) {
                const newChat = new Chat_1.Chat(chat.id || chat.newJid, chat.name || chat.verifiedName || chat.notify || chat.subject);
                if (newChat.id.includes("@g")) {
                    if (!chat.participants) {
                        const metadata = yield ((_a = this._bot) === null || _a === void 0 ? void 0 : _a.groupMetadata(newChat.id));
                        chat.participants = (metadata === null || metadata === void 0 ? void 0 : metadata.participants) || [];
                        newChat.name = metadata === null || metadata === void 0 ? void 0 : metadata.subject;
                    }
                    for (const user of chat.participants) {
                        const u = new User_1.User(user.id);
                        u.setAdmin(!!user.admin || user.isAdmin || user.isSuperAdmin || false);
                        u.setLeader(user.isSuperAdmin || false);
                        newChat.addMember(u, false);
                    }
                }
                this.setChat(newChat);
            }
        });
    }
    /**
     * * Obter uma sala de bate-papo
     * @param id
     * @returns
     */
    getChat(id) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.chats[id]) {
                if (id.includes("@s")) {
                    const [user] = (yield ((_a = this._bot) === null || _a === void 0 ? void 0 : _a.onWhatsApp(id))) || [];
                    if (user && user.exists)
                        yield this.chatUpsert(new Chat_1.Chat(user.jid));
                }
                if (id.includes("@g")) {
                    const metadata = yield ((_b = this._bot) === null || _b === void 0 ? void 0 : _b.groupMetadata(id));
                    if (metadata)
                        yield this.chatUpsert(metadata);
                }
            }
            return this.chats[id];
        });
    }
    /**
     * * Obter todas as salas de bate-papo
     * @returns
     */
    getChats() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.chats;
        });
    }
    /**
     * * Define uma sala de bate-papo
     * @param chat
     */
    setChat(chat) {
        return __awaiter(this, void 0, void 0, function* () {
            if (chat.id == "status@broadcast" || this.chats[chat.id])
                return;
            if (chat.id.includes("@g"))
                chat.setType("group");
            if (chat.id.includes("@s"))
                chat.setType("pv");
            this.chats[chat.id] = chat;
            this.events.chat.next(chat);
        });
    }
    /**
     * * Define as salas de bate-papo
     * @param chats
     */
    setChats(chats) {
        return __awaiter(this, void 0, void 0, function* () {
            this.chats = chats;
        });
    }
    /**
     * * Remove uma sala de bate-papo
     * @param id
     */
    removeChat(id) {
        return __awaiter(this, void 0, void 0, function* () {
            delete this.chats[typeof id == "string" ? id : id.id];
        });
    }
    /**
     * * Adiciona um usuário a uma sala de bate-papo
     * @param chat
     * @param user
     */
    addMember(chat, user) {
        var _a, _b, _c;
        return __awaiter(this, void 0, void 0, function* () {
            if (!chat.id.includes("@g.us"))
                return;
            const bot = (_a = (yield this.getChat(chat.id))) === null || _a === void 0 ? void 0 : _a.getMember(new User_1.User(((_b = this.user) === null || _b === void 0 ? void 0 : _b.id) || ""));
            if (!bot || !bot.getAdmin())
                return;
            yield ((_c = this._bot) === null || _c === void 0 ? void 0 : _c.groupParticipantsUpdate(chat.id, [user.id], "add"));
        });
    }
    /**
     * * Remove um usuário da sala de bate-papo
     * @param chat
     * @param user
     */
    removeMember(chat, user) {
        var _a, _b, _c;
        return __awaiter(this, void 0, void 0, function* () {
            if (!chat.id.includes("@g.us"))
                return;
            const bot = (_a = (yield this.getChat(chat.id))) === null || _a === void 0 ? void 0 : _a.getMember(new User_1.User(((_b = this.user) === null || _b === void 0 ? void 0 : _b.id) || ""));
            if (!bot || !bot.getAdmin())
                return;
            yield ((_c = this._bot) === null || _c === void 0 ? void 0 : _c.groupParticipantsUpdate(chat.id, [user.id], "remove"));
        });
    }
    /**
     * * Remove uma mensagem da sala de bate-papo
     * @param message
     * @returns
     */
    removeMessage(message) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            return yield ((_a = this._bot) === null || _a === void 0 ? void 0 : _a.chatModify({ clear: { messages: [{ id: message.id || "", fromMe: message.fromMe, timestamp: Date.now() }] } }, message.chat.id));
        });
    }
    /**
     * * Deleta uma mensagem da sala de bate-papo
     * @param message
     * @returns
     */
    deleteMessage(message) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const key = { remoteJid: message.chat.id, id: message.id };
            if (message.chat.id.includes("@g"))
                key.participant = message.user.id;
            return yield ((_a = this._bot) === null || _a === void 0 ? void 0 : _a.sendMessage(message.chat.id, { delete: key }));
        });
    }
    /**
     * * Envia um conteúdo
     * @param content
     * @returns
     */
    send(content) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
        return __awaiter(this, void 0, void 0, function* () {
            if (content instanceof Message_1.Message) {
                const waMSG = new WAMessage_1.WhatsAppMessage(this, content);
                yield waMSG.refactory(content);
                const { chat, message, context } = waMSG;
                if (message.hasOwnProperty("templateButtons")) {
                    const fullMsg = yield (0, baileys_1.generateWAMessage)(chat, message, Object.assign({ userJid: (_b = (_a = this._bot) === null || _a === void 0 ? void 0 : _a.user) === null || _b === void 0 ? void 0 : _b.id, logger: this.config.logger }, context));
                    fullMsg.message = { viewOnceMessage: { message: fullMsg.message } };
                    return (_c = this._bot) === null || _c === void 0 ? void 0 : _c.relayMessage(chat, fullMsg.message, { messageId: fullMsg.key.id });
                }
                return (_d = this._bot) === null || _d === void 0 ? void 0 : _d.sendMessage(chat, message, context);
            }
            if (content instanceof Status_1.Status) {
                if (content.status === "reading") {
                    const key = { remoteJid: (_e = content.chat) === null || _e === void 0 ? void 0 : _e.id, id: (_f = content.message) === null || _f === void 0 ? void 0 : _f.id };
                    if ((_g = key.remoteJid) === null || _g === void 0 ? void 0 : _g.includes("@g"))
                        key.participant = (_h = content.message) === null || _h === void 0 ? void 0 : _h.user.id;
                    return (_j = this._bot) === null || _j === void 0 ? void 0 : _j.readMessages([key]);
                }
                const status = this.statusOpts[content.status];
                return (_k = this._bot) === null || _k === void 0 ? void 0 : _k.sendPresenceUpdate(status, (_l = content.chat) === null || _l === void 0 ? void 0 : _l.id);
            }
        });
    }
    /**
     * * Faz o download de arquivos do WhatsApp
     * @param message
     * @param type
     * @param options
     * @param ctx
     * @returns
     */
    download(message, type, options, ctx) {
        return (0, baileys_1.downloadMediaMessage)(message, type, options, ctx);
    }
    /**
     * * Verifica se o número está registrado no WhatsApp
     * @returns
     */
    onExists(id) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield ((_a = this._bot) === null || _a === void 0 ? void 0 : _a.onWhatsApp(id));
            if (user && user.length > 0)
                return { exists: user[0].exists, id: user[0].jid };
            return { exists: false, id };
        });
    }
    /**
     * * Atualiza uma mensagem de mídia
     * @param message
     * @returns
     */
    updateMediaMessage(message) {
        var _a;
        if (this._bot)
            return (_a = this._bot) === null || _a === void 0 ? void 0 : _a.updateMediaMessage(message);
        throw "Sock não encontrado.";
    }
    /**
     * * Aceita o convite para um grupo
     * @param code
     * @returns
     */
    groupAcceptInvite(code) {
        var _a;
        return (_a = this._bot) === null || _a === void 0 ? void 0 : _a.groupAcceptInvite(code);
    }
}
exports.WhatsAppBot = WhatsAppBot;
//# sourceMappingURL=WhatsAppBot.js.map