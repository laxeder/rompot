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
const Message_1 = __importDefault(require("../../../messages/Message"));
const BotEevents_1 = __importDefault(require("../../bot/events/BotEevents"));
const User_1 = __importDefault(require("../../user/models/User"));
class BotBase {
    constructor() {
        this.id = "";
        this.status = "offline";
        this.ev = new BotEevents_1.default();
    }
    //! #################################################################
    //! ########## MÉTODOS DE CONEXÃO
    //! #################################################################
    connect(auth) {
        return __awaiter(this, void 0, void 0, function* () { });
    }
    connectByCode(phoneNumber, auth) {
        return __awaiter(this, void 0, void 0, function* () {
            return "";
        });
    }
    reconnect(alert) {
        return __awaiter(this, void 0, void 0, function* () { });
    }
    stop(reason) {
        return __awaiter(this, void 0, void 0, function* () { });
    }
    //! #################################################################
    //! ########## MÉTODOS DE MENSAGEM
    //! #################################################################
    send(message) {
        return __awaiter(this, void 0, void 0, function* () {
            return message;
        });
    }
    sendMessage(chat, message, mention) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Message_1.default(chat, "");
        });
    }
    editMessage(message) {
        return __awaiter(this, void 0, void 0, function* () { });
    }
    addReaction(message) {
        return __awaiter(this, void 0, void 0, function* () { });
    }
    removeReaction(message) {
        return __awaiter(this, void 0, void 0, function* () { });
    }
    readMessage(message) {
        return __awaiter(this, void 0, void 0, function* () { });
    }
    removeMessage(message) {
        return __awaiter(this, void 0, void 0, function* () { });
    }
    deleteMessage(message) {
        return __awaiter(this, void 0, void 0, function* () { });
    }
    downloadStreamMessage(media) {
        return __awaiter(this, void 0, void 0, function* () {
            return Buffer.from("");
        });
    }
    //! #################################################################
    //! ########## MÉTODOS DO BOT
    //! #################################################################
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
    //! #################################################################
    //! ########## MÉTODOS DO CHAT
    //! #################################################################
    getChats() {
        return __awaiter(this, void 0, void 0, function* () {
            return {};
        });
    }
    setChats(chats) {
        return __awaiter(this, void 0, void 0, function* () { });
    }
    getChat(chat) {
        return __awaiter(this, void 0, void 0, function* () {
            return null;
        });
    }
    setChat(chat) {
        return __awaiter(this, void 0, void 0, function* () { });
    }
    addChat(chat) {
        return __awaiter(this, void 0, void 0, function* () { });
    }
    removeChat(chat) {
        return __awaiter(this, void 0, void 0, function* () { });
    }
    createChat(chat) {
        return __awaiter(this, void 0, void 0, function* () { });
    }
    leaveChat(chat) {
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
    changeChatStatus(chat, status) {
        return __awaiter(this, void 0, void 0, function* () { });
    }
    getChatUsers(chat) {
        return __awaiter(this, void 0, void 0, function* () {
            return {};
        });
    }
    getChatAdmins(chat) {
        return __awaiter(this, void 0, void 0, function* () {
            return {};
        });
    }
    getChatLeader(chat) {
        return __awaiter(this, void 0, void 0, function* () {
            return new User_1.default("");
        });
    }
    getChatName(chat) {
        return __awaiter(this, void 0, void 0, function* () {
            return "";
        });
    }
    setChatName(chat, name) {
        return __awaiter(this, void 0, void 0, function* () { });
    }
    getChatDescription(chat) {
        return __awaiter(this, void 0, void 0, function* () {
            return "";
        });
    }
    setChatDescription(chat, description) {
        return __awaiter(this, void 0, void 0, function* () { });
    }
    getChatProfile(chat) {
        return __awaiter(this, void 0, void 0, function* () {
            return Buffer.from("");
        });
    }
    setChatProfile(chat, profile) {
        return __awaiter(this, void 0, void 0, function* () { });
    }
    //! #################################################################
    //! ########## MÉTODOS DO USUÁRIO
    //! #################################################################
    getUsers() {
        return __awaiter(this, void 0, void 0, function* () {
            return {};
        });
    }
    setUsers(users) {
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
    addUser(user) {
        return __awaiter(this, void 0, void 0, function* () { });
    }
    removeUser(user) {
        return __awaiter(this, void 0, void 0, function* () { });
    }
    unblockUser(user) {
        return __awaiter(this, void 0, void 0, function* () { });
    }
    blockUser(user) {
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
}
exports.default = BotBase;
//# sourceMappingURL=BotBase.js.map