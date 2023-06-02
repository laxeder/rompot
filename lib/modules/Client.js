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
const fs_1 = require("fs");
const ConnectionConfig_1 = require("../config/ConnectionConfig");
const CommandConfig_1 = require("../config/CommandConfig");
const Command_1 = __importDefault(require("./Command"));
const User_1 = __importDefault(require("./User"));
const Chat_1 = __importDefault(require("./Chat"));
const Generic_1 = require("../utils/Generic");
const PromiseMessages_1 = __importDefault(require("../utils/PromiseMessages"));
const Emmiter_1 = require("../utils/Emmiter");
class Client extends Emmiter_1.ClientEvents {
    constructor(bot, config = ConnectionConfig_1.DefaultConnectionConfig, commands = []) {
        super();
        this.promiseMessages = new PromiseMessages_1.default();
        this.autoMessages = {};
        this.reconnectTimes = 0;
        this.bot = bot;
        this.setCommands(commands);
        this.config = {
            commandConfig: config.commandConfig || CommandConfig_1.DefaultCommandConfig,
            disableAutoCommand: !!config.disableAutoCommand,
            disableAutoTyping: !!config.disableAutoTyping,
            disableAutoRead: !!config.disableAutoRead,
            maxReconnectTimes: config.maxReconnectTimes || ConnectionConfig_1.DefaultConnectionConfig.maxReconnectTimes,
            reconnectTimeout: config.reconnectTimeout || ConnectionConfig_1.DefaultConnectionConfig.reconnectTimeout,
        };
        this.configEvents();
    }
    get id() {
        return this.bot.id;
    }
    get status() {
        return this.bot.status;
    }
    configEvents() {
        this.bot.ev.on("message", (message) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                if (!message.fromMe && !this.config.disableAutoRead)
                    yield this.readMessage(message);
                if (this.promiseMessages.resolvePromiseMessages(message))
                    return;
                this.emit("message", (0, Generic_1.ApplyClient)(message, this));
                if (this.config.disableAutoCommand)
                    return;
                (_a = this.getCommand(message.text)) === null || _a === void 0 ? void 0 : _a.execute((0, Generic_1.ApplyClient)(message, this));
            }
            catch (err) {
                this.emit("error", (0, Generic_1.getError)(err));
            }
        }));
        this.bot.ev.on("conn", (update) => {
            try {
                this.emit("conn", update);
            }
            catch (err) {
                this.emit("error", (0, Generic_1.getError)(err));
            }
        });
        this.bot.ev.on("open", (update) => {
            try {
                this.reconnectTimes = 0;
                this.emit("open", update);
            }
            catch (err) {
                this.emit("error", (0, Generic_1.getError)(err));
            }
        });
        this.bot.ev.on("reconnecting", (update) => {
            try {
                this.emit("reconnecting", update);
            }
            catch (err) {
                this.emit("error", (0, Generic_1.getError)(err));
            }
        });
        this.bot.ev.on("connecting", (update) => {
            try {
                this.emit("connecting", update);
            }
            catch (err) {
                this.emit("error", (0, Generic_1.getError)(err));
            }
        });
        this.bot.ev.on("close", (update) => __awaiter(this, void 0, void 0, function* () {
            try {
                this.emit("close", update);
                if (this.reconnectTimes < this.config.maxReconnectTimes) {
                    this.reconnectTimes++;
                    yield (0, Generic_1.sleep)(this.config.reconnectTimeout);
                    this.reconnect();
                }
            }
            catch (err) {
                this.emit("error", (0, Generic_1.getError)(err));
            }
        }));
        this.bot.ev.on("stop", (update) => __awaiter(this, void 0, void 0, function* () {
            try {
                this.emit("stop", update);
            }
            catch (err) {
                this.emit("error", (0, Generic_1.getError)(err));
            }
        }));
        this.bot.ev.on("qr", (qr) => {
            try {
                this.emit("qr", qr);
            }
            catch (err) {
                this.emit("error", (0, Generic_1.getError)(err));
            }
        });
        this.bot.ev.on("user", (update) => {
            try {
                this.emit("user", {
                    event: update.event,
                    action: update.action,
                    chat: Chat_1.default.Client(this, update.chat),
                    user: User_1.default.Client(this, update.user),
                    fromUser: User_1.default.Client(this, update.fromUser),
                });
            }
            catch (err) {
                this.emit("error", (0, Generic_1.getError)(err));
            }
        });
        this.bot.ev.on("error", (err) => {
            try {
                this.emit("error", (0, Generic_1.getError)(err));
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
        const cmds = [];
        for (const cmd of commands) {
            cmd.client = this;
            cmds.push(cmd);
        }
        this.commands = cmds;
    }
    getCommands() {
        return this.commands;
    }
    addCommand(command) {
        command.client = this;
        this.commands.push(command);
    }
    removeCommand(command) {
        const cmds = [];
        for (const cmd of this.commands) {
            if (!!cmd.id || cmd.id == command.id)
                continue;
            if (!!cmd.tags || cmd.tags == command.tags)
                continue;
            if (!!cmd.name || cmd.name == command.name)
                continue;
            if (cmd === command)
                continue;
            cmds.push(cmd);
        }
        this.commands = cmds;
    }
    getCommand(command) {
        if (command instanceof Command_1.default) {
            let cmd = command;
            for (const c of this.commands) {
                if (!!c.tags || c.tags == cmd.tags || !!c.name || c.name == cmd.name || !!c.id || c.id == cmd.id || c == cmd) {
                    cmd = c;
                    break;
                }
            }
            cmd.client = this;
            return cmd;
        }
        const cmd = this.config.commandConfig.get(command, this.commands);
        if (!cmd)
            return null;
        return cmd;
    }
    //! <============================> MESSAGES <============================>
    deleteMessage(message) {
        return this.bot.removeMessage(message);
    }
    removeMessage(message) {
        return this.bot.removeMessage(message);
    }
    addReaction(message, reaction) {
        return this.bot.addReaction(message, reaction);
    }
    removeReaction(message) {
        return this.bot.removeReaction(message);
    }
    addAnimatedReaction(message, reactions, interval = 2000, maxTimeout = 60000) {
        var isStoped = false;
        const now = Date.now();
        const stop = (reactionStop) => __awaiter(this, void 0, void 0, function* () {
            if (isStoped)
                return;
            isStoped = true;
            if (!!!reactionStop) {
                yield this.removeReaction(message);
            }
            else {
                yield this.addReaction(message, reactionStop);
            }
        });
        const addReaction = (index) => __awaiter(this, void 0, void 0, function* () {
            if (isStoped || now + maxTimeout < Date.now()) {
                return stop();
            }
            if (reactions[index]) {
                yield this.addReaction(message, reactions[index]);
            }
            yield (0, Generic_1.sleep)(interval);
            addReaction(index + 1 >= reactions.length ? 0 : index + 1);
        });
        addReaction(0);
        return stop;
    }
    readMessage(message) {
        return this.bot.readMessage(message);
    }
    send(message) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!this.config.disableAutoTyping) {
                    yield this.changeChatStatus(message.chat, "typing");
                }
                return (0, Generic_1.ApplyClient)(yield this.bot.send(message), this);
            }
            catch (err) {
                this.emit("error", (0, Generic_1.getError)(err));
            }
            return (0, Generic_1.ApplyClient)(message, this);
        });
    }
    awaitMessage(chat, ignoreMessageFromMe = true, stopRead = true, ...ignoreMessages) {
        return __awaiter(this, void 0, void 0, function* () {
            return (0, Generic_1.ApplyClient)(yield this.promiseMessages.addPromiseMessage(Chat_1.default.getId(chat), ignoreMessageFromMe, stopRead, ...ignoreMessages), this);
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
    /**
     * * Retorna a stream da mídia
     * @param message Mídia que será baixada
     * @returns Stream da mídia
     */
    downloadStreamMessage(message) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!!!message.file)
                return Buffer.from("");
            if (Buffer.isBuffer(message.file))
                return message.file;
            if (typeof message.file == "string") {
                return (0, fs_1.readFileSync)(message.file);
            }
            return this.bot.downloadStreamMessage(message.file);
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
            const iChat = yield this.bot.getChat(Chat_1.default.get(chat));
            if (!iChat)
                return null;
            return Chat_1.default.Client(this, Chat_1.default.get(chat));
        });
    }
    setChat(chat) {
        return this.bot.setChat(Chat_1.default.Client(this, chat));
    }
    getChats() {
        return __awaiter(this, void 0, void 0, function* () {
            const modules = {};
            const chats = yield this.bot.getChats();
            for (const id in chats) {
                modules[id] = Chat_1.default.Client(this, chats[id]);
            }
            return modules;
        });
    }
    setChats(chats) {
        return this.bot.setChats(chats);
    }
    addChat(chat) {
        return this.bot.addChat(Chat_1.default.Client(this, Chat_1.default.get(chat)));
    }
    removeChat(chat) {
        return this.bot.removeChat(Chat_1.default.Client(this, Chat_1.default.get(chat)));
    }
    getChatName(chat) {
        return this.bot.getChatName(Chat_1.default.get(chat));
    }
    setChatName(chat, name) {
        return this.bot.setChatName(Chat_1.default.get(chat), name);
    }
    getChatDescription(chat) {
        return this.bot.getChatDescription(Chat_1.default.get(chat));
    }
    setChatDescription(chat, description) {
        return this.bot.setChatDescription(Chat_1.default.get(chat), description);
    }
    getChatProfile(chat) {
        return this.bot.getChatProfile(Chat_1.default.get(chat));
    }
    setChatProfile(chat, profile) {
        return this.bot.setChatProfile(Chat_1.default.get(chat), profile);
    }
    changeChatStatus(chat, status) {
        return this.bot.changeChatStatus(Chat_1.default.get(chat), status);
    }
    addUserInChat(chat, user) {
        return this.bot.addUserInChat(Chat_1.default.get(chat), User_1.default.get(user));
    }
    removeUserInChat(chat, user) {
        return this.bot.removeUserInChat(Chat_1.default.get(chat), User_1.default.get(user));
    }
    promoteUserInChat(chat, user) {
        return this.bot.promoteUserInChat(Chat_1.default.get(chat), User_1.default.get(user));
    }
    demoteUserInChat(chat, user) {
        return this.bot.demoteUserInChat(Chat_1.default.get(chat), User_1.default.get(user));
    }
    createChat(chat) {
        return this.bot.createChat(Chat_1.default.get(chat));
    }
    leaveChat(chat) {
        return this.bot.leaveChat(Chat_1.default.get(chat));
    }
    getChatUsers(chat) {
        return __awaiter(this, void 0, void 0, function* () {
            const users = yield this.bot.getChatUsers(Chat_1.default.get(chat));
            const usersModules = {};
            Object.keys(users).forEach((id) => {
                usersModules[id] = User_1.default.Client(this, users[id]);
            });
            return usersModules;
        });
    }
    getChatAdmins(chat) {
        return __awaiter(this, void 0, void 0, function* () {
            const admins = yield this.bot.getChatAdmins(Chat_1.default.get(chat));
            const adminModules = {};
            Object.keys(admins).forEach((id) => {
                adminModules[id] = User_1.default.Client(this, admins[id]);
            });
            return adminModules;
        });
    }
    getChatLeader(chat) {
        return __awaiter(this, void 0, void 0, function* () {
            const leader = yield this.bot.getChatLeader(Chat_1.default.get(chat));
            return User_1.default.Client(this, leader);
        });
    }
    //! <==============================> USER <==============================>
    getUser(user) {
        return __awaiter(this, void 0, void 0, function* () {
            const usr = yield this.bot.getUser(User_1.default.get(user));
            if (usr)
                return User_1.default.Client(this, usr);
            return null;
        });
    }
    setUser(user) {
        return this.bot.setUser(User_1.default.Client(this, User_1.default.get(user)));
    }
    getUsers() {
        return __awaiter(this, void 0, void 0, function* () {
            const modules = {};
            const users = yield this.bot.getUsers();
            for (const id in users) {
                modules[id] = User_1.default.Client(this, users[id]);
            }
            return modules;
        });
    }
    setUsers(users) {
        return this.bot.setUsers(users);
    }
    addUser(user) {
        return this.bot.addUser(User_1.default.Client(this, User_1.default.get(user)));
    }
    removeUser(user) {
        return this.bot.removeUser(User_1.default.get(user));
    }
    getUserName(user) {
        if (User_1.default.getId(user) == this.id)
            return this.getBotName();
        return this.bot.getUserName(User_1.default.get(user));
    }
    setUserName(user, name) {
        if (User_1.default.getId(user) == this.id)
            return this.setBotName(name);
        return this.bot.setUserName(User_1.default.get(user), name);
    }
    getUserDescription(user) {
        if (User_1.default.getId(user) == this.id)
            return this.getBotDescription();
        return this.bot.getUserDescription(User_1.default.get(user));
    }
    setUserDescription(user, description) {
        if (User_1.default.getId(user) == this.id)
            return this.setBotDescription(description);
        return this.bot.setUserDescription(User_1.default.get(user), description);
    }
    getUserProfile(user) {
        if (User_1.default.getId(user) == this.id)
            return this.getBotProfile();
        return this.bot.getUserProfile(User_1.default.get(user));
    }
    setUserProfile(user, profile) {
        if (User_1.default.getId(user) == this.id)
            return this.setBotProfile(profile);
        return this.bot.setUserProfile(User_1.default.get(user), profile);
    }
    unblockUser(user) {
        return this.bot.unblockUser(User_1.default.get(user));
    }
    blockUser(user) {
        return this.bot.blockUser(User_1.default.get(user));
    }
}
exports.default = Client;
//# sourceMappingURL=Client.js.map