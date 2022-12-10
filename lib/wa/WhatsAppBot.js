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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WhatsAppBot = void 0;
const baileys_1 = __importStar(require("@adiwajshing/baileys"));
const WAConvertMessage_1 = require("./WAConvertMessage");
const MediaMessage_1 = require("../messages/MediaMessage");
const WAMessage_1 = require("./WAMessage");
const logger_1 = require("../config/logger");
const getImageURL_1 = __importDefault(require("../utils/getImageURL"));
const Chat_1 = require("../models/Chat");
const User_1 = require("../models/User");
const Bot_1 = require("../models/Bot");
class WhatsAppBot extends Bot_1.Bot {
    constructor(config = {}) {
        super();
        this._auth = "";
        this.statusOpts = {
            typing: "composing",
            reading: "reading",
            recording: "recording",
            online: "available",
            offline: "unavailable",
        };
        this.DisconnectReason = baileys_1.DisconnectReason;
        this.chats = {};
        this.config = Object.assign({ printQRInTerminal: true, logger: (0, logger_1.loggerConfig)({ level: "silent" }), qrTimeout: 60000, browser: ["Rompot", "Chrome", "1.0.0"] }, config);
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
                        var _a, _b, _c, _d, _e, _f, _g;
                        if (update.connection == "connecting") {
                            this.events.connection.next({
                                action: "connecting",
                                status: this.status.getStatus(),
                            });
                        }
                        if (update.qr) {
                            this.events.connection.next({
                                action: "new",
                                status: this.status.getStatus(),
                                login: update.qr,
                            });
                        }
                        if (update.connection == "open") {
                            this.status.setStatus("online");
                            this.setId(((_c = (_b = (_a = this._bot) === null || _a === void 0 ? void 0 : _a.user) === null || _b === void 0 ? void 0 : _b.id) === null || _c === void 0 ? void 0 : _c.replace(/:(.*)@/, "@")) || "");
                            this.events.connection.next({
                                action: update.connection,
                                status: this.status.getStatus(),
                            });
                            resolve(true);
                        }
                        if (update.connection == "close") {
                            // Bot desligado
                            const status = ((_f = (_e = (_d = update.lastDisconnect) === null || _d === void 0 ? void 0 : _d.error) === null || _e === void 0 ? void 0 : _e.output) === null || _f === void 0 ? void 0 : _f.statusCode) || ((_g = update.lastDisconnect) === null || _g === void 0 ? void 0 : _g.error) || 500;
                            if (this.status.getStatus() == "online") {
                                this.status.setStatus("offline");
                                this.events.connection.next({
                                    action: update.connection,
                                    status: this.status.getStatus(),
                                });
                            }
                            if (status === baileys_1.DisconnectReason.loggedOut)
                                return;
                            setTimeout(() => __awaiter(this, void 0, void 0, function* () { return resolve(yield this.reconnect(this.config, false)); }), 2000);
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
                        const msg = yield new WAConvertMessage_1.WhatsAppConvertMessage(this, message, m.type).get();
                        msg.setBot(this);
                        if (message.key.fromMe && !this.config.receiveAllMessages) {
                            return this.events["bot-message"].next(msg);
                        }
                        this.events.message.next(msg);
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
    reconnect(config, alert = true) {
        return __awaiter(this, void 0, void 0, function* () {
            if (alert)
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
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (chat.id || chat.newJId) {
                    const newChat = new Chat_1.Chat(chat.id || chat.newJid, chat.name || chat.verifiedName || chat.notify || chat.subject);
                    if (newChat.id.includes("@g")) {
                        if (!chat.participants) {
                            const metadata = yield this.add(() => { var _a; return (_a = this._bot) === null || _a === void 0 ? void 0 : _a.groupMetadata(newChat.id); });
                            chat.participants = (metadata === null || metadata === void 0 ? void 0 : metadata.participants) || [];
                            newChat.name = metadata === null || metadata === void 0 ? void 0 : metadata.subject;
                            newChat.description = Buffer.from(metadata === null || metadata === void 0 ? void 0 : metadata.desc, "base64").toString();
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
            }
            catch (e) {
                this.events.error.next(e);
            }
        });
    }
    /**
     * * Obter uma sala de bate-papo
     * @param id
     * @returns
     */
    getChat(id) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.chats[id]) {
                if (id.includes("@s")) {
                    const [user] = (yield this.add(() => { var _a; return (_a = this._bot) === null || _a === void 0 ? void 0 : _a.onWhatsApp(id); })) || [];
                    if (user && user.exists)
                        yield this.chatUpsert(new Chat_1.Chat(user.jid));
                }
                if (id.includes("@g")) {
                    const metadata = yield this.add(() => { var _a; return (_a = this._bot) === null || _a === void 0 ? void 0 : _a.groupMetadata(id); });
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
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            if (!chat.id.includes("@g.us"))
                return;
            const bot = (_a = (yield this.getChat(chat.id))) === null || _a === void 0 ? void 0 : _a.getMember(new User_1.User(this.id || ""));
            if (!bot || !bot.getAdmin())
                return;
            yield this.add(() => { var _a; return (_a = this._bot) === null || _a === void 0 ? void 0 : _a.groupParticipantsUpdate(chat.id, [user.id], "add"); });
        });
    }
    /**
     * * Remove um usuário da sala de bate-papo
     * @param chat
     * @param user
     */
    removeMember(chat, user) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            if (!chat.id.includes("@g.us"))
                return;
            const bot = (_a = (yield this.getChat(chat.id))) === null || _a === void 0 ? void 0 : _a.getMember(new User_1.User(this.id || ""));
            if (!bot || !bot.getAdmin())
                return;
            yield this.add(() => { var _a; return (_a = this._bot) === null || _a === void 0 ? void 0 : _a.groupParticipantsUpdate(chat.id, [user.id], "remove"); });
        });
    }
    /**
     * * Remove uma mensagem da sala de bate-papo
     * @param message
     * @returns
     */
    removeMessage(message) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.add(() => {
                var _a;
                return (_a = this._bot) === null || _a === void 0 ? void 0 : _a.chatModify({
                    clear: { messages: [{ id: message.id || "", fromMe: message.fromMe, timestamp: Number(message.timestamp) }] },
                }, message.chat.id);
            });
        });
    }
    /**
     * * Deleta uma mensagem da sala de bate-papo
     * @param message
     * @returns
     */
    deleteMessage(message) {
        return __awaiter(this, void 0, void 0, function* () {
            const key = { remoteJid: message.chat.id, id: message.id };
            if (message.chat.id.includes("@g"))
                key.participant = message.user.id;
            return yield this.add(() => { var _a; return (_a = this._bot) === null || _a === void 0 ? void 0 : _a.sendMessage(message.chat.id, { delete: key }); });
        });
    }
    /**
     * * Bloqueia um usuário
     * @param user
     */
    blockUser(user) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.add(() => { var _a; return (_a = this._bot) === null || _a === void 0 ? void 0 : _a.updateBlockStatus(user.id, "block"); });
        });
    }
    /**
     * * Desbloqueia um usuário
     * @param user
     */
    unblockUser(user) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.add(() => { var _a; return (_a = this._bot) === null || _a === void 0 ? void 0 : _a.updateBlockStatus(user.id, "unblock"); });
        });
    }
    /**
     * * Define o nome do bot
     * @param name
     * @returns
     */
    setBotName(name) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.add(() => this._bot.updateProfileName(name));
        });
    }
    /**
     * * Retorna a imagem do bot / usuário / chat
     * @param id
     * @returns
     */
    getProfile(id = this.id) {
        return __awaiter(this, void 0, void 0, function* () {
            let url;
            if (typeof id == "string")
                url = yield this.add(() => this._bot.profilePictureUrl(id, "image"));
            if (id instanceof Chat_1.Chat || id instanceof User_1.User)
                url = yield this.add(() => this._bot.profilePictureUrl(id.id, "image"));
            if (!!url)
                return yield (0, getImageURL_1.default)(url);
            return undefined;
        });
    }
    /**
     * * Define a imagem do bot ou de um grupo
     * @param image
     * @param id
     * @returns
     */
    setProfile(image, id = this.id) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof id == "string")
                return this.add(() => this._bot.updateProfilePicture(id, image));
            if (id instanceof Chat_1.Chat)
                return this.add(() => this._bot.updateProfilePicture(id.id, { url: image }));
        });
    }
    /**
     * * Cria uma nova sala de bate-papo
     * @param name
     * @returns
     */
    createChat(name) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.add(() => this._bot.groupCreate(name, [this.id]));
        });
    }
    /**
     * * Define o nome da sala de bate-papo
     * @param id
     * @param name
     * @returns
     */
    setChatName(id, name) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof id == "string")
                return this.add(() => this._bot.groupUpdateSubject(id, name));
            if (id instanceof Chat_1.Chat)
                return this.add(() => this._bot.groupUpdateSubject(id.id, name));
        });
    }
    /**
     * * Retorna a descrição do bot ou de um usuário
     * @param id
     * @returns
     */
    getDescription(id = this.id) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof id != "string" && id.id)
                id = id.id;
            if (typeof id == "string" && (id === null || id === void 0 ? void 0 : id.includes("@s"))) {
                return this.add(() => __awaiter(this, void 0, void 0, function* () { var _a; return (_a = (yield this._bot.fetchStatus(id))) === null || _a === void 0 ? void 0 : _a.status; }));
            }
            return "";
        });
    }
    /**
     * * Define a descrição do bot ou de uma sala de bate-papo
     * @param desc
     * @param id
     * @returns
     */
    setDescription(desc, id) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof id != "string" && (id === null || id === void 0 ? void 0 : id.id))
                id = id.id;
            if (typeof id == "string" && (id === null || id === void 0 ? void 0 : id.includes("@g"))) {
                (_a = this.chats[id]) === null || _a === void 0 ? void 0 : _a.setDescription(desc);
                return this.add(() => this._bot.groupUpdateDescription(id, desc));
            }
            if (!!!id) {
                return this.add(() => this._bot.updateProfileStatus(desc));
            }
        });
    }
    /**
     * * Sai da sala de bate-papo
     * @param chat
     * @returns
     */
    leaveChat(chat) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof chat == "string")
                return this.add(() => this._bot.groupLeave(chat));
            if (chat.id)
                return this.add(() => this._bot.groupLeave(chat.id));
            if (this.chats[chat.id])
                this.removeChat(chat.id);
        });
    }
    sendMessage(content) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            const waMSG = new WAMessage_1.WhatsAppMessage(this, content);
            yield waMSG.refactory(content);
            const { chat, message, context } = waMSG;
            if (message.hasOwnProperty("templateButtons")) {
                const fullMsg = yield this.add(() => {
                    var _a, _b;
                    return (0, baileys_1.generateWAMessage)(chat, message, Object.assign({ userJid: (_b = (_a = this._bot) === null || _a === void 0 ? void 0 : _a.user) === null || _b === void 0 ? void 0 : _b.id, logger: this.config.logger }, context));
                });
                fullMsg.message = { viewOnceMessage: { message: fullMsg.message } };
                if (content instanceof MediaMessage_1.MediaMessage) {
                    yield ((_a = this._bot) === null || _a === void 0 ? void 0 : _a.relayMessage(chat, fullMsg.message, { messageId: fullMsg.key.id }));
                }
                else
                    yield this.add(() => { var _a; return (_a = this._bot) === null || _a === void 0 ? void 0 : _a.relayMessage(chat, fullMsg.message, { messageId: fullMsg.key.id }); });
                return yield new WAConvertMessage_1.WhatsAppConvertMessage(this, fullMsg).get();
            }
            if (content instanceof MediaMessage_1.MediaMessage) {
                return yield new WAConvertMessage_1.WhatsAppConvertMessage(this, yield ((_b = this._bot) === null || _b === void 0 ? void 0 : _b.sendMessage(chat, message, context))).get();
            }
            const sendedMessage = yield this.add(() => { var _a; return (_a = this._bot) === null || _a === void 0 ? void 0 : _a.sendMessage(chat, message, context); });
            return sendedMessage ? yield new WAConvertMessage_1.WhatsAppConvertMessage(this, sendedMessage).get() : content;
        });
    }
    /**
     * * Envia um conteúdo
     * @param content
     * @returns
     */
    sendStatus(content) {
        var _a, _b, _c, _d;
        return __awaiter(this, void 0, void 0, function* () {
            if (content.status === "reading") {
                const key = { remoteJid: (_a = content.chat) === null || _a === void 0 ? void 0 : _a.id, id: (_b = content.message) === null || _b === void 0 ? void 0 : _b.id };
                if ((_c = key.remoteJid) === null || _c === void 0 ? void 0 : _c.includes("@g"))
                    key.participant = (_d = content.message) === null || _d === void 0 ? void 0 : _d.user.id;
                return yield this.add(() => { var _a; return (_a = this._bot) === null || _a === void 0 ? void 0 : _a.readMessages([key]); });
            }
            const status = this.statusOpts[content.status];
            return yield this.add(() => { var _a, _b; return (_a = this._bot) === null || _a === void 0 ? void 0 : _a.sendPresenceUpdate(status, (_b = content.chat) === null || _b === void 0 ? void 0 : _b.id); });
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
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this.add(() => { var _a; return (_a = this._bot) === null || _a === void 0 ? void 0 : _a.onWhatsApp(id); });
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
        return this._bot.updateMediaMessage(message);
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