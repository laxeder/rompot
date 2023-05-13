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
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _Chat_client;
Object.defineProperty(exports, "__esModule", { value: true });
const Message_1 = __importDefault(require("../messages/Message"));
const Base_1 = require("./Base");
const User_1 = __importDefault(require("./User"));
class Chat {
    constructor(id, type, name) {
        _Chat_client.set(this, (0, Base_1.ClientBase)());
        this.id = id || "";
        this.type = type || "pv";
        this.name = name || "";
    }
    get client() {
        return __classPrivateFieldGet(this, _Chat_client, "f");
    }
    set client(client) {
        __classPrivateFieldSet(this, _Chat_client, client, "f");
    }
    getName() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.client.getChatName(this);
        });
    }
    setName(name) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.client.setChatName(this, name);
        });
    }
    getDescription() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.client.getChatDescription(this);
        });
    }
    setDescription(description) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.client.setChatDescription(this, description);
        });
    }
    getProfile() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.client.getChatProfile(this);
        });
    }
    setProfile(image) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.client.setChatProfile(this, image);
        });
    }
    IsAdmin(user) {
        return __awaiter(this, void 0, void 0, function* () {
            const admins = yield this.client.getChatAdmins(this);
            return admins.hasOwnProperty(User_1.default.getId(user));
        });
    }
    IsLeader(user) {
        return __awaiter(this, void 0, void 0, function* () {
            const leader = yield this.client.getChatLeader(this);
            return leader.id == User_1.default.getId(user);
        });
    }
    getAdmins() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.client.getChatAdmins(this);
        });
    }
    getUsers() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.client.getChatUsers(this);
        });
    }
    addUser(user) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.client.addUserInChat(this, user);
        });
    }
    removeUser(user) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.client.removeUserInChat(this, user);
        });
    }
    promote(user) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.client.promoteUserInChat(this, user);
        });
    }
    demote(user) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.client.demoteUserInChat(this, User_1.default.get(user));
        });
    }
    leave() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.client.leaveChat(this);
        });
    }
    send(message) {
        return __awaiter(this, void 0, void 0, function* () {
            const msg = Message_1.default.get(message);
            if (!!!msg.chat.id)
                msg.chat.id = this.id;
            if (!!!msg.user.id)
                msg.user.id = this.client.id;
            return this.client.send(msg);
        });
    }
    changeStatus(status) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.client.changeChatStatus(this, status);
        });
    }
    /**
     * @param chat Sala de bate-papo que será obtida
     * @returns Retorna a sala de bate-papo
     */
    static get(chat) {
        if (typeof chat == "string") {
            return new Chat(chat);
        }
        return chat;
    }
    /**
     * @param chat Sala de bate-papo
     * @returns Retorna o ID da sala de bate-papo
     */
    static getId(chat) {
        if (typeof chat == "string") {
            return String(chat || "");
        }
        if (typeof chat == "object" && !Array.isArray(chat) && (chat === null || chat === void 0 ? void 0 : chat.id)) {
            return String(chat.id);
        }
        return String(chat || "");
    }
    /**
     * * Cria uma sala de bate-papo com cliente instanciado
     * @param client Cliente
     * @param chat Sala de bate-papo
     */
    static Client(client, chat) {
        if (typeof chat == "string")
            return this.Client(client, new Chat(chat));
        chat.client = client;
        return chat;
    }
}
exports.default = Chat;
_Chat_client = new WeakMap();
//# sourceMappingURL=Chat.js.map