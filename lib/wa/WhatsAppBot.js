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
const ReactionMessage_1 = __importDefault(require("../messages/ReactionMessage"));
const PollMessage_1 = __importDefault(require("../messages/PollMessage"));
const Message_1 = __importDefault(require("../messages/Message"));
const Generic_1 = require("../utils/Generic");
const Emmiter_1 = require("../utils/Emmiter");
const Message_2 = require("../utils/Message");
const WaitCallBack_1 = __importDefault(require("../utils/WaitCallBack"));
class WhatsAppBot {
    constructor(config) {
        //@ts-ignore
        this.sock = {};
        this.DisconnectReason = baileys_1.DisconnectReason;
        this.users = {};
        this.ev = new Emmiter_1.BotEvents();
        this.status = "offline";
        this.id = "";
        this.auth = new Auth_1.MultiFileAuthState("./session", false);
        this.logger = (0, pino_1.default)({ level: "silent" });
        this.wcb = new WaitCallBack_1.default((err) => this.ev.emit("error", err));
        this.configEvents = new ConfigWAEvents_1.default(this);
        this.chats = {};
        this.polls = {};
        this.sendedMessages = {};
        this.config = Object.assign({ printQRInTerminal: true, logger: this.logger, browser: WhatsAppBot.Browser() }, config);
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
                    this.configEvents.connectionResolve = resolve;
                    this.configEvents.configure();
                    this.sock.ev.on("creds.update", saveCreds);
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
    saveSendedMessages(messages = this.sendedMessages) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.auth.set(`sendedMessages`, messages);
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
                    return;
                this.chats[id] = new WAModules_1.WAChat(chat.id, chat.type, chat.name, chat.description, chat.profile);
                for (const userId of Object.keys(chat.users || {})) {
                    const user = chat.users[userId];
                    if (!!!user)
                        continue;
                    this.chats[id].users[userId] = new WAModules_1.WAUser(user.id, user.name, user.description, user.profile);
                    this.chats[id].users[userId].isAdmin = user.isAdmin;
                    this.chats[id].users[userId].isLeader = user.isLeader;
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
                this.users[id] = new WAModules_1.WAUser(user.id, user.name, user.description, user.profile);
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
    readSendedMessages() {
        return __awaiter(this, void 0, void 0, function* () {
            const messages = (yield this.auth.get(`sendedMessages`)) || {};
            for (const id of Object.keys(messages || {})) {
                const msg = messages[id];
                if (!!!msg)
                    continue;
                this.sendedMessages[id] = (0, Generic_1.injectJSON)(msg, new Message_1.default("", ""));
            }
        });
    }
    /**
     * * Lê o chat
     * @param chat Sala de bate-papo
     */
    readChat(chat) {
        return __awaiter(this, void 0, void 0, function* () {
            chat.id = (0, ID_1.replaceID)(chat.id || chat.newJID);
            const newChat = this.chats[chat.id] || new WAModules_1.WAChat(chat.id, chat.name || chat.verifiedName || chat.notify || chat.subject);
            if (newChat.id.includes("@g")) {
                if (!!!(chat === null || chat === void 0 ? void 0 : chat.participants)) {
                    const metadata = yield this.wcb.waitCall(() => { var _a; return (_a = this.sock) === null || _a === void 0 ? void 0 : _a.groupMetadata((0, ID_1.getID)(newChat.id)); });
                    if (!!metadata)
                        chat = metadata;
                    yield Promise.all(((chat === null || chat === void 0 ? void 0 : chat.participants) || []).map((p) => __awaiter(this, void 0, void 0, function* () {
                        const user = this.users[(0, ID_1.replaceID)(p.id)] || new WAModules_1.WAUser((0, ID_1.replaceID)(p.id));
                        user.isAdmin = p.admin == "admin" || p.isAdmin || p.isSuperAdmin || false;
                        user.isLeader = p.admin == "superadmin" || p.isSuperAdmin || false;
                        newChat.users[user.id] = user;
                    })));
                }
            }
            newChat.name = chat.subject || chat.name || chat.verifiedName || chat.notify;
            newChat.description = (chat === null || chat === void 0 ? void 0 : chat.desc) || chat.description || "";
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
        var _a, _b, _c, _d;
        return __awaiter(this, void 0, void 0, function* () {
            const event = action == "join" ? "add" : action == "leave" ? "remove" : action;
            if (event == "remove" && (0, ID_1.replaceID)(userId) == this.id) {
                //? Obtem possíveis dados inexistentes
                var chat = yield this.getChat(new WAModules_1.WAChat((0, ID_1.replaceID)(chatId)));
                var user = yield this.getUser(new WAModules_1.WAUser((0, ID_1.replaceID)(userId)));
                var fromUser = yield this.getUser(new WAModules_1.WAUser((0, ID_1.replaceID)(fromId)));
            }
            else {
                //? Obtem dados já existentes
                var chat = this.chats[(0, ID_1.replaceID)(chatId)] || new WAModules_1.WAChat((0, ID_1.replaceID)(chatId), chatId.includes("@g") ? "group" : "pv");
                var fromUser = ((_a = this.chats[(0, ID_1.replaceID)(chatId)]) === null || _a === void 0 ? void 0 : _a.users[(0, ID_1.replaceID)(fromId)]) || new WAModules_1.WAUser((0, ID_1.replaceID)(fromId));
                var user = ((_b = this.chats[(0, ID_1.replaceID)(chatId)]) === null || _b === void 0 ? void 0 : _b.users[(0, ID_1.replaceID)(userId)]) || new WAModules_1.WAUser((0, ID_1.replaceID)(userId));
            }
            if (!this.chats.hasOwnProperty(chat.id))
                this.chats[chat.id] = chat;
            if (!((_d = (_c = this.chats[chat.id]) === null || _c === void 0 ? void 0 : _c.users) === null || _d === void 0 ? void 0 : _d.hasOwnProperty(user.id))) {
                this.chats[chat.id].users[user.id] = user;
            }
            if (event == "add")
                this.chats[chat.id].users[user.id] = user;
            if (event == "promote")
                this.chats[chat.id].users[user.id].isAdmin = true;
            if (event == "demote")
                this.chats[chat.id].users[user.id].isAdmin = false;
            yield this.saveChats();
            if (event == "remove") {
                if (user.id == this.id) {
                    delete this.chats[chat.id];
                    yield this.saveChats();
                    this.ev.emit("chat", { action: "remove", chat });
                    return;
                }
                else {
                    delete this.chats[chat.id].users[user.id];
                }
            }
            this.ev.emit("user", { action, event, user, fromUser, chat });
        });
    }
    //! ********************************* CHAT *********************************
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
            if (!this.chats[(0, ID_1.replaceID)(chat.id)]) {
                const newChat = yield this.readChat(chat);
                return newChat;
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
            if (chat instanceof WAModules_1.WAChat) {
                this.chats[chat.id] = new WAModules_1.WAChat(chat.id, chat.type, chat.name, chat.description, chat.profile, chat.users);
            }
            else {
                this.chats[chat.id] = new WAModules_1.WAChat(chat.id, chat.type);
            }
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
            return yield this.wcb.waitCall(() => this.sock.sendPresenceUpdate(WAStatus_1.WAStatus[status] || "available", (0, ID_1.getID)(WAModules_1.WAChat.getId(chat))));
        });
    }
    createChat(chat) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.wcb.waitCall(() => this.sock.groupCreate(chat.name || "", [(0, ID_1.getID)(this.id)]));
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
    //! ******************************* USER *******************************
    getUserName(user) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            return ((_a = (yield this.getChat(new WAModules_1.WAChat(user.id)))) === null || _a === void 0 ? void 0 : _a.name) || "";
        });
    }
    setUserName(user, name) {
        return __awaiter(this, void 0, void 0, function* () {
            if (user.id == this.id) {
                return this.setBotName(name);
            }
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
    getUserProfile(user, lowQuality) {
        return __awaiter(this, void 0, void 0, function* () {
            const uri = yield this.wcb.waitCall(() => this.sock.profilePictureUrl((0, ID_1.getID)(user.id), !!lowQuality ? "preview" : "image"));
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
    getUser(user) {
        return __awaiter(this, void 0, void 0, function* () {
            let usr = this.chats[user.id] || this.users[user.id];
            if (!usr) {
                return yield this.readUser(user);
            }
            return (0, Generic_1.injectJSON)(usr, new WAModules_1.WAUser(usr.id)) || null;
        });
    }
    setUser(user) {
        return __awaiter(this, void 0, void 0, function* () {
            if (user instanceof WAModules_1.WAUser) {
                this.users[user.id] = new WAModules_1.WAUser(user.id, user.name, user.description, user.profile);
            }
            else {
                this.users[user.id] = new WAModules_1.WAUser(user.id);
            }
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
                users[id] = new WAModules_1.WAUser(chat.id, chat.name, chat.description, chat.profile);
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
    //! ******************************** BOT ********************************
    getBotName() {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            return ((_a = (yield this.getChat(new WAModules_1.WAChat(this.id)))) === null || _a === void 0 ? void 0 : _a.name) || "";
        });
    }
    setBotName(name) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.wcb.waitCall(() => this.sock.updateProfileName(name));
        });
    }
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
    //! ******************************* MESSAGE *******************************
    /**
     * * Adiciona uma mensagem na lista de mensagens enviadas
     * @param message Mensagem que será adicionada
     */
    addSendedMessage(message) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof message != "object" || !message || !!!message.id)
                return;
            message.apiSend = true;
            this.sendedMessages[message.id] = message;
            yield this.saveSendedMessages();
        });
    }
    /**
     * * Remove uma mensagem da lista de mensagens enviadas
     * @param message Mensagem que será removida
     */
    removeMessageIgnore(message) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.sendedMessages.hasOwnProperty(message.id)) {
                delete this.sendedMessages[message.id];
            }
            yield this.saveSendedMessages();
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
            const msg = yield this.wcb.waitCall(() => { var _a; return (_a = this.sock) === null || _a === void 0 ? void 0 : _a.sendMessage((0, ID_1.getID)(message.chat.id), { delete: key }); });
            yield this.addSendedMessage(yield new WAConvertMessage_1.WhatsAppConvertMessage(this, msg).get());
        });
    }
    addReaction(message, reaction) {
        return __awaiter(this, void 0, void 0, function* () {
            const reactionMessage = new ReactionMessage_1.default(message.chat, reaction, message);
            reactionMessage.user = message.user;
            const waMSG = new WAMessage_1.WhatsAppMessage(this, reactionMessage);
            yield waMSG.refactory(reactionMessage);
            const msg = yield this.wcb.waitCall(() => { var _a; return (_a = this.sock) === null || _a === void 0 ? void 0 : _a.sendMessage((0, ID_1.getID)(message.chat.id), waMSG.message); });
            yield this.addSendedMessage(yield new WAConvertMessage_1.WhatsAppConvertMessage(this, msg).get());
        });
    }
    removeReaction(message) {
        return __awaiter(this, void 0, void 0, function* () {
            const reactionMessage = new ReactionMessage_1.default(message.chat, "", message);
            reactionMessage.user = message.user;
            const waMSG = new WAMessage_1.WhatsAppMessage(this, reactionMessage);
            yield waMSG.refactory(reactionMessage);
            const msg = yield this.wcb.waitCall(() => { var _a; return (_a = this.sock) === null || _a === void 0 ? void 0 : _a.sendMessage((0, ID_1.getID)(message.chat.id), waMSG.message); });
            yield this.addSendedMessage(yield new WAConvertMessage_1.WhatsAppConvertMessage(this, msg).get());
        });
    }
    send(content) {
        return __awaiter(this, void 0, void 0, function* () {
            const waMSG = new WAMessage_1.WhatsAppMessage(this, content);
            yield waMSG.refactory(content);
            if (waMSG.isRelay) {
                const id = yield this.wcb.waitCall(() => { var _a; return (_a = this.sock) === null || _a === void 0 ? void 0 : _a.relayMessage(waMSG.chat, waMSG.message, Object.assign(Object.assign({}, waMSG.options), { messageId: waMSG.chat })); }).catch((err) => this.ev.emit("error", err));
                if (!!id && typeof id == "string")
                    content.id = id;
                return content;
            }
            const sendedMessage = yield this.wcb.waitCall(() => { var _a; return (_a = this.sock) === null || _a === void 0 ? void 0 : _a.sendMessage(waMSG.chat, waMSG.message, waMSG.options); }).catch((err) => this.ev.emit("error", err));
            if (typeof sendedMessage == "boolean")
                return content;
            const msgRes = (yield new WAConvertMessage_1.WhatsAppConvertMessage(this, sendedMessage).get()) || content;
            if ((0, Message_2.isPollMessage)(msgRes) && (0, Message_2.isPollMessage)(content)) {
                msgRes.options = content.options;
                msgRes.secretKey = sendedMessage.message.messageContextInfo.messageSecret;
                this.polls[msgRes.id] = msgRes;
                yield this.savePolls(this.polls);
            }
            yield this.addSendedMessage(msgRes);
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
    /**
     * * Gera a configuração de navegador
     * @param name Nome da plataforma
     * @param browser Nome do navegador
     * @param version Versão do navegador
     */
    static Browser(name = "Rompot", browser = "Chrome", version = "1.4.6") {
        return [name, browser, version];
    }
}
exports.default = WhatsAppBot;
//# sourceMappingURL=WhatsAppBot.js.map