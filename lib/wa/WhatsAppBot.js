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
const Auth_1 = require("./Auth");
const MediaMessage_1 = require("../messages/MediaMessage");
const WAMessage_1 = require("./WAMessage");
const getImageURL_1 = __importDefault(require("../utils/getImageURL"));
const ID_1 = require("./ID");
const Chat_1 = require("../models/Chat");
const User_1 = require("../models/User");
const Bot_1 = require("../models/Bot");
const pino_1 = __importDefault(require("pino"));
class WhatsAppBot extends Bot_1.Bot {
    constructor(config) {
        super();
        this.statusOpts = {
            typing: "composing",
            reading: "reading",
            recording: "recording",
            online: "available",
            offline: "unavailable",
        };
        this.DisconnectReason = baileys_1.DisconnectReason;
        this.chats = {};
        this.config = Object.assign({ printQRInTerminal: true, logger: (0, pino_1.default)({ level: "silent" }) }, config);
    }
    /**
     * * Conecta ao servidor do WhatsApp
     * @param auth
     * @param config
     * @returns
     */
    connect(config = this.config) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                try {
                    this.config = Object.assign(Object.assign({}, this.config), config);
                    if (!!!this.config.auth)
                        this.config.auth = String(Date.now());
                    if (typeof this.config.auth == "string")
                        this.config.auth = new Auth_1.MultiFileAuthState(this.config.auth);
                    const { state, saveCreds } = yield (0, Auth_1.getBaileysAuth)(this.config.auth);
                    this._bot = (0, baileys_1.default)(Object.assign(Object.assign({}, this.config), { auth: state }));
                    this._bot.ev.on("creds.update", saveCreds);
                    // Verificando se bot conectou
                    this._bot.ev.on("connection.update", (update) => __awaiter(this, void 0, void 0, function* () {
                        var _a, _b, _c, _d, _e, _f;
                        if (update.connection == "connecting") {
                            this.emit("conn", { action: "connecting", status: "offline" });
                        }
                        if (update.qr) {
                            this.emit("qr", update.qr);
                        }
                        if (update.connection == "open") {
                            this.status.status = "online";
                            this.id = (0, ID_1.replaceID)(((_b = (_a = this._bot) === null || _a === void 0 ? void 0 : _a.user) === null || _b === void 0 ? void 0 : _b.id) || "");
                            const chats = yield this.config.auth.get(`chats`);
                            if (!!chats) {
                                Object.keys(chats).forEach((key) => {
                                    key = (0, ID_1.replaceID)(key);
                                    const chat = chats[key];
                                    if (!!!chat)
                                        return;
                                    this.chats[key] = new Chat_1.Chat((0, ID_1.replaceID)(chat.id), chat.name);
                                    this.chats[key].description = chat.description;
                                    this.chats[key].setBot(this);
                                    if (chat === null || chat === void 0 ? void 0 : chat.members) {
                                        Object.keys((chat === null || chat === void 0 ? void 0 : chat.members) || {}).forEach((mKey) => {
                                            if (!!!mKey)
                                                return;
                                            mKey = (0, ID_1.replaceID)(mKey);
                                            const member = chat === null || chat === void 0 ? void 0 : chat.members[mKey];
                                            if (!!!member)
                                                return;
                                            this.chats[key].members[mKey] = new User_1.User((0, ID_1.replaceID)(member.id), member.name, member.isAdmin, member.isLeader);
                                        });
                                    }
                                });
                                this.saveChats();
                            }
                            this.emit("open", { status: "online", isNewLogin: update.isNewLogin || false });
                            resolve(true);
                        }
                        if (update.connection == "close") {
                            // Bot desligado
                            const status = ((_e = (_d = (_c = update.lastDisconnect) === null || _c === void 0 ? void 0 : _c.error) === null || _d === void 0 ? void 0 : _d.output) === null || _e === void 0 ? void 0 : _e.statusCode) || ((_f = update.lastDisconnect) === null || _f === void 0 ? void 0 : _f.error) || 500;
                            if (this.status.status == "online") {
                                this.status.status = "offline";
                                this.emit("close", { status: "offline" });
                            }
                            if (status == baileys_1.DisconnectReason.badSession || status === baileys_1.DisconnectReason.loggedOut) {
                                return this.emit("closed", { status: "offline" });
                            }
                            setTimeout(() => __awaiter(this, void 0, void 0, function* () {
                                return resolve(yield this.reconnect(this.config, status != baileys_1.DisconnectReason.restartRequired || this.status.status == "offline"));
                            }), 2000);
                        }
                    }));
                    this._bot.ev.on("contacts.update", (updates) => {
                        for (const update of updates) {
                            update.id = (0, ID_1.replaceID)(update.id);
                            if (this.chats[update.id]) {
                                const name = update.notify || update.verifiedName;
                                if (this.chats[update.id].name !== name) {
                                    this.chatUpsert(update);
                                }
                            }
                            else
                                this.chatUpsert(update);
                        }
                    });
                    this._bot.ev.on("chats.upsert", (updates) => {
                        for (const update of updates) {
                            update.id = (0, ID_1.replaceID)(update.id);
                            if (!this.chats[update.id])
                                this.chatUpsert(update);
                            else if (!this.chats[update.id].members[this.id]) {
                                this.chats[update.id].members[this.id] = new User_1.User(this.id);
                            }
                        }
                    });
                    this._bot.ev.on("chats.update", (updates) => {
                        for (const update of updates) {
                            update.id = (0, ID_1.replaceID)(update.id);
                            if (!this.chats[update.id] && !update.readOnly)
                                this.chatUpsert(update);
                        }
                    });
                    this._bot.ev.on("chats.delete", (deletions) => {
                        for (const id of deletions)
                            this.removeChat((0, ID_1.replaceID)(id));
                    });
                    this._bot.ev.on("groups.update", (updates) => {
                        for (const update of updates) {
                            update.id = (0, ID_1.replaceID)(update.id);
                            if (this.chats[update.id]) {
                                if (update.subject) {
                                    this.chats[update.id].name = update.subject;
                                    this.saveChats();
                                }
                            }
                        }
                    });
                    this._bot.ev.on("group-participants.update", ({ id, participants, action }) => __awaiter(this, void 0, void 0, function* () {
                        var _g, _h;
                        id = (0, ID_1.replaceID)(id);
                        if (!this.chats[id]) {
                            if (action != "remove")
                                yield this.chatUpsert({ id });
                            else if (!participants.includes((0, ID_1.getID)(this.id)))
                                yield this.chatUpsert({ id });
                        }
                        for (let u of participants) {
                            u = (0, ID_1.replaceID)(u);
                            const member = new User_1.User(u);
                            if (action == "add")
                                this.chats[id].members[u] = member;
                            if (action == "promote")
                                this.chats[id].members[u].isAdmin = true;
                            if (action == "demote") {
                                this.chats[id].members[u].isAdmin = false;
                                this.chats[id].members[u].isLeader = false;
                            }
                            const user = new User_1.User(member.id);
                            const chat = new Chat_1.Chat(id);
                            if (this.chats[id]) {
                                chat.name = this.chats[id].name;
                                chat.description = this.chats[id].description;
                                chat.members = this.chats[id].members;
                                chat.type = this.chats[id].type;
                                const m = (_g = this.chats[id]) === null || _g === void 0 ? void 0 : _g.getMember(member);
                                user.id = (m === null || m === void 0 ? void 0 : m.id) || "";
                                user.name = (m === null || m === void 0 ? void 0 : m.name) || "";
                                user.isAdmin = (m === null || m === void 0 ? void 0 : m.isAdmin) || false;
                                user.isAdmin = (m === null || m === void 0 ? void 0 : m.isAdmin) || false;
                            }
                            if (action == "remove") {
                                if (u == this.id) {
                                    delete this.chats[id];
                                    this.emit("chat", { action: "remove", chat });
                                }
                                else {
                                    (_h = this.chats[id]) === null || _h === void 0 ? true : delete _h.members[member.id];
                                }
                            }
                            this.saveChats();
                            this.emit("member", { action, member: user, chat });
                        }
                    }));
                    this._bot.ev.on("messages.upsert", (m) => __awaiter(this, void 0, void 0, function* () {
                        if (m.messages.length <= 0)
                            return;
                        const message = m.messages[m.messages.length - 1];
                        if (message.key.remoteJid == "status@broadcast")
                            return;
                        if (!message.message)
                            return;
                        const msg = yield new WAConvertMessage_1.WhatsAppConvertMessage(this, message, m.type).get();
                        msg.setBot(this);
                        if (message.key.fromMe && !this.config.receiveAllMessages) {
                            return this.emit("me", msg);
                        }
                        this.emit("message", msg);
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
                this.emit("reconnecting", { status: "offline" });
            if (this.status.status == "online") {
                this.stop(baileys_1.DisconnectReason.loggedOut);
            }
            this.status.status = "offline";
            return this.connect(config || this.config);
        });
    }
    /**
     * * Desliga a conexão com o servidor do WhatsApp
     * @param reason
     * @returns
     */
    stop(reason = baileys_1.DisconnectReason.loggedOut) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            (_a = this._bot) === null || _a === void 0 ? void 0 : _a.end(reason);
        });
    }
    /**
     * * Salva os chats salvos
     * @param chats
     */
    saveChats(chats = this.chats) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.config.auth.set(`chats`, chats);
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
                    chat.id = (0, ID_1.replaceID)(chat.id || chat.newJID);
                    const newChat = new Chat_1.Chat(chat.id, chat.name || chat.verifiedName || chat.notify || chat.subject);
                    if (newChat.id.includes("@g")) {
                        if (!chat.participants) {
                            const metadata = yield this.add(() => { var _a; return (_a = this._bot) === null || _a === void 0 ? void 0 : _a.groupMetadata((0, ID_1.getID)(newChat.id)); });
                            chat.participants = (metadata === null || metadata === void 0 ? void 0 : metadata.participants) || [];
                            newChat.name = metadata === null || metadata === void 0 ? void 0 : metadata.subject;
                            newChat.description = Buffer.from((metadata === null || metadata === void 0 ? void 0 : metadata.desc) || "", "base64").toString();
                        }
                        for (const user of chat.participants) {
                            const u = new User_1.User((0, ID_1.replaceID)(user.id));
                            u.isAdmin = !!user.admin || user.isAdmin || user.isSuperAdmin || false;
                            u.isLeader = user.admin == "superadmin" || user.isSuperAdmin || false;
                            newChat.members[u.id] = u;
                        }
                    }
                    this.setChat(newChat);
                }
            }
            catch (e) {
                this.emit("error", e);
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
            try {
                id = (0, ID_1.replaceID)(id);
                if (!this.chats[id]) {
                    if (id.includes("@s") || !id.includes("@")) {
                        yield this.chatUpsert(new Chat_1.Chat(id));
                    }
                    if (id.includes("@g")) {
                        const metadata = yield this.add(() => { var _a; return (_a = this._bot) === null || _a === void 0 ? void 0 : _a.groupMetadata((0, ID_1.getID)(id)); });
                        if (metadata)
                            yield this.chatUpsert(metadata);
                    }
                }
            }
            catch (e) {
                this.emit("error", e);
            }
            return this.chats[id] || {};
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
            chat.id = (0, ID_1.replaceID)(chat.id);
            if (chat.id == "status@broadcast")
                return;
            if (chat.id.includes("@g"))
                chat.type = "group";
            if (!chat.id.includes("@"))
                chat.type = "pv";
            chat.setBot(this);
            this.chats[chat.id] = chat;
            this.saveChats();
            this.emit("chat", { action: "add", chat });
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
            const chat = new Chat_1.Chat(typeof id == "string" ? id : id.id);
            delete this.chats[typeof id == "string" ? id : id.id];
            this.emit("chat", { action: "remove", chat });
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
            if (!chat.id.includes("@g"))
                return;
            const bot = (_a = (yield this.getChat(chat.id))) === null || _a === void 0 ? void 0 : _a.getMember(new User_1.User(this.id || ""));
            if (!bot || !bot.isAdmin)
                return;
            yield this.add(() => { var _a; return (_a = this._bot) === null || _a === void 0 ? void 0 : _a.groupParticipantsUpdate((0, ID_1.getID)(chat.id), [(0, ID_1.getID)(user.id)], "add"); });
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
            if (!bot || !bot.isAdmin)
                return;
            yield this.add(() => { var _a; return (_a = this._bot) === null || _a === void 0 ? void 0 : _a.groupParticipantsUpdate((0, ID_1.getID)(chat.id), [(0, ID_1.getID)(user.id)], "remove"); });
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
                }, (0, ID_1.getID)(message.chat.id));
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
            const key = { remoteJid: (0, ID_1.getID)(message.chat.id), id: message.id };
            if (message.chat.id.includes("@g"))
                key.participant = (0, ID_1.getID)(message.user.id);
            return yield this.add(() => { var _a; return (_a = this._bot) === null || _a === void 0 ? void 0 : _a.sendMessage((0, ID_1.getID)(message.chat.id), { delete: key }); });
        });
    }
    /**
     * * Bloqueia um usuário
     * @param user
     */
    blockUser(user) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.add(() => { var _a; return (_a = this._bot) === null || _a === void 0 ? void 0 : _a.updateBlockStatus((0, ID_1.getID)(user.id), "block"); });
        });
    }
    /**
     * * Desbloqueia um usuário
     * @param user
     */
    unblockUser(user) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.add(() => { var _a; return (_a = this._bot) === null || _a === void 0 ? void 0 : _a.updateBlockStatus((0, ID_1.getID)(user.id), "unblock"); });
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
    getProfile(id = (0, ID_1.getID)(this.id)) {
        return __awaiter(this, void 0, void 0, function* () {
            let url;
            if (typeof id == "string")
                url = yield this.add(() => this._bot.profilePictureUrl((0, ID_1.getID)(id), "image"));
            if (id instanceof Chat_1.Chat || id instanceof User_1.User)
                url = yield this.add(() => this._bot.profilePictureUrl((0, ID_1.getID)(id.id), "image"));
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
    setProfile(image, id = (0, ID_1.getID)(this.id)) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof id == "string")
                return this.add(() => this._bot.updateProfilePicture((0, ID_1.getID)(id), image));
            if (id instanceof Chat_1.Chat)
                return this.add(() => this._bot.updateProfilePicture((0, ID_1.getID)(id.id), { url: image }));
        });
    }
    /**
     * * Cria uma nova sala de bate-papo
     * @param name
     * @returns
     */
    createChat(name) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.add(() => this._bot.groupCreate(name, [(0, ID_1.getID)(this.id)]));
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
                return this.add(() => this._bot.groupUpdateSubject((0, ID_1.getID)(id), name));
            if (id instanceof Chat_1.Chat)
                return this.add(() => this._bot.groupUpdateSubject((0, ID_1.getID)(id.id), name));
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
            id = (0, ID_1.getID)(`${id}`);
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
            id = (0, ID_1.getID)(`${id}`);
            if (typeof id == "string" && (id === null || id === void 0 ? void 0 : id.includes("@g"))) {
                (_a = this.chats[(0, ID_1.replaceID)(id)]) === null || _a === void 0 ? void 0 : _a.setDescription(desc);
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
                return this.add(() => this._bot.groupLeave((0, ID_1.getID)(chat)));
            if (chat.id)
                return this.add(() => this._bot.groupLeave((0, ID_1.getID)(chat.id)));
            if (this.chats[(0, ID_1.replaceID)(chat.id)])
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
                const fullMsg = yield this.add(() => (0, baileys_1.generateWAMessage)(chat, message, Object.assign({ userJid: (0, ID_1.getID)(this.id), logger: this.config.logger }, context)));
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
                const key = { remoteJid: (0, ID_1.getID)(((_a = content.chat) === null || _a === void 0 ? void 0 : _a.id) || ""), id: (_b = content.message) === null || _b === void 0 ? void 0 : _b.id };
                if ((_c = key.remoteJid) === null || _c === void 0 ? void 0 : _c.includes("@g"))
                    key.participant = (0, ID_1.getID)(((_d = content.message) === null || _d === void 0 ? void 0 : _d.user.id) || "");
                return yield this.add(() => { var _a; return (_a = this._bot) === null || _a === void 0 ? void 0 : _a.readMessages([key]); });
            }
            const status = this.statusOpts[content.status];
            return yield this.add(() => { var _a, _b; return (_a = this._bot) === null || _a === void 0 ? void 0 : _a.sendPresenceUpdate(status, (0, ID_1.getID)(((_b = content.chat) === null || _b === void 0 ? void 0 : _b.id) || "")); });
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
            const user = yield this.add(() => { var _a; return (_a = this._bot) === null || _a === void 0 ? void 0 : _a.onWhatsApp((0, ID_1.getID)(id)); });
            if (user && user.length > 0)
                return { exists: user[0].exists, id: (0, ID_1.replaceID)(user[0].jid) };
            return { exists: false, id: (0, ID_1.replaceID)(id) };
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