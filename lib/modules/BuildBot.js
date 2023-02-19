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
exports.BuildBot = void 0;
const ConnectionConfig_1 = require("../config/ConnectionConfig");
const LocationMessage_1 = __importDefault(require("../messages/LocationMessage"));
const ContactMessage_1 = __importDefault(require("../messages/ContactMessage"));
const ButtonMessage_1 = __importDefault(require("../messages/ButtonMessage"));
const MediaMessage_1 = __importDefault(require("../messages/MediaMessage"));
const VideoMessage_1 = __importDefault(require("../messages/VideoMessage"));
const ImageMessage_1 = __importDefault(require("../messages/ImageMessage"));
const ListMessage_1 = __importDefault(require("../messages/ListMessage"));
const Message_1 = __importDefault(require("../messages/Message"));
const Command_1 = __importDefault(require("./Command"));
const User_1 = __importDefault(require("./User"));
const Chat_1 = __importDefault(require("./Chat"));
const User_2 = __importDefault(require("./User"));
const PromiseMessages_1 = __importDefault(require("../utils/PromiseMessages"));
const bot_1 = require("../utils/bot");
const error_1 = require("../utils/error");
const sleep_1 = __importDefault(require("../utils/sleep"));
function BuildBot(bot, config) {
    const autoMessages = {};
    const promiseMessages = new PromiseMessages_1.default();
    const botModule = Object.assign(Object.assign({}, bot), { autoMessages,
        promiseMessages,
        //? ****** ***** CONFIG ***** ******
        configurate() {
            this.config = config || ConnectionConfig_1.DefaultConnectionConfig;
            this.configEvents();
        },
        configEvents() {
            this.ev.on("message", (message) => {
                var _a, _b;
                try {
                    if (this.promiseMessages.resolvePromiseMessages(message))
                        return;
                    if (message.fromMe && this.config.disableAutoCommand)
                        return;
                    if (this.config.disableAutoCommand)
                        return;
                    (_b = (_a = this.config.commandConfig) === null || _a === void 0 ? void 0 : _a.get(message.text, this.commands)) === null || _b === void 0 ? void 0 : _b.execute(message);
                }
                catch (err) {
                    this.ev.emit("error", (0, error_1.getError)(err));
                }
            });
            this.ev.on("me", (message) => {
                var _a;
                try {
                    if (this.promiseMessages.resolvePromiseMessages(message))
                        return;
                    if (this.config.disableAutoCommand || this.config.receiveAllMessages)
                        return;
                    (_a = this.getCommand(message.text)) === null || _a === void 0 ? void 0 : _a.execute(message);
                }
                catch (err) {
                    this.ev.emit("error", (0, error_1.getError)(err));
                }
            });
        },
        //? ******* **** MESSAGE **** *******
        readMessage(message) {
            return __awaiter(this, void 0, void 0, function* () {
                return bot.readMessage(message);
            });
        },
        send(message) {
            return __awaiter(this, void 0, void 0, function* () {
                try {
                    return Message_1.default.Inject(this, yield bot.send(message));
                }
                catch (err) {
                    this.ev.emit("error", (0, error_1.getError)(err));
                }
                return Message_1.default.Inject(this, message);
            });
        },
        awaitMessage(chat, ignoreMessageFromMe = true, stopRead = true, ...ignoreMessages) {
            return this.promiseMessages.addPromiseMessage(Chat_1.default.getChatId(chat), ignoreMessageFromMe, stopRead, ...ignoreMessages);
        },
        addAutomate(message, timeout, chats, id = String(Date.now())) {
            return __awaiter(this, void 0, void 0, function* () {
                try {
                    const now = Date.now();
                    // Criar e atualizar dados da mensagem automatizada
                    this.autoMessages[id] = { id, chats: chats || (yield this.getChats()), updatedAt: now, message };
                    // Aguarda o tempo definido
                    yield (0, sleep_1.default)(timeout - now);
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
                    this.ev.emit("error", (0, error_1.getError)(err));
                }
            });
        },
        //? ****** **** COMMANDS **** ******
        setCommands(commands) {
            for (const cmd of commands) {
                this.commands[cmd.tags.join(" ")] = cmd;
            }
        },
        getCommands() {
            return this.commands;
        },
        setCommand(command) {
            this.commands[command.tags.join(" ")] = command;
        },
        getCommand(command, ...args) {
            var _a;
            const cmd = (_a = this.config.commandConfig) === null || _a === void 0 ? void 0 : _a.get(command, this.commands);
            if (!cmd)
                return null;
            (0, bot_1.setBotProperty)(this, cmd);
            return cmd;
        },
        //? *************** CHAT **************
        getChatName(chat) {
            return bot.getChatName(Chat_1.default.getChat(chat));
        },
        getChatDescription(chat) {
            return bot.getChatDescription(Chat_1.default.getChat(chat));
        },
        getChatProfile(chat) {
            return bot.getChatProfile(Chat_1.default.getChat(chat));
        },
        setChatName(chat, name) {
            return bot.setChatName(Chat_1.default.getChat(chat), name);
        },
        setChatDescription(chat, description) {
            return bot.setChatDescription(Chat_1.default.getChat(chat), description);
        },
        setChatProfile(chat, profile) {
            return bot.setChatProfile(Chat_1.default.getChat(chat), profile);
        },
        addUserInChat(chat, user) {
            return bot.addUserInChat(Chat_1.default.getChat(chat), User_2.default.getUser(user));
        },
        removeUserInChat(chat, user) {
            return bot.removeUserInChat(Chat_1.default.getChat(chat), User_2.default.getUser(user));
        },
        promoteUserInChat(chat, user) {
            return bot.promoteUserInChat(Chat_1.default.getChat(chat), User_2.default.getUser(user));
        },
        demoteUserInChat(chat, user) {
            return bot.demoteUserInChat(Chat_1.default.getChat(chat), User_2.default.getUser(user));
        },
        leaveChat(chat) {
            return bot.leaveChat(Chat_1.default.getChat(chat));
        },
        getChat(chat) {
            return __awaiter(this, void 0, void 0, function* () {
                const chatInterface = yield bot.getChat(Chat_1.default.getChat(chat));
                if (!chatInterface)
                    return null;
                return Chat_1.default.Inject(this, chatInterface);
            });
        },
        getChatAdmins(chat) {
            return __awaiter(this, void 0, void 0, function* () {
                const admins = yield bot.getChatAdmins(Chat_1.default.getChat(chat));
                const adminModules = {};
                Object.keys(admins).forEach((id) => {
                    adminModules[id] = User_2.default.Inject(this, admins[id]);
                });
                return adminModules;
            });
        },
        getChatLeader(chat) {
            return __awaiter(this, void 0, void 0, function* () {
                const leader = yield bot.getChatLeader(Chat_1.default.getChat(chat));
                return User_2.default.Inject(this, leader);
            });
        },
        getChats() {
            return __awaiter(this, void 0, void 0, function* () {
                const modules = {};
                const chats = yield bot.getChats();
                for (const id in chats) {
                    modules[id] = Chat_1.default.Inject(this, chats[id]);
                }
                return modules;
            });
        },
        //? *************** USER **************
        getUser(user) {
            return __awaiter(this, void 0, void 0, function* () {
                const usr = yield bot.getUser(User_2.default.getUser(user));
                if (usr)
                    return User_1.default.Inject(this, usr);
                return null;
            });
        },
        removeUser(user) {
            return bot.removeUser(User_2.default.getUser(user));
        },
        getUserName(user) {
            const userId = User_2.default.getUserId(user);
            if (userId == this.id)
                return this.getBotName();
            return bot.getUserName(User_2.default.getUser(user));
        },
        setUserName(user, name) {
            const userId = User_2.default.getUserId(user);
            if (userId == this.id)
                return this.setBotName(name);
            return bot.setUserName(User_2.default.getUser(user), name);
        },
        getUserDescription(user) {
            const userId = User_2.default.getUserId(user);
            if (userId == this.id)
                return this.getBotDescription();
            return bot.getUserDescription(User_2.default.getUser(user));
        },
        setUserDescription(user, description) {
            const userId = User_2.default.getUserId(user);
            if (userId == this.id)
                return this.setBotDescription(description);
            return bot.setUserDescription(User_2.default.getUser(user), description);
        },
        getUserProfile(user) {
            const userId = User_2.default.getUserId(user);
            if (userId == this.id)
                return this.getBotProfile();
            return bot.getUserProfile(User_2.default.getUser(user));
        },
        setUserProfile(user, profile) {
            const userId = User_2.default.getUserId(user);
            if (userId == this.id)
                return this.setBotProfile(profile);
            return bot.setUserProfile(User_2.default.getUser(user), profile);
        },
        unblockUser(user) {
            return bot.unblockUser(User_2.default.getUser(user));
        },
        blockUser(user) {
            return bot.blockUser(User_2.default.getUser(user));
        },
        getUsers() {
            return __awaiter(this, void 0, void 0, function* () {
                const modules = {};
                const users = yield bot.getUsers();
                for (const id in users) {
                    modules[id] = User_2.default.Inject(this, users[id]);
                }
                return modules;
            });
        },
        //? ************** MODELS **************
        Chat(chat) {
            return Chat_1.default.Inject(this, bot.Chat(Chat_1.default.getChat(chat)));
        },
        User(user) {
            return User_2.default.Inject(this, bot.User(User_2.default.getUser(user)));
        },
        Command() {
            const command = new Command_1.default();
            (0, bot_1.setBotProperty)(this, command);
            return command;
        },
        //? ************** MESSAGE *************
        Message(chat, text) {
            const message = Message_1.default.Inject(this, bot.Message(Chat_1.default.getChat(chat), text));
            message.chat = Chat_1.default.Inject(this, Chat_1.default.getChat(chat));
            return message;
        },
        MediaMessage(chat, text, file) {
            const message = MediaMessage_1.default.Inject(this, bot.MediaMessage(Chat_1.default.getChat(chat), text, file));
            message.chat = Chat_1.default.Inject(this, Chat_1.default.getChat(chat));
            return message;
        },
        ImageMessage(chat, text, image) {
            const message = ImageMessage_1.default.Inject(this, bot.ImageMessage(Chat_1.default.getChat(chat), text, image));
            message.chat = Chat_1.default.Inject(this, Chat_1.default.getChat(chat));
            return message;
        },
        VideoMessage(chat, text, video) {
            const message = VideoMessage_1.default.Inject(this, bot.VideoMessage(Chat_1.default.getChat(chat), text, video));
            message.chat = Chat_1.default.Inject(this, Chat_1.default.getChat(chat));
            return message;
        },
        ContactMessage(chat, text, contact) {
            const message = ContactMessage_1.default.Inject(this, bot.ContactMessage(Chat_1.default.getChat(chat), text, contact));
            message.chat = Chat_1.default.Inject(this, Chat_1.default.getChat(chat));
            return message;
        },
        LocationMessage(chat, latitude, longitude) {
            const message = LocationMessage_1.default.Inject(this, bot.LocationMessage(Chat_1.default.getChat(chat), longitude, latitude));
            message.chat = Chat_1.default.Inject(this, Chat_1.default.getChat(chat));
            return message;
        },
        ListMessage(chat, text, button) {
            const message = ListMessage_1.default.Inject(this, bot.ListMessage(Chat_1.default.getChat(chat), text, button));
            message.chat = Chat_1.default.Inject(this, Chat_1.default.getChat(chat));
            return message;
        },
        ButtonMessage(chat, text) {
            const message = ButtonMessage_1.default.Inject(this, bot.ButtonMessage(Chat_1.default.getChat(chat), text));
            message.chat = Chat_1.default.Inject(this, Chat_1.default.getChat(chat));
            return message;
        } });
    return botModule;
}
exports.BuildBot = BuildBot;
//# sourceMappingURL=BuildBot.js.map