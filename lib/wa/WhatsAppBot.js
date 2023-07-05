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
const baileys_1 = __importStar(require("@whiskeysockets/baileys"));
const stream_1 = __importDefault(require("stream"));
const pino_1 = __importDefault(require("pino"));
const Auth_1 = require("./Auth");
const WAConvertMessage_1 = require("./WAConvertMessage");
const WAMessage_1 = require("./WAMessage");
const ConfigWAEvents_1 = __importDefault(require("./ConfigWAEvents"));
const WAModules_1 = require("./WAModules");
const ID_1 = require("./ID");
const WAStatus_1 = require("./WAStatus");
const PollMessage_1 = __importDefault(require("../messages/PollMessage"));
const Generic_1 = require("../utils/Generic");
const WaitCallBack_1 = __importDefault(require("../utils/WaitCallBack"));
const Verify_1 = require("../utils/Verify");
const Emmiter_1 = require("../utils/Emmiter");
class WhatsAppBot {
    constructor(config) {
        //@ts-ignore
        this.sock = {};
        this.DisconnectReason = baileys_1.DisconnectReason;
        this.logger = (0, pino_1.default)({ level: "silent" });
        this.id = "";
        this.ev = new Emmiter_1.BotEvents();
        this.status = "offline";
        this.auth = new Auth_1.MultiFileAuthState("./session", false);
        this.connectionResolve = [];
        this.configEvents = new ConfigWAEvents_1.default(this);
        this.wcb = new WaitCallBack_1.default((err) => this.ev.emit("error", err));
        this.chatWCB = new WaitCallBack_1.default((err) => this.ev.emit("error", err));
        this.msgWCB = new WaitCallBack_1.default((err) => this.ev.emit("error", err));
        this.chats = {};
        this.users = {};
        this.apiMessagesId = [];
        this.polls = {};
        this.config = Object.assign({ printQRInTerminal: true, logger: this.logger, defaultQueryTimeoutMs: 10000, browser: WhatsAppBot.Browser() }, config);
    }
    connect(auth) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!!!auth || typeof auth == "string") {
                    this.auth = new Auth_1.MultiFileAuthState(`${auth || "./session"}`);
                }
                else {
                    this.auth = auth;
                }
                yield this.internalConnect();
                yield this.awaitConnectionOpen();
                yield this.readChats();
                yield this.readUsers();
                yield this.readPolls();
                yield this.readApiMessagesId();
                this.configEvents.configureAll();
            }
            catch (err) {
                this.ev.emit("error", err);
            }
        });
    }
    internalConnect() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { state, saveCreds } = yield (0, Auth_1.getBaileysAuth)(this.auth);
                this.sock = (0, baileys_1.default)(Object.assign({ auth: state }, this.config));
                this.sock.ev.on("creds.update", saveCreds);
                this.configEvents.configConnectionUpdate();
            }
            catch (err) {
                this.ev.emit("error", err);
            }
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
            yield this.internalConnect();
            this.configEvents.configureAll();
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
    /**
     * * Aguarda o bot ficar online
     */
    awaitConnectionOpen() {
        return new Promise((res) => this.connectionResolve.push(res));
    }
    /**
     * * Resolve conexões em espera
     */
    resolveConnectionsAwait() {
        for (const res of this.connectionResolve) {
            res();
        }
    }
    //! ********************************* AUTH *********************************
    /**
     * * Salva os chats salvos
     * @param chats Sala de bate-papos
     */
    saveChats(chats = this.chats) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.auth.set(`chats`, chats);
        });
    }
    /**
     * * Salva os usuários salvos
     * @param users Usuários
     */
    saveUsers(users = this.users) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.auth.set(`users`, users);
        });
    }
    /**
     * * Salva as mensagem de enquete salvas
     * @param polls Enquetes
     */
    savePolls(polls = this.polls) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.auth.set(`polls`, polls);
        });
    }
    /**
     * * Salva as mensagens enviadas salvas
     * @param messages Mensagens enviadas
     */
    saveApiMessagesId(messages = this.apiMessagesId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.auth.set(`apiMessagesId`, messages);
        });
    }
    /**
     * * Obtem os chats salvos
     */
    readChats() {
        return __awaiter(this, void 0, void 0, function* () {
            const chats = (yield this.auth.get(`chats`)) || {};
            for (const id of Object.keys(chats || {})) {
                const chat = chats[id];
                if (!!!chat)
                    continue;
                this.chats[id] = (0, Generic_1.injectJSON)(chat, new WAModules_1.WAChat(chat.id));
                for (const userId of Object.keys(chat.users || {})) {
                    const user = chat.users[userId];
                    if (!!!user)
                        continue;
                    this.chats[id].users[userId] = (0, Generic_1.injectJSON)(user, new WAModules_1.WAUser(user.id));
                }
            }
        });
    }
    /**
     * * Obtem os usuários salvos
     */
    readUsers() {
        return __awaiter(this, void 0, void 0, function* () {
            const users = (yield this.auth.get(`users`)) || {};
            for (const id of Object.keys(users || {})) {
                const user = users[id];
                if (!!!user)
                    continue;
                this.users[id] = (0, Generic_1.injectJSON)(user, new WAModules_1.WAUser(user.id));
            }
        });
    }
    /**
     * * Obtem as mensagem de enquete salvas
     */
    readPolls() {
        return __awaiter(this, void 0, void 0, function* () {
            const polls = (yield this.auth.get(`polls`)) || {};
            for (const id of Object.keys(polls || {})) {
                const poll = polls[id];
                if (!!!poll)
                    continue;
                this.polls[id] = PollMessage_1.default.fromJSON(poll);
            }
        });
    }
    /**
     * * Obtem as mensagem enviadas salvas
     */
    readApiMessagesId() {
        return __awaiter(this, void 0, void 0, function* () {
            this.apiMessagesId = (yield this.auth.get(`apiMessagesId`)) || [];
        });
    }
    /**
     * * Lê o chat
     * @param chat Sala de bate-papo
     */
    readChat(chat) {
        return __awaiter(this, void 0, void 0, function* () {
            chat.id = (0, ID_1.replaceID)(chat.id || chat.newJID);
            const newChat = this.chats[chat.id] || new WAModules_1.WAChat(chat.id);
            if (newChat.id.includes("@g")) {
                const metadata = yield this.chatWCB.waitCall(() => { var _a; return (_a = this.sock) === null || _a === void 0 ? void 0 : _a.groupMetadata((0, ID_1.getID)(newChat.id)); });
                for (const p of (metadata === null || metadata === void 0 ? void 0 : metadata.participants) || []) {
                    const user = this.users[(0, ID_1.replaceID)(p.id)] || new WAModules_1.WAUser((0, ID_1.replaceID)(p.id));
                    user.isAdmin = p.admin == "admin" || p.isAdmin || p.isSuperAdmin || false;
                    user.isLeader = p.admin == "superadmin" || p.isSuperAdmin || false;
                    newChat.users[user.id] = user;
                }
                newChat.name = (metadata === null || metadata === void 0 ? void 0 : metadata.subject) || newChat.name || "";
                newChat.description = (metadata === null || metadata === void 0 ? void 0 : metadata.desc) || newChat.description || "";
            }
            else {
                newChat.name = (chat === null || chat === void 0 ? void 0 : chat.subject) || (chat === null || chat === void 0 ? void 0 : chat.name) || (chat === null || chat === void 0 ? void 0 : chat.verifiedName) || (chat === null || chat === void 0 ? void 0 : chat.notify) || newChat.name || "";
                newChat.description = (chat === null || chat === void 0 ? void 0 : chat.desc) || chat.description || newChat.description || "";
            }
            yield this.addChat(newChat);
            return newChat;
        });
    }
    /**
     * * Lê o usuário
     * @param user Usuário
     * @param save Salva usuário lido
     */
    readUser(user) {
        return __awaiter(this, void 0, void 0, function* () {
            const newUser = new WAModules_1.WAUser((user === null || user === void 0 ? void 0 : user.id) || (user === null || user === void 0 ? void 0 : user.newJID) || user || "", (user === null || user === void 0 ? void 0 : user.name) || (user === null || user === void 0 ? void 0 : user.verifiedName) || (user === null || user === void 0 ? void 0 : user.notify) || "");
            yield this.addUser(newUser);
            return newUser;
        });
    }
    /**
     * * Trata atualizações de participantes
     * @param action Ação realizada
     * @param chatId Sala de bate-papo que a ação foi realizada
     * @param userId Usuário que foi destinado a ação
     * @param fromId Usuário que realizou a ação
     */
    groupParticipantsUpdate(action, chatId, userId, fromId) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            const event = action == "join" ? "add" : action == "leave" ? "remove" : action;
            const chat = this.chats[(0, ID_1.replaceID)(chatId)] || new WAModules_1.WAChat((0, ID_1.replaceID)(chatId), chatId.includes("@g") ? "group" : "pv");
            const fromUser = this.users[(0, ID_1.replaceID)(fromId)] || new WAModules_1.WAUser((0, ID_1.replaceID)(fromId));
            const user = this.users[(0, ID_1.replaceID)(userId)] || new WAModules_1.WAUser((0, ID_1.replaceID)(userId));
            if (!this.chats.hasOwnProperty(chat.id))
                this.chats[chat.id] = chat;
            if (!((_b = (_a = this.chats[chat.id]) === null || _a === void 0 ? void 0 : _a.users) === null || _b === void 0 ? void 0 : _b.hasOwnProperty(user.id))) {
                this.chats[chat.id].users[user.id] = user;
            }
            if (event == "add")
                this.chats[chat.id].users[user.id] = user;
            if (event == "promote")
                this.chats[chat.id].users[user.id].isAdmin = true;
            if (event == "demote")
                this.chats[chat.id].users[user.id].isAdmin = false;
            if (event == "remove")
                delete this.chats[chat.id].users[user.id];
            if (user.id == this.id) {
                if (event == "remove")
                    yield this.removeChat(chat);
                if (event == "add")
                    yield this.addChat(chat);
            }
            else {
                yield this.saveChats();
            }
            this.ev.emit("user", { action, event, user, fromUser, chat });
        });
    }
    //! ********************************* CHAT *********************************
    getChatName(chat) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            return ((_a = this.chats[(0, ID_1.replaceID)(chat.id)]) === null || _a === void 0 ? void 0 : _a.name) || "";
        });
    }
    setChatName(chat, name) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!chat.id.includes("@g"))
                return;
            const admins = yield this.getChatAdmins(chat);
            if (!admins.hasOwnProperty(this.id))
                return;
            return this.wcb.waitCall(() => this.sock.groupUpdateSubject((0, ID_1.getID)(chat.id), name));
        });
    }
    getChatDescription(chat) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            return ((_a = this.chats[(0, ID_1.replaceID)(chat.id)]) === null || _a === void 0 ? void 0 : _a.description) || "";
        });
    }
    setChatDescription(chat, description) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!chat.id.includes("@g"))
                return;
            const admins = yield this.getChatAdmins(chat);
            if (!admins.hasOwnProperty(this.id))
                return;
            return this.wcb.waitCall(() => this.sock.groupUpdateDescription((0, ID_1.getID)(chat.id), description));
        });
    }
    getChatProfile(chat) {
        return __awaiter(this, void 0, void 0, function* () {
            const uri = yield this.chatWCB.waitCall(() => this.sock.profilePictureUrl((0, ID_1.getID)(chat.id), "image"));
            return yield (0, Generic_1.getImageURL)(uri);
        });
    }
    setChatProfile(chat, image) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!chat.id.includes("@g"))
                return;
            const admins = yield this.getChatAdmins(chat);
            if (!admins.hasOwnProperty(this.id))
                return;
            return this.wcb.waitCall(() => this.sock.updateProfilePicture((0, ID_1.getID)(chat.id), image));
        });
    }
    addChat(chat) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.setChat(chat);
            this.ev.emit("chat", { action: "add", chat: this.chats[(0, ID_1.replaceID)(chat.id)] || chat });
        });
    }
    removeChat(chat) {
        return __awaiter(this, void 0, void 0, function* () {
            delete this.chats[chat.id];
            this.ev.emit("chat", { action: "remove", chat });
            this.saveChats();
        });
    }
    getChat(chat) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.chats[(0, ID_1.replaceID)(chat.id)] || null;
        });
    }
    setChat(chat) {
        return __awaiter(this, void 0, void 0, function* () {
            if (chat.id.includes("status"))
                return;
            chat.id = (0, ID_1.replaceID)(chat.id);
            chat.type = WAModules_1.WAChat.getChatType(chat.id);
            this.chats[chat.id] = (0, Generic_1.injectJSON)(chat, new WAModules_1.WAChat(chat.id));
            yield this.saveChats();
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
    getChatUsers(chat) {
        return __awaiter(this, void 0, void 0, function* () {
            const users = {};
            if (!this.chats.hasOwnProperty(chat.id))
                return users;
            return this.chats[chat.id].users;
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
            let user = new WAModules_1.WAUser("");
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
        return __awaiter(this, void 0, void 0, function* () {
            if (!chat.id.includes("@g"))
                return;
            const admins = yield this.getChatAdmins(chat);
            if (!admins.hasOwnProperty(this.id))
                return;
            yield this.wcb.waitCall(() => { var _a; return (_a = this.sock) === null || _a === void 0 ? void 0 : _a.groupParticipantsUpdate((0, ID_1.getID)(chat.id), [(0, ID_1.getID)(user.id)], "add"); });
        });
    }
    removeUserInChat(chat, user) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!chat.id.includes("@g"))
                return;
            const admins = yield this.getChatAdmins(chat);
            if (!admins.hasOwnProperty(this.id))
                return;
            yield this.wcb.waitCall(() => { var _a; return (_a = this.sock) === null || _a === void 0 ? void 0 : _a.groupParticipantsUpdate((0, ID_1.getID)(chat.id), [(0, ID_1.getID)(user.id)], "remove"); });
        });
    }
    promoteUserInChat(chat, user) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!chat.id.includes("@g"))
                return;
            const admins = yield this.getChatAdmins(chat);
            if (!admins.hasOwnProperty(this.id))
                return;
            yield this.wcb.waitCall(() => { var _a; return (_a = this.sock) === null || _a === void 0 ? void 0 : _a.groupParticipantsUpdate((0, ID_1.getID)(chat.id), [(0, ID_1.getID)(user.id)], "promote"); });
        });
    }
    demoteUserInChat(chat, user) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!chat.id.includes("@g"))
                return;
            const admins = yield this.getChatAdmins(chat);
            if (!admins.hasOwnProperty(this.id))
                return;
            yield this.wcb.waitCall(() => { var _a; return (_a = this.sock) === null || _a === void 0 ? void 0 : _a.groupParticipantsUpdate((0, ID_1.getID)(chat.id), [(0, ID_1.getID)(user.id)], "demote"); });
        });
    }
    changeChatStatus(chat, status) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.wcb.waitCall(() => this.sock.sendPresenceUpdate(WAStatus_1.WAStatus[status] || "available", (0, ID_1.getID)(chat.id)));
        });
    }
    createChat(chat) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.wcb.waitCall(() => this.sock.groupCreate(chat.name || "", [(0, ID_1.getID)(this.id)]));
        });
    }
    leaveChat(chat) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!chat.id.includes("@g"))
                return;
            if (!this.chats.hasOwnProperty((0, ID_1.replaceID)(chat.id)))
                return;
            const admins = yield this.getChatAdmins(chat);
            if (!admins.hasOwnProperty(this.id))
                return;
            yield this.wcb.waitCall(() => this.sock.groupLeave((0, ID_1.getID)(chat.id)));
            yield this.removeChat(chat);
        });
    }
    //! ******************************* USER *******************************
    getUserName(user) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            return ((_a = (yield this.getUser(user))) === null || _a === void 0 ? void 0 : _a.name) || "";
        });
    }
    setUserName(user, name) {
        return __awaiter(this, void 0, void 0, function* () {
            if ((0, ID_1.replaceID)(user.id) != this.id)
                return;
            yield this.setBotName(name);
        });
    }
    getUserDescription(user) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.chatWCB.waitCall(() => __awaiter(this, void 0, void 0, function* () { var _a; return ((_a = (yield this.sock.fetchStatus(String((0, ID_1.getID)(user.id))))) === null || _a === void 0 ? void 0 : _a.status) || ""; }));
        });
    }
    setUserDescription(user, description) {
        return __awaiter(this, void 0, void 0, function* () {
            if ((0, ID_1.replaceID)(user.id) != this.id)
                return;
            yield this.setBotDescription(description);
        });
    }
    getUserProfile(user, lowQuality) {
        return __awaiter(this, void 0, void 0, function* () {
            const uri = yield this.chatWCB.waitCall(() => this.sock.profilePictureUrl((0, ID_1.getID)(user.id), !!lowQuality ? "preview" : "image"));
            return yield (0, Generic_1.getImageURL)(uri);
        });
    }
    setUserProfile(user, image) {
        return __awaiter(this, void 0, void 0, function* () {
            if ((0, ID_1.getID)(user.id) != this.id)
                return;
            return this.setBotProfile(image);
        });
    }
    getUser(user) {
        return __awaiter(this, void 0, void 0, function* () {
            let usr = this.chats[(0, ID_1.replaceID)(user.id)] || this.users[(0, ID_1.replaceID)(user.id)];
            if (!usr)
                return null;
            return (0, Generic_1.injectJSON)(usr, new WAModules_1.WAUser((0, ID_1.replaceID)(user.id)));
        });
    }
    setUser(user) {
        return __awaiter(this, void 0, void 0, function* () {
            this.users[(0, ID_1.replaceID)(user.id)] = (0, Generic_1.injectJSON)(user, new WAModules_1.WAUser((0, ID_1.replaceID)(user.id)));
            yield this.saveUsers();
        });
    }
    getUsers() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.users;
        });
    }
    setUsers(users) {
        return __awaiter(this, void 0, void 0, function* () {
            yield Promise.all(Object.keys(users).map((id) => __awaiter(this, void 0, void 0, function* () { return yield this.setUser(users[id]); })));
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
            if ((0, ID_1.replaceID)(user.id) == this.id)
                return;
            yield this.wcb.waitCall(() => { var _a; return (_a = this.sock) === null || _a === void 0 ? void 0 : _a.updateBlockStatus((0, ID_1.getID)(user.id), "block"); });
        });
    }
    unblockUser(user) {
        return __awaiter(this, void 0, void 0, function* () {
            if ((0, ID_1.replaceID)(user.id) == this.id)
                return;
            yield this.wcb.waitCall(() => { var _a; return (_a = this.sock) === null || _a === void 0 ? void 0 : _a.updateBlockStatus((0, ID_1.getID)(user.id), "unblock"); });
        });
    }
    //! ******************************** BOT ********************************
    getBotName() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.getUserName(WAModules_1.WAUser.get(this.id));
        });
    }
    setBotName(name) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.wcb.waitCall(() => this.sock.updateProfileName(name));
        });
    }
    getBotDescription() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.getUserDescription(WAModules_1.WAUser.get(this.id));
        });
    }
    setBotDescription(description) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.wcb.waitCall(() => this.sock.updateProfileStatus(description));
        });
    }
    getBotProfile() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.getUserProfile(WAModules_1.WAUser.get(this.id));
        });
    }
    setBotProfile(image) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.wcb.waitCall(() => this.sock.updateProfilePicture((0, ID_1.getID)(this.id), image));
        });
    }
    //! ******************************* MESSAGE *******************************
    /**
     * * Adiciona uma mensagem na lista de mensagens enviadas
     * @param msgId ID da mensagem que será adicionada
     */
    addApiMessageId(msgId) {
        return __awaiter(this, void 0, void 0, function* () {
            this.apiMessagesId.push(msgId);
            yield this.saveApiMessagesId();
        });
    }
    /**
     * * Remove uma mensagem da lista de mensagens enviadas
     * @param message Mensagem que será removida
     */
    removeMessageIgnore(msgId) {
        return __awaiter(this, void 0, void 0, function* () {
            const messagesId = this.apiMessagesId.filter((id) => id != msgId);
            if (messagesId.length == this.apiMessagesId.length)
                return;
            this.apiMessagesId = messagesId;
            yield this.saveApiMessagesId();
        });
    }
    readMessage(message) {
        return __awaiter(this, void 0, void 0, function* () {
            const key = {
                remoteJid: (0, ID_1.getID)(message.chat.id),
                id: message.id || "",
                fromMe: message.fromMe || message.user.id == this.id,
                participant: message.chat.id.includes("@g") ? (0, ID_1.getID)(message.user.id || this.id) : undefined,
                toJSON: () => key,
            };
            return yield this.msgWCB.waitCall(() => this.sock.readMessages([key]));
        });
    }
    removeMessage(message) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.msgWCB.waitCall(() => {
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
            yield this.msgWCB.waitCall(() => { var _a; return (_a = this.sock) === null || _a === void 0 ? void 0 : _a.sendMessage((0, ID_1.getID)(message.chat.id), { delete: key }); });
        });
    }
    addReaction(message) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.send(message);
        });
    }
    removeReaction(message) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.send(message);
        });
    }
    editMessage(message) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.send(message);
        });
    }
    send(content) {
        return __awaiter(this, void 0, void 0, function* () {
            const waMSG = new WAMessage_1.WhatsAppMessage(this, content);
            yield waMSG.refactory(content);
            if (waMSG.isRelay) {
                const id = yield this.msgWCB.waitCall(() => { var _a; return (_a = this.sock) === null || _a === void 0 ? void 0 : _a.relayMessage(waMSG.chat, waMSG.message, Object.assign(Object.assign({}, waMSG.options), { messageId: waMSG.chat })); }).catch((err) => this.ev.emit("error", err));
                if (!!id && typeof id == "string")
                    content.id = id;
                return content;
            }
            const sendedMessage = yield this.msgWCB.waitCall(() => { var _a; return (_a = this.sock) === null || _a === void 0 ? void 0 : _a.sendMessage(waMSG.chat, waMSG.message, waMSG.options); }).catch((err) => this.ev.emit("error", err));
            if (typeof sendedMessage == "boolean")
                return content;
            const msgRes = (yield new WAConvertMessage_1.WhatsAppConvertMessage(this, sendedMessage).get()) || content;
            if ((0, Verify_1.isPollMessage)(msgRes) && (0, Verify_1.isPollMessage)(content)) {
                msgRes.options = content.options;
                msgRes.secretKey = sendedMessage.message.messageContextInfo.messageSecret;
                this.polls[msgRes.id] = msgRes;
                yield this.savePolls(this.polls);
            }
            yield this.addApiMessageId(msgRes.id);
            return msgRes;
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
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.sock.updateMediaMessage(message);
        });
    }
    /**
     * * Aceita o convite para um grupo
     * @param code
     * @returns
     */
    groupAcceptInvite(code) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            return (yield ((_a = this.sock) === null || _a === void 0 ? void 0 : _a.groupAcceptInvite(code))) || "";
        });
    }
    /**
     * * Gera a configuração de navegador
     * @param name Nome da plataforma
     * @param browser Nome do navegador
     * @param version Versão do navegador
     */
    static Browser(name = "Rompot", browser = "Chrome", version = (0, Generic_1.getRompotVersion)()) {
        return [name, browser, version];
    }
}
exports.default = WhatsAppBot;
//# sourceMappingURL=WhatsAppBot.js.map