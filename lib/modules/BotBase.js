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
const ConnectionConfig_1 = require("../config/ConnectionConfig");
const LocationMessage_1 = __importDefault(require("../messages/LocationMessage"));
const ContactMessage_1 = __importDefault(require("../messages/ContactMessage"));
const ButtonMessage_1 = __importDefault(require("../messages/ButtonMessage"));
const VideoMessage_1 = __importDefault(require("../messages/VideoMessage"));
const ImageMessage_1 = __importDefault(require("../messages/ImageMessage"));
const MediaMessage_1 = __importDefault(require("../messages/MediaMessage"));
const ListMessage_1 = __importDefault(require("../messages/ListMessage"));
const Message_1 = __importDefault(require("../messages/Message"));
const Command_1 = __importDefault(require("./Command"));
const Chat_1 = __importDefault(require("./Chat"));
const User_1 = __importDefault(require("./User"));
const PromiseMessages_1 = __importDefault(require("../utils/PromiseMessages"));
const Emmiter_1 = __importDefault(require("../utils/Emmiter"));
class BotBase {
    constructor() {
        //? ************** CONFIG **************
        this.autoMessages = {};
        this.promiseMessages = new PromiseMessages_1.default();
        this.id = "";
        this.status = "offline";
        this.ev = new Emmiter_1.default();
        this.config = ConnectionConfig_1.DefaultConnectionConfig;
        this.commands = {};
    }
    connect(auth) {
        return __awaiter(this, void 0, void 0, function* () { });
    }
    reconnect(alert) {
        return __awaiter(this, void 0, void 0, function* () { });
    }
    stop(reason) {
        return __awaiter(this, void 0, void 0, function* () { });
    }
    //? ****** ***** CONFIG ***** ******
    configurate(config = ConnectionConfig_1.DefaultConnectionConfig) {
        this.config = this.config || config;
        this.configEvents();
    }
    configEvents() { }
    //? ******* **** MESSAGE **** *******
    readMessage(message) {
        return __awaiter(this, void 0, void 0, function* () { });
    }
    send(message) {
        return __awaiter(this, void 0, void 0, function* () {
            return Message_1.default.Inject(this, message);
        });
    }
    awaitMessage(chat, ignoreMessageFromMe = true, stopRead = true, ...ignoreMessages) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.promiseMessages.addPromiseMessage(Chat_1.default.getChatId(chat), ignoreMessageFromMe, stopRead, ...ignoreMessages);
        });
    }
    addAutomate(message, timeout, chats, id = String(Date.now())) {
        return __awaiter(this, void 0, void 0, function* () { });
    }
    //? ****** **** COMMANDS **** ******
    setCommands(commands) { }
    getCommands() {
        return {};
    }
    setCommand(command) { }
    getCommand(command, ...args) {
        return null;
    }
    //? *************** CHAT **************
    addChat(chat) {
        return __awaiter(this, void 0, void 0, function* () { });
    }
    removeChat(chat) {
        return __awaiter(this, void 0, void 0, function* () { });
    }
    getChatName(chat) {
        return __awaiter(this, void 0, void 0, function* () {
            return "";
        });
    }
    getChatDescription(chat) {
        return __awaiter(this, void 0, void 0, function* () {
            return "";
        });
    }
    getChatProfile(chat) {
        return __awaiter(this, void 0, void 0, function* () {
            return Buffer.from("");
        });
    }
    setChat(chat) {
        return __awaiter(this, void 0, void 0, function* () { });
    }
    setChatName(chat, name) {
        return __awaiter(this, void 0, void 0, function* () { });
    }
    setChatDescription(chat, description) {
        return __awaiter(this, void 0, void 0, function* () { });
    }
    setChatProfile(chat, profile) {
        return __awaiter(this, void 0, void 0, function* () { });
    }
    addUserInChat(chat, user) {
        return __awaiter(this, void 0, void 0, function* () { });
    }
    removeUserInChat(chat, user) {
        return __awaiter(this, void 0, void 0, function* () { });
    }
    promoteUserInChat(chat, user) {
        return __awaiter(this, void 0, void 0, function* () { });
    }
    demoteUserInChat(chat, user) {
        return __awaiter(this, void 0, void 0, function* () { });
    }
    //TODO: Retornar chat module
    createChat(chat) {
        return __awaiter(this, void 0, void 0, function* () { });
    }
    leaveChat(chat) {
        return __awaiter(this, void 0, void 0, function* () { });
    }
    changeChatStatus(chat, status) {
        return __awaiter(this, void 0, void 0, function* () { });
    }
    getChat(chat) {
        return __awaiter(this, void 0, void 0, function* () {
            return null;
        });
    }
    setChats(chats) {
        return __awaiter(this, void 0, void 0, function* () { });
    }
    getChatAdmins(chat) {
        return __awaiter(this, void 0, void 0, function* () {
            return {};
        });
    }
    getChatLeader(chat) {
        return __awaiter(this, void 0, void 0, function* () {
            return User_1.default.Inject(this, User_1.default.getUser(""));
        });
    }
    getChats() {
        return __awaiter(this, void 0, void 0, function* () {
            return {};
        });
    }
    //? *************** USER **************
    getBotName() {
        return __awaiter(this, void 0, void 0, function* () {
            return "";
        });
    }
    setBotName(name) {
        return __awaiter(this, void 0, void 0, function* () { });
    }
    getBotDescription() {
        return __awaiter(this, void 0, void 0, function* () {
            return "";
        });
    }
    setBotDescription(description) {
        return __awaiter(this, void 0, void 0, function* () { });
    }
    getBotProfile() {
        return __awaiter(this, void 0, void 0, function* () {
            return Buffer.from("");
        });
    }
    setBotProfile(image) {
        return __awaiter(this, void 0, void 0, function* () { });
    }
    addUser(user) {
        return __awaiter(this, void 0, void 0, function* () { });
    }
    getUser(user) {
        return __awaiter(this, void 0, void 0, function* () {
            return null;
        });
    }
    setUser(user) {
        return __awaiter(this, void 0, void 0, function* () { });
    }
    removeUser(user) {
        return __awaiter(this, void 0, void 0, function* () { });
    }
    getUserName(user) {
        return __awaiter(this, void 0, void 0, function* () {
            return "";
        });
    }
    setUserName(user, name) {
        return __awaiter(this, void 0, void 0, function* () { });
    }
    getUserDescription(user) {
        return __awaiter(this, void 0, void 0, function* () {
            return "";
        });
    }
    setUserDescription(user, description) {
        return __awaiter(this, void 0, void 0, function* () { });
    }
    getUserProfile(user) {
        return __awaiter(this, void 0, void 0, function* () {
            return Buffer.from("");
        });
    }
    setUserProfile(user, profile) {
        return __awaiter(this, void 0, void 0, function* () { });
    }
    unblockUser(user) {
        return __awaiter(this, void 0, void 0, function* () { });
    }
    blockUser(user) {
        return __awaiter(this, void 0, void 0, function* () { });
    }
    getUsers() {
        return __awaiter(this, void 0, void 0, function* () {
            return {};
        });
    }
    setUsers(users) {
        return __awaiter(this, void 0, void 0, function* () { });
    }
    //? ************** MODELS **************
    Chat(chat) {
        return new Chat_1.default(Chat_1.default.getChatId(chat));
    }
    User(user) {
        return new User_1.default(User_1.default.getUserId(user));
    }
    Command() {
        return new Command_1.default();
    }
    //? ************** MESSAGE *************
    deleteMessage(message) {
        return __awaiter(this, void 0, void 0, function* () { });
    }
    removeMessage(message) {
        return __awaiter(this, void 0, void 0, function* () { });
    }
    addReaction(message, reaction) {
        return __awaiter(this, void 0, void 0, function* () { });
    }
    removeReaction(message) {
        return __awaiter(this, void 0, void 0, function* () { });
    }
    Message(chat, text) {
        return new Message_1.default(Chat_1.default.getChat(chat), text);
    }
    MediaMessage(chat, text, file) {
        return new MediaMessage_1.default(Chat_1.default.getChat(chat), text, file);
    }
    ImageMessage(chat, text, image) {
        return new ImageMessage_1.default(Chat_1.default.getChat(chat), text, image);
    }
    VideoMessage(chat, text, video) {
        return new VideoMessage_1.default(Chat_1.default.getChat(chat), text, video);
    }
    ContactMessage(chat, text, contact) {
        return new ContactMessage_1.default(Chat_1.default.getChat(chat), text, contact);
    }
    LocationMessage(chat, latitude, longitude) {
        return new LocationMessage_1.default(Chat_1.default.getChat(chat), latitude, longitude);
    }
    ListMessage(chat, text, button) {
        return new ListMessage_1.default(Chat_1.default.getChat(chat), text, button);
    }
    ButtonMessage(chat, text) {
        return new ButtonMessage_1.default(Chat_1.default.getChat(chat), text);
    }
}
exports.default = BotBase;
//# sourceMappingURL=BotBase.js.map