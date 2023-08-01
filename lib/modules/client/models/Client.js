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
const rompot_base_1 = require("rompot-base");
const fs_1 = require("fs");
const Defaults_1 = require("../../../config/Defaults");
const ReactionMessage_1 = __importDefault(require("../../../messages/ReactionMessage"));
const Message_1 = __importDefault(require("../../../messages/Message"));
const ClientEvents_1 = __importDefault(require("../../client/events/ClientEvents"));
const ClientUtils_1 = __importDefault(require("../../client/utils/ClientUtils"));
const command_1 = require("../../command");
const chat_1 = require("../../chat");
const user_1 = require("../../user");
const PromiseMessages_1 = __importDefault(require("../../../utils/PromiseMessages"));
const Generic_1 = require("../../../utils/Generic");
const MessageUtils_1 = __importDefault(require("../../../utils/MessageUtils"));
const Verify_1 = require("../../../utils/Verify");
class Client extends ClientEvents_1.default {
    constructor(bot, config = {}) {
        super();
        //! =================================================================
        //! ========== CONFIGURAÇÃO
        //! =================================================================
        this.promiseMessages = new PromiseMessages_1.default();
        this.autoMessages = {};
        this.commandController = new command_1.CommandController();
        this.reconnectTimes = 0;
        this.bot = bot;
        this.config = Object.assign(Object.assign({}, Defaults_1.DEFAULT_CONNECTION_CONFIG), config);
        this.configEvents();
    }
    get id() {
        return this.bot.id;
    }
    set id(id) {
        this.bot.id = id;
    }
    get status() {
        return this.bot.status;
    }
    set status(status) {
        this.bot.status = status;
    }
    //! =================================================================
    //! ========== CONFIGURAÇÃO DOS EVENTOS
    //! =================================================================
    configEvents() {
        this.bot.ev.on("message", (message) => __awaiter(this, void 0, void 0, function* () {
            try {
                if (!message.fromMe && !this.config.disableAutoRead)
                    yield this.readMessage(message);
                if (this.promiseMessages.resolvePromiseMessages(message))
                    return;
                message = MessageUtils_1.default.applyClient(this, message);
                this.emit("message", message);
                if (this.config.disableAutoCommand || message.apiSend)
                    return;
                const command = this.searchCommand(message.text);
                if (command != null) {
                    this.runCommand(command, message, rompot_base_1.CMDRunType.Exec);
                }
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
                    chat: chat_1.ChatUtils.applyClient(this, update.chat),
                    user: user_1.UserUtils.applyClient(this, update.user),
                    fromUser: user_1.UserUtils.applyClient(this, update.fromUser),
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
    //! =================================================================
    //! ========== CONEXÃO
    //! =================================================================
    connect(auth) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.bot.connect(auth);
            ClientUtils_1.default.setClient(this);
        });
    }
    connectByCode(phoneNumber, auth) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.bot.connectByCode(String(phoneNumber).replace(/\D+/g, ""), auth);
        });
    }
    reconnect(alert) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.bot.reconnect(alert);
            ClientUtils_1.default.setClient(this);
        });
    }
    stop(reason) {
        return this.bot.stop(reason);
    }
    //! =================================================================
    //! ========== COMANDO
    //! =================================================================
    getCommandController() {
        if (this.commandController.clientId != this.id) {
            this.commandController.clientId = this.id;
        }
        return this.commandController;
    }
    setCommandController(controller) {
        controller.clientId = this.id;
        this.commandController = controller;
    }
    setCommands(commands) {
        this.commandController.setCommands(commands);
    }
    getCommands() {
        return this.commandController.getCommands();
    }
    addCommand(command) {
        this.commandController.addCommand(command);
    }
    removeCommand(command) {
        return this.commandController.removeCommand(command);
    }
    searchCommand(text) {
        const command = this.commandController.searchCommand(text);
        if (command == null)
            return null;
        command.client = this;
        return command;
    }
    runCommand(command, message, type) {
        return this.commandController.runCommand(command, message, type);
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
    editMessage(message, text) {
        message.text = text;
        message.isEdited = true;
        return this.bot.editMessage(message);
    }
    addReaction(message, reaction) {
        return this.bot.addReaction(new ReactionMessage_1.default(message.chat, reaction, message));
    }
    removeReaction(message) {
        return this.bot.removeReaction(new ReactionMessage_1.default(message.chat, "", message));
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
    send(message) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!this.config.disableAutoTyping) {
                    yield this.changeChatStatus(message.chat, "typing");
                }
                return MessageUtils_1.default.applyClient(this, yield this.bot.send(message));
            }
            catch (err) {
                this.emit("error", (0, Generic_1.getError)(err));
            }
            return MessageUtils_1.default.applyClient(this, message);
        });
    }
    sendMessage(chat, message, mention) {
        return __awaiter(this, void 0, void 0, function* () {
            if ((0, Verify_1.isMessage)(message)) {
                message.chat = chat_1.ChatUtils.get(chat);
                message.mention = mention;
                return yield this.send(message);
            }
            return yield this.send(new Message_1.default(chat, message, { mention }));
        });
    }
    awaitMessage(chat, config = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            return MessageUtils_1.default.applyClient(this, yield this.promiseMessages.addPromiseMessage(chat_1.ChatUtils.getId(chat), config));
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
            const iChat = yield this.bot.getChat(chat_1.ChatUtils.get(chat));
            if (!iChat)
                return null;
            return chat_1.ChatUtils.applyClient(this, chat_1.ChatUtils.get(chat));
        });
    }
    setChat(chat) {
        return this.bot.setChat(chat_1.ChatUtils.applyClient(this, chat));
    }
    getChats() {
        return __awaiter(this, void 0, void 0, function* () {
            const modules = {};
            const chats = yield this.bot.getChats();
            for (const id in chats) {
                modules[id] = chat_1.ChatUtils.applyClient(this, chats[id]);
            }
            return modules;
        });
    }
    setChats(chats) {
        return this.bot.setChats(chats);
    }
    addChat(chat) {
        return this.bot.addChat(chat_1.ChatUtils.applyClient(this, chat_1.ChatUtils.get(chat)));
    }
    removeChat(chat) {
        return this.bot.removeChat(chat_1.ChatUtils.applyClient(this, chat_1.ChatUtils.get(chat)));
    }
    getChatName(chat) {
        return this.bot.getChatName(chat_1.ChatUtils.get(chat));
    }
    setChatName(chat, name) {
        return this.bot.setChatName(chat_1.ChatUtils.get(chat), name);
    }
    getChatDescription(chat) {
        return this.bot.getChatDescription(chat_1.ChatUtils.get(chat));
    }
    setChatDescription(chat, description) {
        return this.bot.setChatDescription(chat_1.ChatUtils.get(chat), description);
    }
    getChatProfile(chat) {
        return this.bot.getChatProfile(chat_1.ChatUtils.get(chat));
    }
    setChatProfile(chat, profile) {
        return this.bot.setChatProfile(chat_1.ChatUtils.get(chat), profile);
    }
    changeChatStatus(chat, status) {
        return this.bot.changeChatStatus(chat_1.ChatUtils.get(chat), status);
    }
    addUserInChat(chat, user) {
        return this.bot.addUserInChat(chat_1.ChatUtils.get(chat), user_1.UserUtils.get(user));
    }
    removeUserInChat(chat, user) {
        return this.bot.removeUserInChat(chat_1.ChatUtils.get(chat), user_1.UserUtils.get(user));
    }
    promoteUserInChat(chat, user) {
        return this.bot.promoteUserInChat(chat_1.ChatUtils.get(chat), user_1.UserUtils.get(user));
    }
    demoteUserInChat(chat, user) {
        return this.bot.demoteUserInChat(chat_1.ChatUtils.get(chat), user_1.UserUtils.get(user));
    }
    createChat(chat) {
        return this.bot.createChat(chat_1.ChatUtils.get(chat));
    }
    leaveChat(chat) {
        return this.bot.leaveChat(chat_1.ChatUtils.get(chat));
    }
    getChatUsers(chat) {
        return __awaiter(this, void 0, void 0, function* () {
            const users = yield this.bot.getChatUsers(chat_1.ChatUtils.get(chat));
            const usersModules = {};
            Object.keys(users).forEach((id) => {
                usersModules[id] = user_1.UserUtils.applyClient(this, users[id]);
            });
            return usersModules;
        });
    }
    getChatAdmins(chat) {
        return __awaiter(this, void 0, void 0, function* () {
            const admins = yield this.bot.getChatAdmins(chat_1.ChatUtils.get(chat));
            const adminModules = {};
            Object.keys(admins).forEach((id) => {
                adminModules[id] = user_1.UserUtils.applyClient(this, admins[id]);
            });
            return adminModules;
        });
    }
    getChatLeader(chat) {
        return __awaiter(this, void 0, void 0, function* () {
            const leader = yield this.bot.getChatLeader(chat_1.ChatUtils.get(chat));
            return user_1.UserUtils.applyClient(this, leader);
        });
    }
    //! <==============================> USER <==============================>
    getUser(user) {
        return __awaiter(this, void 0, void 0, function* () {
            const usr = yield this.bot.getUser(user_1.UserUtils.get(user));
            if (usr)
                return user_1.UserUtils.applyClient(this, usr);
            return null;
        });
    }
    setUser(user) {
        return this.bot.setUser(user_1.UserUtils.applyClient(this, user_1.UserUtils.get(user)));
    }
    getUsers() {
        return __awaiter(this, void 0, void 0, function* () {
            const modules = {};
            const users = yield this.bot.getUsers();
            for (const id in users) {
                modules[id] = user_1.UserUtils.applyClient(this, users[id]);
            }
            return modules;
        });
    }
    setUsers(users) {
        return this.bot.setUsers(users);
    }
    addUser(user) {
        return this.bot.addUser(user_1.UserUtils.applyClient(this, user_1.UserUtils.get(user)));
    }
    removeUser(user) {
        return this.bot.removeUser(user_1.UserUtils.get(user));
    }
    getUserName(user) {
        if (user_1.UserUtils.getId(user) == this.id)
            return this.getBotName();
        return this.bot.getUserName(user_1.UserUtils.get(user));
    }
    setUserName(user, name) {
        if (user_1.UserUtils.getId(user) == this.id)
            return this.setBotName(name);
        return this.bot.setUserName(user_1.UserUtils.get(user), name);
    }
    getUserDescription(user) {
        if (user_1.UserUtils.getId(user) == this.id)
            return this.getBotDescription();
        return this.bot.getUserDescription(user_1.UserUtils.get(user));
    }
    setUserDescription(user, description) {
        if (user_1.UserUtils.getId(user) == this.id)
            return this.setBotDescription(description);
        return this.bot.setUserDescription(user_1.UserUtils.get(user), description);
    }
    getUserProfile(user) {
        if (user_1.UserUtils.getId(user) == this.id)
            return this.getBotProfile();
        return this.bot.getUserProfile(user_1.UserUtils.get(user));
    }
    setUserProfile(user, profile) {
        if (user_1.UserUtils.getId(user) == this.id)
            return this.setBotProfile(profile);
        return this.bot.setUserProfile(user_1.UserUtils.get(user), profile);
    }
    unblockUser(user) {
        return this.bot.unblockUser(user_1.UserUtils.get(user));
    }
    blockUser(user) {
        return this.bot.blockUser(user_1.UserUtils.get(user));
    }
}
exports.default = Client;
//# sourceMappingURL=Client.js.map