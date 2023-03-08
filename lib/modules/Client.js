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
const Generic_1 = require("../utils/Generic");
const PromiseMessages_1 = __importDefault(require("../utils/PromiseMessages"));
const Emmiter_1 = require("../utils/Emmiter");
const ConnectionConfig_1 = require("../config/ConnectionConfig");
class Client extends Emmiter_1.ClientEvents {
    constructor(bot, config = ConnectionConfig_1.DefaultConnectionConfig, commands = []) {
        super();
        this.promiseMessages = new PromiseMessages_1.default();
        this.autoMessages = {};
        this.bot = bot;
        this.config = config;
        this.commands = commands;
        this.configEvents();
    }
    get id() {
        return this.bot.id;
    }
    get status() {
        return this.bot.status;
    }
    configEvents() {
        this.bot.ev.on("message", (message) => {
            var _a;
            try {
                if (this.promiseMessages.resolvePromiseMessages(message))
                    return;
                if (message.fromMe && this.config.disableAutoCommand)
                    return;
                if (this.config.disableAutoCommand)
                    return;
                (_a = this.config.commandConfig.get(message.text, this.commands)) === null || _a === void 0 ? void 0 : _a.execute((0, Generic_1.MessageClient)(this, message));
            }
            catch (err) {
                this.emit("error", (0, Generic_1.getError)(err));
            }
        });
        this.bot.ev.on("me", (message) => {
            var _a;
            try {
                if (this.promiseMessages.resolvePromiseMessages(message))
                    return;
                if (this.config.disableAutoCommand || this.config.receiveAllMessages)
                    return;
                (_a = this.getCommand(message.text)) === null || _a === void 0 ? void 0 : _a.execute((0, Generic_1.MessageClient)(this, message));
            }
            catch (err) {
                this.emit("error", (0, Generic_1.getError)(err));
            }
        });
    }
    //! <===========================> CONNECTION <===========================>
    connect(auth) {
        return this.bot.connect(auth);
    }
    reconnect(alert) {
        return this.bot.reconnect(alert);
    }
    stop(reason) {
        return this.bot.stop(reason);
    }
    //! <============================> COMMANDS <============================>
    setCommands(commands) {
        this.commands = commands;
    }
    getCommands() {
        return this.commands;
    }
    addCommand(command) {
        this.commands.push(command);
    }
    getCommand(command) {
        var _a;
        const cmd = (_a = this.config.commandConfig) === null || _a === void 0 ? void 0 : _a.get(command, this.commands);
        if (!cmd)
            return null;
        //@ts-ignore
        return cmd;
    }
    //! <============================> MESSAGES <============================>
    deleteMessage(message) {
        return this.bot.removeMessage(message);
    }
    removeMessage(message) {
        return this.bot.removeMessage(message);
    }
    readMessage(message) {
        return this.bot.readMessage(message);
    }
    addReaction(message, reaction) {
        return this.bot.addReaction(message, reaction);
    }
    removeReaction(message) {
        return this.bot.removeReaction(message);
    }
    send(message) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return (0, Generic_1.MessageClient)(this, yield this.bot.send(message));
            }
            catch (err) {
                this.emit("error", (0, Generic_1.getError)(err));
            }
            return (0, Generic_1.MessageClient)(this, message);
        });
    }
    awaitMessage(chat, ignoreMessageFromMe = true, stopRead = true, ...ignoreMessages) {
        return __awaiter(this, void 0, void 0, function* () {
            return (0, Generic_1.MessageClient)(this, yield this.promiseMessages.addPromiseMessage((0, Generic_1.getChatId)(chat), ignoreMessageFromMe, stopRead, ...ignoreMessages));
        });
    }
    addAutomate(message, timeout, chats, id = String(Date.now())) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const now = Date.now();
                // Criar e atualizar dados da mensagem automatizada
                this.autoMessages[id] = { id, chats: chats || (yield this.getChats()), updatedAt: now, message };
                // Aguarda o tempo definido
                yield (0, Generic_1.sleep)(timeout - now);
                // Cancelar se estiver desatualizado
                if (this.autoMessages[id].updatedAt !== now)
                    return;
                yield Promise.all(this.autoMessages[id].chats.map((chat) => __awaiter(this, void 0, void 0, function* () {
                    var _a;
                    const automated = this.autoMessages[id];
                    if (automated.updatedAt !== now)
                        return;
                    (_a = automated.message) === null || _a === void 0 ? void 0 : _a.setChat(chat);
                    // Enviar mensagem
                    yield this.send(automated.message);
                    // Remover sala de bate-papo da mensagem
                    const nowChats = automated.chats;
                    const index = nowChats.indexOf(automated.chats[chat.id]);
                    this.autoMessages[id].chats = nowChats.splice(index + 1, nowChats.length);
                })));
            }
            catch (err) {
                this.emit("error", (0, Generic_1.getError)(err));
            }
        });
    }
    //! <===============================> BOT <==============================>
    getBotName() {
        return this.bot.getBotName();
    }
    setBotName(name) {
        return this.bot.setBotName(name);
    }
    getBotDescription() {
        return this.bot.getBotDescription();
    }
    setBotDescription(description) {
        return this.bot.setBotDescription(description);
    }
    getBotProfile() {
        return this.bot.getBotProfile();
    }
    setBotProfile(profile) {
        return this.bot.setBotProfile(profile);
    }
    //! <==============================> CHAT <==============================>
    getChat(chat) {
        return __awaiter(this, void 0, void 0, function* () {
            const iChat = yield this.bot.getChat((0, Generic_1.getChat)(chat));
            if (!iChat)
                return null;
            return (0, Generic_1.ChatClient)(this, iChat);
        });
    }
    setChat(chat) {
        return this.bot.setChat((0, Generic_1.ChatClient)(this, chat));
    }
    getChats() {
        return __awaiter(this, void 0, void 0, function* () {
            const modules = {};
            const chats = yield this.bot.getChats();
            for (const id in chats) {
                modules[id] = (0, Generic_1.ChatClient)(this, chats[id]);
            }
            return modules;
        });
    }
    setChats(chats) {
        return this.bot.setChats(chats);
    }
    addChat(chat) {
        return this.bot.addChat((0, Generic_1.ChatClient)(this, (0, Generic_1.getChat)(chat)));
    }
    removeChat(chat) {
        return this.bot.removeChat((0, Generic_1.ChatClient)(this, (0, Generic_1.getChat)(chat)));
    }
    getChatName(chat) {
        return this.bot.getChatName((0, Generic_1.getChat)(chat));
    }
    setChatName(chat, name) {
        return this.bot.setChatName((0, Generic_1.getChat)(chat), name);
    }
    getChatDescription(chat) {
        return this.bot.getChatDescription((0, Generic_1.getChat)(chat));
    }
    setChatDescription(chat, description) {
        return this.bot.setChatDescription((0, Generic_1.getChat)(chat), description);
    }
    getChatProfile(chat) {
        return this.bot.getChatProfile((0, Generic_1.getChat)(chat));
    }
    setChatProfile(chat, profile) {
        return this.bot.setChatProfile((0, Generic_1.getChat)(chat), profile);
    }
    changeChatStatus(chat, status) {
        return this.bot.changeChatStatus((0, Generic_1.getChat)(chat), status);
    }
    addUserInChat(chat, user) {
        return this.bot.addUserInChat((0, Generic_1.getChat)(chat), (0, Generic_1.getUser)(user));
    }
    removeUserInChat(chat, user) {
        return this.bot.removeUserInChat((0, Generic_1.getChat)(chat), (0, Generic_1.getUser)(user));
    }
    promoteUserInChat(chat, user) {
        return this.bot.promoteUserInChat((0, Generic_1.getChat)(chat), (0, Generic_1.getUser)(user));
    }
    demoteUserInChat(chat, user) {
        return this.bot.demoteUserInChat((0, Generic_1.getChat)(chat), (0, Generic_1.getUser)(user));
    }
    createChat(chat) {
        return this.bot.createChat((0, Generic_1.getChat)(chat));
    }
    leaveChat(chat) {
        return this.bot.leaveChat((0, Generic_1.getChat)(chat));
    }
    getChatAdmins(chat) {
        return __awaiter(this, void 0, void 0, function* () {
            const admins = yield this.bot.getChatAdmins((0, Generic_1.getChat)(chat));
            const adminModules = {};
            Object.keys(admins).forEach((id) => {
                adminModules[id] = (0, Generic_1.UserClient)(this, admins[id]);
            });
            return adminModules;
        });
    }
    getChatLeader(chat) {
        return __awaiter(this, void 0, void 0, function* () {
            const leader = yield this.bot.getChatLeader((0, Generic_1.getChat)(chat));
            return (0, Generic_1.UserClient)(this, leader);
        });
    }
    //! <==============================> USER <==============================>
    getUser(user) {
        return __awaiter(this, void 0, void 0, function* () {
            const usr = yield this.bot.getUser((0, Generic_1.getUser)(user));
            if (usr)
                return (0, Generic_1.UserClient)(this, usr);
            return null;
        });
    }
    setUser(user) {
        return this.bot.setUser((0, Generic_1.UserClient)(this, (0, Generic_1.getUser)(user)));
    }
    getUsers() {
        return __awaiter(this, void 0, void 0, function* () {
            const modules = {};
            const users = yield this.bot.getUsers();
            for (const id in users) {
                modules[id] = (0, Generic_1.UserClient)(this, users[id]);
            }
            return modules;
        });
    }
    setUsers(users) {
        return this.bot.setUsers(users);
    }
    addUser(user) {
        return this.bot.addUser((0, Generic_1.UserClient)(this, (0, Generic_1.getUser)(user)));
    }
    removeUser(user) {
        return this.bot.removeUser((0, Generic_1.getUser)(user));
    }
    getUserName(user) {
        if ((0, Generic_1.getUserId)(user) == this.id)
            return this.getBotName();
        return this.bot.getUserName((0, Generic_1.getUser)(user));
    }
    setUserName(user, name) {
        if ((0, Generic_1.getUserId)(user) == this.id)
            return this.setBotName(name);
        return this.bot.setUserName((0, Generic_1.getUser)(user), name);
    }
    getUserDescription(user) {
        if ((0, Generic_1.getUserId)(user) == this.id)
            return this.getBotDescription();
        return this.bot.getUserDescription((0, Generic_1.getUser)(user));
    }
    setUserDescription(user, description) {
        if ((0, Generic_1.getUserId)(user) == this.id)
            return this.setBotDescription(description);
        return this.bot.setUserDescription((0, Generic_1.getUser)(user), description);
    }
    getUserProfile(user) {
        if ((0, Generic_1.getUserId)(user) == this.id)
            return this.getBotProfile();
        return this.bot.getUserProfile((0, Generic_1.getUser)(user));
    }
    setUserProfile(user, profile) {
        if ((0, Generic_1.getUserId)(user) == this.id)
            return this.setBotProfile(profile);
        return this.bot.setUserProfile((0, Generic_1.getUser)(user), profile);
    }
    unblockUser(user) {
        return this.bot.unblockUser((0, Generic_1.getUser)(user));
    }
    blockUser(user) {
        return this.bot.blockUser((0, Generic_1.getUser)(user));
    }
}
exports.default = Client;
//# sourceMappingURL=Client.js.map