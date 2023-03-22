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
const baileys_1 = __importStar(require("@adiwajshing/baileys"));
const stream_1 = __importDefault(require("stream"));
const pino_1 = __importDefault(require("pino"));
const Auth_1 = require("./Auth");
const WAConvertMessage_1 = require("./WAConvertMessage");
const WAMessage_1 = require("./WAMessage");
const ID_1 = require("./ID");
const WAStatus_1 = require("./WAStatus");
const User_1 = __importDefault(require("../modules/User"));
const Chat_1 = __importDefault(require("../modules/Chat"));
const Generic_1 = require("../utils/Generic");
const Emmiter_1 = require("../utils/Emmiter");
const WaitCallBack_1 = __importDefault(require("../utils/WaitCallBack"));
const Generic_2 = require("../utils/Generic");
class WhatsAppBot {
    constructor(config) {
        //@ts-ignore
        this.sock = {};
        this.DisconnectReason = baileys_1.DisconnectReason;
        this.chats = {};
        this.users = {};
        this.ev = new Emmiter_1.BotEvents();
        this.status = "offline";
        this.id = "";
        this.auth = new Auth_1.MultiFileAuthState("./session", false);
        this.logger = (0, pino_1.default)({ level: "silent" });
        this.wcb = new WaitCallBack_1.default();
        this.config = Object.assign({ printQRInTerminal: true, connectTimeoutMs: 2000, defaultQueryTimeoutMs: 30000, logger: this.logger }, config);
    }
    connect(auth) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                try {
                    if (!!!auth)
                        auth = String("./session");
                    if (typeof auth == "string") {
                        this.auth = new Auth_1.MultiFileAuthState(auth);
                    }
                    else
                        this.auth = auth;
                    const { state, saveCreds } = yield (0, Auth_1.getBaileysAuth)(this.auth);
                    this.sock = (0, baileys_1.default)(Object.assign({ auth: state }, this.config));
                    this.sock.ev.on("creds.update", saveCreds);
                    this.sock.ev.on("connection.update", (update) => __awaiter(this, void 0, void 0, function* () {
                        var _a, _b, _c, _d, _e, _f;
                        if (update.connection == "connecting") {
                            this.ev.emit("conn", { action: "connecting" });
                        }
                        if (update.qr) {
                            this.ev.emit("qr", update.qr);
                        }
                        if (update.connection == "open") {
                            this.status = "online";
                            this.id = (0, ID_1.replaceID)(((_b = (_a = this.sock) === null || _a === void 0 ? void 0 : _a.user) === null || _b === void 0 ? void 0 : _b.id) || "");
                            const chats = JSON.parse((yield this.auth.get(`chats`)) || "{}");
                            if (!!chats) {
                                Object.keys(chats).forEach((key) => {
                                    key = (0, ID_1.replaceID)(key);
                                    const chat = chats[key];
                                    if (!!!chat)
                                        return;
                                    this.chats[key] = new Chat_1.default((0, ID_1.replaceID)(chat.id), chat.type, chat.name, chat.description, chat.profile);
                                    if (chat === null || chat === void 0 ? void 0 : chat.users) {
                                        Object.keys((chat === null || chat === void 0 ? void 0 : chat.users) || {}).forEach((userKey) => {
                                            if (!!!userKey)
                                                return;
                                            userKey = (0, ID_1.replaceID)(userKey);
                                            const user = chat === null || chat === void 0 ? void 0 : chat.users[userKey];
                                            if (!!!user)
                                                return;
                                            this.chats[key].users[userKey] = new User_1.default((0, ID_1.replaceID)(user.id), user.name, user.description);
                                            this.chats[key].users[userKey].isAdmin = user.isAdmin;
                                            this.chats[key].users[userKey].isLeader = user.isLeader;
                                        });
                                    }
                                });
                            }
                            const users = JSON.parse((yield this.auth.get(`users`)) || "{}");
                            if (!!users) {
                                Object.keys(users).forEach((key) => {
                                    key = (0, ID_1.replaceID)(key);
                                    const user = users[key];
                                    if (!!!user)
                                        return;
                                    this.users[key] = new User_1.default((0, ID_1.replaceID)(user.id), user.name, user.description, user.profile);
                                });
                            }
                            this.ev.emit("open", { isNewLogin: update.isNewLogin || false });
                            resolve();
                        }
                        if (update.connection == "close") {
                            // Client desligado
                            const status = ((_e = (_d = (_c = update.lastDisconnect) === null || _c === void 0 ? void 0 : _c.error) === null || _d === void 0 ? void 0 : _d.output) === null || _e === void 0 ? void 0 : _e.statusCode) || ((_f = update.lastDisconnect) === null || _f === void 0 ? void 0 : _f.error) || 500;
                            const botStatus = String(this.status);
                            if (this.status == "online") {
                                this.status = "offline";
                                this.ev.emit("close", { status: "offline" });
                            }
                            if (status == baileys_1.DisconnectReason.badSession || status === baileys_1.DisconnectReason.loggedOut) {
                                this.ev.emit("closed", { status: "offline" });
                                return;
                            }
                            if (status == baileys_1.DisconnectReason.restartRequired) {
                                return resolve(yield this.reconnect(false));
                            }
                            setTimeout(() => __awaiter(this, void 0, void 0, function* () { return resolve(yield this.reconnect(botStatus != "online")); }), 1000);
                        }
                    }));
                    this.sock.ev.on("contacts.update", (updates) => {
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
                    this.sock.ev.on("chats.upsert", (updates) => {
                        for (const update of updates) {
                            update.id = (0, ID_1.replaceID)(update.id);
                            if (!this.chats[update.id])
                                this.chatUpsert(update);
                            else if (!this.chats[update.id].users[this.id]) {
                                this.chats[update.id].users[this.id] = new User_1.default(this.id);
                            }
                        }
                    });
                    this.sock.ev.on("chats.update", (updates) => {
                        for (const update of updates) {
                            update.id = (0, ID_1.replaceID)(update.id);
                            if (!this.chats[update.id] && !update.readOnly)
                                this.chatUpsert(update);
                        }
                    });
                    this.sock.ev.on("chats.delete", (deletions) => {
                        for (const id of deletions)
                            this.removeChat(new Chat_1.default(id));
                    });
                    this.sock.ev.on("groups.update", (updates) => {
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
                    this.sock.ev.on("group-participants.update", ({ id, participants, action }) => __awaiter(this, void 0, void 0, function* () {
                        var _g, _h;
                        id = (0, ID_1.replaceID)(id);
                        if (!this.chats[id]) {
                            if (action != "remove")
                                yield this.chatUpsert({ id });
                            else if (!participants.includes((0, ID_1.getID)(this.id)))
                                yield this.chatUpsert({ id });
                        }
                        for (let p of participants) {
                            p = (0, ID_1.replaceID)(p);
                            const user = new User_1.default(p);
                            if (!this.chats.hasOwnProperty(id)) {
                                this.chats[id] = new Chat_1.default(id);
                            }
                            if (!this.chats[id].users.hasOwnProperty(p)) {
                                this.chats[id].users[p] = user;
                            }
                            if (action == "add")
                                this.chats[id].users[p] = user;
                            if (action == "promote")
                                this.chats[id].users[p].isAdmin = true;
                            if (action == "demote") {
                                this.chats[id].users[p].isAdmin = false;
                                this.chats[id].users[p].isLeader = false;
                            }
                            const chat = new Chat_1.default(id);
                            if (this.chats[id]) {
                                chat.name = this.chats[id].name;
                                chat.description = this.chats[id].description;
                                chat.users = this.chats[id].users;
                                chat.type = this.chats[id].type;
                                const m = (_g = this.chats[id]) === null || _g === void 0 ? void 0 : _g.users[user.id];
                                user.id = (m === null || m === void 0 ? void 0 : m.id) || "";
                                user.name = (m === null || m === void 0 ? void 0 : m.name) || "";
                                user.isAdmin = (m === null || m === void 0 ? void 0 : m.isAdmin) || false;
                                user.isLeader = (m === null || m === void 0 ? void 0 : m.isLeader) || false;
                            }
                            if (action == "remove") {
                                if (p == this.id) {
                                    delete this.chats[id];
                                    this.ev.emit("chat", { action: "remove", chat });
                                }
                                else {
                                    (_h = this.chats[id]) === null || _h === void 0 ? true : delete _h.users[user.id];
                                }
                            }
                            this.ev.emit("user", { action, user: user, chat });
                        }
                    }));
                    this.sock.ev.on("messages.upsert", (m) => __awaiter(this, void 0, void 0, function* () {
                        if (m.messages.length <= 0)
                            return;
                        const message = m.messages[m.messages.length - 1];
                        if (message.key.remoteJid == "status@broadcast")
                            return;
                        if (!message.message)
                            return;
                        const msg = yield new WAConvertMessage_1.WhatsAppConvertMessage(this, message, m.type).get();
                        this.ev.emit("message", msg);
                    }));
                    this.ev.on("chat", () => this.saveChats(this.chats));
                }
                catch (err) {
                    reject((err === null || err === void 0 ? void 0 : err.stack) || err);
                }
            }));
        });
    }
    /**
     * * Reconecta ao servidor do WhatsApp
     * @param alert Avisa que está econectando
     * @returns
     */
    reconnect(alert = true) {
        return __awaiter(this, void 0, void 0, function* () {
            if (alert)
                this.ev.emit("reconnecting", {});
            yield this.stop();
            return this.connect(this.auth);
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
            if (this.status == "online") {
                (_a = this.sock) === null || _a === void 0 ? void 0 : _a.end(reason);
            }
            this.status = "offline";
        });
    }
    //! ********************************* CHAT *********************************
    /**
     * * Salva os chats salvos
     * @param chats Sala de bate-papos
     */
    saveChats(chats = this.chats) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.auth.set(`chats`, JSON.stringify(chats));
        });
    }
    /**
     * * Salva os usuários salvos
     * @param users Usuários
     */
    saveUsers(users = this.users) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.auth.set(`users`, JSON.stringify(users));
        });
    }
    /**
     * * Lê o chat e seta ele
     * @param chat Sala de bate-papo
     */
    chatUpsert(chat) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (chat.id || chat.newJId) {
                    chat.id = (0, ID_1.replaceID)(chat.id || chat.newJID);
                    const newChat = new Chat_1.default(chat.id, chat.name || chat.verifiedName || chat.notify || chat.subject);
                    if (newChat.id.includes("@g")) {
                        if (!chat.participants) {
                            const metadata = yield this.wcb.waitCall(() => { var _a; return (_a = this.sock) === null || _a === void 0 ? void 0 : _a.groupMetadata((0, ID_1.getID)(newChat.id)); });
                            chat.participants = (metadata === null || metadata === void 0 ? void 0 : metadata.participants) || [];
                            newChat.name = metadata === null || metadata === void 0 ? void 0 : metadata.subject;
                            newChat.description = (metadata === null || metadata === void 0 ? void 0 : metadata.desc) || "";
                        }
                        for (const user of chat.participants) {
                            const u = new User_1.default((0, ID_1.replaceID)(user.id));
                            u.isAdmin = !!user.admin || user.isAdmin || user.isSuperAdmin || false;
                            u.isLeader = user.admin == "superadmin" || user.isSuperAdmin || false;
                            newChat.users[u.id] = u;
                        }
                    }
                    this.addChat(newChat);
                }
            }
            catch (err) {
                this.ev.emit("error", (0, Generic_2.getError)(err));
            }
        });
    }
    /**
     * * Lê o usuário e seta ele
     * @param user Usuário
     */
    userUpsert(user) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (user.id || user.newJId) {
                    user.id = (0, ID_1.replaceID)(user.id || user.newJID);
                    const newUser = new User_1.default(user.id, user.name || user.verifiedName || user.notify || user.subject);
                    newUser.description = (user === null || user === void 0 ? void 0 : user.desc) || "";
                    this.addUser(newUser);
                }
            }
            catch (err) {
                this.ev.emit("error", (0, Generic_2.getError)(err));
            }
        });
    }
    addChat(chat) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.setChat(chat);
            if (this.chats[(0, ID_1.replaceID)(chat.id)]) {
                this.ev.emit("chat", { action: "add", chat: this.chats[(0, ID_1.replaceID)(chat.id)] });
            }
        });
    }
    removeChat(chat) {
        return __awaiter(this, void 0, void 0, function* () {
            delete this.chats[chat.id];
            this.ev.emit("chat", { action: "remove", chat });
        });
    }
    getChat(chat) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!this.chats[(0, ID_1.replaceID)(chat.id)]) {
                    if (chat.id.includes("@s") || !chat.id.includes("@")) {
                        yield this.chatUpsert(new Chat_1.default(chat.id));
                    }
                    if (chat.id.includes("@g")) {
                        const metadata = yield this.wcb.waitCall(() => { var _a; return (_a = this.sock) === null || _a === void 0 ? void 0 : _a.groupMetadata((0, ID_1.getID)(chat.id)); });
                        if (metadata)
                            yield this.chatUpsert(metadata);
                    }
                }
            }
            catch (err) {
                this.ev.emit("error", (0, Generic_2.getError)(err));
            }
            return this.chats[(0, ID_1.replaceID)(chat.id)] || null;
        });
    }
    setChat(chat) {
        return __awaiter(this, void 0, void 0, function* () {
            if (chat.id.includes("status"))
                return;
            chat.id = (0, ID_1.replaceID)(chat.id);
            if (chat.id.includes("@g"))
                chat.type = "group";
            if (!chat.id.includes("@"))
                chat.type = "pv";
            this.chats[chat.id] = new Chat_1.default(chat.id, chat.type, chat.name, chat.description, chat.profile, chat.users);
        });
    }
    getChats() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.chats;
        });
    }
    setChats(chats) {
        return __awaiter(this, void 0, void 0, function* () {
            this.chats = chats;
        });
    }
    getChatAdmins(chat) {
        return __awaiter(this, void 0, void 0, function* () {
            const users = {};
            if (!this.chats.hasOwnProperty(chat.id))
                return users;
            for (const id in this.chats[chat.id].users) {
                const user = this.chats[chat.id].users[id];
                if (user.isAdmin || user.isLeader) {
                    users[id] = user;
                }
            }
            return users;
        });
    }
    getChatLeader(chat) {
        return __awaiter(this, void 0, void 0, function* () {
            let user = new User_1.default("");
            if (!this.chats.hasOwnProperty(chat.id))
                return user;
            for (const id in this.chats[chat.id].users) {
                if (this.chats[chat.id].users[id].isLeader) {
                    user = this.chats[chat.id].users[id];
                }
            }
            return user;
        });
    }
    addUserInChat(chat, user) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            if (!chat.id.includes("@g"))
                return;
            const bot = (_a = (yield this.getChat(chat))) === null || _a === void 0 ? void 0 : _a.users[this.id];
            if (!bot || !bot.isAdmin)
                return;
            yield this.wcb.waitCall(() => { var _a; return (_a = this.sock) === null || _a === void 0 ? void 0 : _a.groupParticipantsUpdate((0, ID_1.getID)(chat.id), [(0, ID_1.getID)(user.id)], "add"); });
        });
    }
    removeUserInChat(chat, user) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!chat.id.includes("@g"))
                return;
            if (!(yield this.getChatAdmins(chat)).hasOwnProperty(this.id))
                return;
            yield this.wcb.waitCall(() => { var _a; return (_a = this.sock) === null || _a === void 0 ? void 0 : _a.groupParticipantsUpdate((0, ID_1.getID)(chat.id), [(0, ID_1.getID)(user.id)], "remove"); });
        });
    }
    promoteUserInChat(chat, user) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!chat.id.includes("@g"))
                return;
            if (!(yield this.getChatAdmins(chat)).hasOwnProperty(this.id))
                return;
            yield this.wcb.waitCall(() => { var _a; return (_a = this.sock) === null || _a === void 0 ? void 0 : _a.groupParticipantsUpdate((0, ID_1.getID)(chat.id), [(0, ID_1.getID)(user.id)], "promote"); });
        });
    }
    demoteUserInChat(chat, user) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!chat.id.includes("@g"))
                return;
            if (!(yield this.getChatAdmins(chat)).hasOwnProperty(this.id))
                return;
            yield this.wcb.waitCall(() => { var _a; return (_a = this.sock) === null || _a === void 0 ? void 0 : _a.groupParticipantsUpdate((0, ID_1.getID)(chat.id), [(0, ID_1.getID)(user.id)], "demote"); });
        });
    }
    changeChatStatus(chat, status) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.wcb.waitCall(() => this.sock.sendPresenceUpdate(WAStatus_1.WAStatus[status] || "available", (0, ID_1.getID)(Chat_1.default.getId(chat))));
        });
    }
    createChat(chat) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.wcb.waitCall(() => this.sock.groupCreate(chat.name || "", [(0, ID_1.getID)(this.id)]));
        });
    }
    leaveChat(chat) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.chats.hasOwnProperty((0, ID_1.replaceID)(chat.id))) {
                if (!chat.id.includes("@g"))
                    return;
                if (!(yield this.getChatAdmins(chat)).hasOwnProperty(this.id))
                    return;
                return this.wcb.waitCall(() => this.sock.groupLeave((0, ID_1.getID)(chat.id)));
            }
            return this.removeChat(chat);
        });
    }
    getUser(user) {
        return __awaiter(this, void 0, void 0, function* () {
            const usr = this.chats[user.id] || this.users[user.id];
            if (!usr)
                return null;
            return new User_1.default(usr.id, usr.name, usr.description, usr.profile);
        });
    }
    setUser(user) {
        return __awaiter(this, void 0, void 0, function* () {
            this.users[user.id] = new User_1.default(user.id, user.name, user.description, user.profile);
            yield this.saveUsers(this.users);
        });
    }
    getUsers() {
        return __awaiter(this, void 0, void 0, function* () {
            const users = {};
            for (const id in this.chats) {
                const chat = this.chats[id];
                if (chat.type != "pv" || chat.id.includes("@"))
                    continue;
                users[id] = new User_1.default(chat.id, chat.name, chat.description, chat.profile);
            }
            return users;
        });
    }
    setUsers(users) {
        return __awaiter(this, void 0, void 0, function* () {
            for (const id in users) {
                this.setUser(users[id]);
            }
        });
    }
    addUser(user) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.setUser(user);
        });
    }
    removeUser(user) {
        return __awaiter(this, void 0, void 0, function* () {
            delete this.chats[user.id];
        });
    }
    blockUser(user) {
        return __awaiter(this, void 0, void 0, function* () {
            if (user.id == this.id)
                return;
            yield this.wcb.waitCall(() => { var _a; return (_a = this.sock) === null || _a === void 0 ? void 0 : _a.updateBlockStatus((0, ID_1.getID)(user.id), "block"); });
        });
    }
    unblockUser(user) {
        return __awaiter(this, void 0, void 0, function* () {
            if (user.id == this.id)
                return;
            yield this.wcb.waitCall(() => { var _a; return (_a = this.sock) === null || _a === void 0 ? void 0 : _a.updateBlockStatus((0, ID_1.getID)(user.id), "unblock"); });
        });
    }
    //! ******************************** NOME ********************************
    getBotName() {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            return ((_a = (yield this.getChat(new Chat_1.default(this.id)))) === null || _a === void 0 ? void 0 : _a.name) || "";
        });
    }
    setBotName(name) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.wcb.waitCall(() => this.sock.updateProfileName(name));
        });
    }
    getUserName(user) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            return ((_a = (yield this.getChat(new Chat_1.default(user.id)))) === null || _a === void 0 ? void 0 : _a.name) || "";
        });
    }
    setUserName(user, name) {
        return __awaiter(this, void 0, void 0, function* () {
            if (user.id == this.id) {
                return this.setBotName(name);
            }
        });
    }
    getChatName(chat) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            return ((_a = (yield this.getChat(chat))) === null || _a === void 0 ? void 0 : _a.name) || "";
        });
    }
    setChatName(chat, name) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!chat.id.includes("@g"))
                return;
            if (!(yield this.getChatAdmins(chat)).hasOwnProperty(this.id))
                return;
            return this.wcb.waitCall(() => this.sock.groupUpdateSubject((0, ID_1.getID)(chat.id), name));
        });
    }
    //! ******************************* PROFILE *******************************
    getBotProfile() {
        return __awaiter(this, void 0, void 0, function* () {
            const uri = yield this.wcb.waitCall(() => this.sock.profilePictureUrl((0, ID_1.getID)(this.id), "image"));
            return yield (0, Generic_1.getImageURL)(uri);
        });
    }
    setBotProfile(image) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.wcb.waitCall(() => this.sock.updateProfilePicture((0, ID_1.getID)(this.id), image));
        });
    }
    getUserProfile(user) {
        return __awaiter(this, void 0, void 0, function* () {
            const uri = yield this.wcb.waitCall(() => this.sock.profilePictureUrl((0, ID_1.getID)(user.id), "image"));
            return yield (0, Generic_1.getImageURL)(uri);
        });
    }
    setUserProfile(user, image) {
        return __awaiter(this, void 0, void 0, function* () {
            if (user.id == this.id) {
                return this.setBotProfile(image);
            }
        });
    }
    getChatProfile(chat) {
        return __awaiter(this, void 0, void 0, function* () {
            const uri = yield this.wcb.waitCall(() => this.sock.profilePictureUrl((0, ID_1.getID)(chat.id), "image"));
            return yield (0, Generic_1.getImageURL)(uri);
        });
    }
    setChatProfile(chat, image) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!chat.id.includes("@g"))
                return;
            if (!(yield this.getChatAdmins(chat)).hasOwnProperty(this.id))
                return;
            return this.wcb.waitCall(() => this.sock.updateProfilePicture((0, ID_1.getID)(chat.id), image));
        });
    }
    //! ****************************** DESCRIÇÃO ******************************
    getBotDescription() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.wcb.waitCall(() => __awaiter(this, void 0, void 0, function* () { var _a; return ((_a = (yield this.sock.fetchStatus(String((0, ID_1.getID)(this.id))))) === null || _a === void 0 ? void 0 : _a.status) || ""; }));
        });
    }
    setBotDescription(description) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.wcb.waitCall(() => this.sock.updateProfileStatus(description));
        });
    }
    getUserDescription(user) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.wcb.waitCall(() => __awaiter(this, void 0, void 0, function* () { var _a; return ((_a = (yield this.sock.fetchStatus(String((0, ID_1.getID)(user.id))))) === null || _a === void 0 ? void 0 : _a.status) || ""; }));
        });
    }
    setUserDescription(user, description) {
        return __awaiter(this, void 0, void 0, function* () {
            if (user.id == this.id) {
                return this.setBotDescription(description);
            }
        });
    }
    getChatDescription(chat) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            return ((_a = (yield this.getChat(chat))) === null || _a === void 0 ? void 0 : _a.description) || "";
        });
    }
    setChatDescription(chat, description) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!chat.id.includes("@g"))
                return;
            if (!(yield this.getChatAdmins(chat)).hasOwnProperty(this.id))
                return;
            return this.wcb.waitCall(() => this.sock.groupUpdateDescription((0, ID_1.getID)(chat.id), description));
        });
    }
    //! ******************************* MESSAGE *******************************
    readMessage(message) {
        return __awaiter(this, void 0, void 0, function* () {
            const key = {
                remoteJid: (0, ID_1.getID)(message.chat.id),
                id: message.id || "",
                fromMe: message.user.id == this.id,
                participant: message.chat.id.includes("@g") ? (0, ID_1.getID)(message.user.id) : "",
                toJSON: () => this,
            };
            return yield this.wcb.waitCall(() => this.sock.readMessages([key]));
        });
    }
    removeMessage(message) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.wcb.waitCall(() => {
                var _a;
                return (_a = this.sock) === null || _a === void 0 ? void 0 : _a.chatModify({
                    clear: { messages: [{ id: message.id || "", fromMe: message.user.id == this.id, timestamp: Number(message.timestamp || Date.now()) }] },
                }, (0, ID_1.getID)(message.chat.id));
            });
        });
    }
    deleteMessage(message) {
        return __awaiter(this, void 0, void 0, function* () {
            const key = { remoteJid: (0, ID_1.getID)(message.chat.id), id: message.id };
            if (message.chat.id.includes("@g")) {
                if (message.user.id != this.id && !(yield this.getChatAdmins(message.chat)).hasOwnProperty(this.id))
                    return;
                key.participant = (0, ID_1.getID)(message.user.id);
            }
            yield this.wcb.waitCall(() => { var _a; return (_a = this.sock) === null || _a === void 0 ? void 0 : _a.sendMessage((0, ID_1.getID)(message.chat.id), { delete: key }); });
        });
    }
    addReaction(message, reaction) {
        return __awaiter(this, void 0, void 0, function* () {
            const waMSG = new WAMessage_1.WhatsAppMessage(this, message);
            yield waMSG.refactory(message);
            yield this.wcb.waitCall(() => { var _a; return (_a = this.sock) === null || _a === void 0 ? void 0 : _a.sendMessage((0, ID_1.getID)(message.chat.id), { react: { key: waMSG.message.key, text: reaction } }); });
        });
    }
    removeReaction(message) {
        return __awaiter(this, void 0, void 0, function* () {
            const waMSG = new WAMessage_1.WhatsAppMessage(this, message);
            yield waMSG.refactory(message);
            yield this.wcb.waitCall(() => { var _a; return (_a = this.sock) === null || _a === void 0 ? void 0 : _a.sendMessage((0, ID_1.getID)(message.chat.id), { react: { key: waMSG.message.key, text: "" } }); });
        });
    }
    send(content) {
        return __awaiter(this, void 0, void 0, function* () {
            const waMSG = new WAMessage_1.WhatsAppMessage(this, content);
            yield waMSG.refactory(content);
            const { chat, message, options } = waMSG;
            var sendedMessage;
            if (message.hasOwnProperty("templateButtons")) {
                const fullMsg = yield this.wcb.waitCall(() => (0, baileys_1.generateWAMessage)(chat, message, {
                    userJid: (0, ID_1.getID)(this.id),
                    upload() {
                        return {};
                    },
                }));
                fullMsg.message = { viewOnceMessage: { message: fullMsg.message } };
                yield this.wcb.waitCall(() => { var _a; return (_a = this.sock) === null || _a === void 0 ? void 0 : _a.relayMessage(chat, fullMsg.message, { messageId: fullMsg.key.id }); });
                sendedMessage = fullMsg;
            }
            else {
                sendedMessage = yield this.wcb.waitCall(() => { var _a; return (_a = this.sock) === null || _a === void 0 ? void 0 : _a.sendMessage(chat, message, options); });
            }
            return sendedMessage ? yield new WAConvertMessage_1.WhatsAppConvertMessage(this, sendedMessage).get() : content;
        });
    }
    downloadStreamMessage(media) {
        return __awaiter(this, void 0, void 0, function* () {
            const stream = yield (0, baileys_1.downloadMediaMessage)(media.stream, "buffer", {}, {
                logger: this.logger,
                reuploadRequest: (m) => new Promise((resolve) => resolve(m)),
            });
            if (stream instanceof stream_1.default.Transform) {
                return stream.read();
            }
            return stream;
        });
    }
    //! ******************************** OUTROS *******************************
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
            const user = yield this.wcb.waitCall(() => { var _a; return (_a = this.sock) === null || _a === void 0 ? void 0 : _a.onWhatsApp((0, ID_1.getID)(id)); });
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
        return this.sock.updateMediaMessage(message);
    }
    /**
     * * Aceita o convite para um grupo
     * @param code
     * @returns
     */
    groupAcceptInvite(code) {
        var _a;
        return (_a = this.sock) === null || _a === void 0 ? void 0 : _a.groupAcceptInvite(code);
    }
}
exports.default = WhatsAppBot;
//# sourceMappingURL=WhatsAppBot.js.map