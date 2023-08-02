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
const CommandController_1 = __importDefault(require("../../command/controllers/CommandController"));
const ClientEvents_1 = __importDefault(require("../../client/events/ClientEvents"));
const ClientUtils_1 = __importDefault(require("../../client/utils/ClientUtils"));
const ChatUtils_1 = __importDefault(require("../../chat/utils/ChatUtils"));
const UserUtils_1 = __importDefault(require("../../user/utils/UserUtils"));
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
        this.commandController = new CommandController_1.default();
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
                    chat: ChatUtils_1.default.applyClient(this, update.chat),
                    user: UserUtils_1.default.applyClient(this, update.user),
                    fromUser: UserUtils_1.default.applyClient(this, update.fromUser),
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
                message.chat = ChatUtils_1.default.get(chat);
                message.mention = mention;
                return yield this.send(message);
            }
            return yield this.send(new Message_1.default(chat, message, { mention }));
        });
    }
    awaitMessage(chat, config = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            return MessageUtils_1.default.applyClient(this, yield this.promiseMessages.addPromiseMessage(ChatUtils_1.default.getId(chat), config));
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
            const iChat = yield this.bot.getChat(ChatUtils_1.default.get(chat));
            if (!iChat)
                return null;
            return ChatUtils_1.default.applyClient(this, ChatUtils_1.default.get(chat));
        });
    }
    setChat(chat) {
        return this.bot.setChat(ChatUtils_1.default.applyClient(this, chat));
    }
    getChats() {
        return __awaiter(this, void 0, void 0, function* () {
            const modules = {};
            const chats = yield this.bot.getChats();
            for (const id in chats) {
                modules[id] = ChatUtils_1.default.applyClient(this, chats[id]);
            }
            return modules;
        });
    }
    setChats(chats) {
        return this.bot.setChats(chats);
    }
    addChat(chat) {
        return this.bot.addChat(ChatUtils_1.default.applyClient(this, ChatUtils_1.default.get(chat)));
    }
    removeChat(chat) {
        return this.bot.removeChat(ChatUtils_1.default.applyClient(this, ChatUtils_1.default.get(chat)));
    }
    getChatName(chat) {
        return this.bot.getChatName(ChatUtils_1.default.get(chat));
    }
    setChatName(chat, name) {
        return this.bot.setChatName(ChatUtils_1.default.get(chat), name);
    }
    getChatDescription(chat) {
        return this.bot.getChatDescription(ChatUtils_1.default.get(chat));
    }
    setChatDescription(chat, description) {
        return this.bot.setChatDescription(ChatUtils_1.default.get(chat), description);
    }
    getChatProfile(chat) {
        return this.bot.getChatProfile(ChatUtils_1.default.get(chat));
    }
    setChatProfile(chat, profile) {
        return this.bot.setChatProfile(ChatUtils_1.default.get(chat), profile);
    }
    changeChatStatus(chat, status) {
        return this.bot.changeChatStatus(ChatUtils_1.default.get(chat), status);
    }
    addUserInChat(chat, user) {
        return this.bot.addUserInChat(ChatUtils_1.default.get(chat), UserUtils_1.default.get(user));
    }
    removeUserInChat(chat, user) {
        return this.bot.removeUserInChat(ChatUtils_1.default.get(chat), UserUtils_1.default.get(user));
    }
    promoteUserInChat(chat, user) {
        return this.bot.promoteUserInChat(ChatUtils_1.default.get(chat), UserUtils_1.default.get(user));
    }
    demoteUserInChat(chat, user) {
        return this.bot.demoteUserInChat(ChatUtils_1.default.get(chat), UserUtils_1.default.get(user));
    }
    createChat(chat) {
        return this.bot.createChat(ChatUtils_1.default.get(chat));
    }
    leaveChat(chat) {
        return this.bot.leaveChat(ChatUtils_1.default.get(chat));
    }
    getChatUsers(chat) {
        return __awaiter(this, void 0, void 0, function* () {
            const users = yield this.bot.getChatUsers(ChatUtils_1.default.get(chat));
            const usersModules = {};
            Object.keys(users).forEach((id) => {
                usersModules[id] = UserUtils_1.default.applyClient(this, users[id]);
            });
            return usersModules;
        });
    }
    getChatAdmins(chat) {
        return __awaiter(this, void 0, void 0, function* () {
            const admins = yield this.bot.getChatAdmins(ChatUtils_1.default.get(chat));
            const adminModules = {};
            Object.keys(admins).forEach((id) => {
                adminModules[id] = UserUtils_1.default.applyClient(this, admins[id]);
            });
            return adminModules;
        });
    }
    getChatLeader(chat) {
        return __awaiter(this, void 0, void 0, function* () {
            const leader = yield this.bot.getChatLeader(ChatUtils_1.default.get(chat));
            return UserUtils_1.default.applyClient(this, leader);
        });
    }
    //! <==============================> USER <==============================>
    getUser(user) {
        return __awaiter(this, void 0, void 0, function* () {
            const usr = yield this.bot.getUser(UserUtils_1.default.get(user));
            if (usr)
                return UserUtils_1.default.applyClient(this, usr);
            return null;
        });
    }
    setUser(user) {
        return this.bot.setUser(UserUtils_1.default.applyClient(this, UserUtils_1.default.get(user)));
    }
    getUsers() {
        return __awaiter(this, void 0, void 0, function* () {
            const modules = {};
            const users = yield this.bot.getUsers();
            for (const id in users) {
                modules[id] = UserUtils_1.default.applyClient(this, users[id]);
            }
            return modules;
        });
    }
    setUsers(users) {
        return this.bot.setUsers(users);
    }
    addUser(user) {
        return this.bot.addUser(UserUtils_1.default.applyClient(this, UserUtils_1.default.get(user)));
    }
    removeUser(user) {
        return this.bot.removeUser(UserUtils_1.default.get(user));
    }
    getUserName(user) {
        if (UserUtils_1.default.getId(user) == this.id)
            return this.getBotName();
        return this.bot.getUserName(UserUtils_1.default.get(user));
    }
    setUserName(user, name) {
        if (UserUtils_1.default.getId(user) == this.id)
            return this.setBotName(name);
        return this.bot.setUserName(UserUtils_1.default.get(user), name);
    }
    getUserDescription(user) {
        if (UserUtils_1.default.getId(user) == this.id)
            return this.getBotDescription();
        return this.bot.getUserDescription(UserUtils_1.default.get(user));
    }
    setUserDescription(user, description) {
        if (UserUtils_1.default.getId(user) == this.id)
            return this.setBotDescription(description);
        return this.bot.setUserDescription(UserUtils_1.default.get(user), description);
    }
    getUserProfile(user) {
        if (UserUtils_1.default.getId(user) == this.id)
            return this.getBotProfile();
        return this.bot.getUserProfile(UserUtils_1.default.get(user));
    }
    setUserProfile(user, profile) {
        if (UserUtils_1.default.getId(user) == this.id)
            return this.setBotProfile(profile);
        return this.bot.setUserProfile(UserUtils_1.default.get(user), profile);
    }
    unblockUser(user) {
        return this.bot.unblockUser(UserUtils_1.default.get(user));
    }
    blockUser(user) {
        return this.bot.blockUser(UserUtils_1.default.get(user));
    }
}
exports.default = Client;
//# sourceMappingURL=Client.js.map