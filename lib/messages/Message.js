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
var _Message_client;
Object.defineProperty(exports, "__esModule", { value: true });
const Message_1 = require("../enums/Message");
const ClientBase_1 = require("../modules/ClientBase");
const User_1 = __importDefault(require("../modules/User"));
const Chat_1 = __importDefault(require("../modules/Chat"));
const Generic_1 = require("../utils/Generic");
class Message {
    constructor(chat, text, others = {}) {
        _Message_client.set(this, (0, ClientBase_1.ClientBase)());
        this.type = Message_1.MessageType.Text;
        this.chat = new Chat_1.default("");
        this.user = new User_1.default("");
        this.mention = undefined;
        this.id = "";
        this.text = "";
        this.selected = "";
        this.fromMe = false;
        this.apiSend = false;
        this.isDeleted = false;
        this.mentions = [];
        this.timestamp = Date.now();
        this.text = text || "";
        (0, Generic_1.injectJSON)(others, this);
        this.chat = Chat_1.default.Client(this.client, chat || "");
        this.user = User_1.default.Client(this.client, this.user || "");
        if (this.mention)
            this.mention = Message.Client(this.client, this.mention);
    }
    get client() {
        return __classPrivateFieldGet(this, _Message_client, "f");
    }
    set client(client) {
        __classPrivateFieldSet(this, _Message_client, client, "f");
        this.chat.client = client;
        this.user.client = client;
        if (this.mention)
            this.mention.client = client;
    }
    addReaction(reaction) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.client.addReaction(this, reaction);
        });
    }
    removeReaction() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.client.removeReaction(this);
        });
    }
    addAnimatedReaction(reactions, interval, maxTimeout) {
        return this.client.addAnimatedReaction(this, reactions, interval, maxTimeout);
    }
    reply(message, mention = true) {
        return __awaiter(this, void 0, void 0, function* () {
            const msg = Message.get(message);
            if (!!!msg.chat.id)
                msg.chat.id = this.chat.id;
            if (!!!msg.user.id)
                msg.user.id = this.client.id;
            if (mention)
                msg.mention = this;
            return this.client.send(msg);
        });
    }
    read() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.client.readMessage(this);
        });
    }
    /**
     * @param message Mensagem que será obtida
     * @returns Retorna a mensagem
     */
    static get(message) {
        if (typeof message == "string") {
            return new Message(new Chat_1.default(""), message);
        }
        return message;
    }
    /**
     * @param message Mensagem
     * @returns Retorna o ID da mensagem
     */
    static getId(message) {
        if (typeof message == "string") {
            return String(message || "");
        }
        if (typeof message == "object" && !Array.isArray(message) && (message === null || message === void 0 ? void 0 : message.id)) {
            return String(message.id);
        }
        return String(message || "");
    }
    /**
     * * Cria uma mensagem com cliente instanciado
     * @param client Cliente
     * @param msg Mensagem
     * @returns
     */
    static Client(client, message) {
        message.client = client;
        return message;
    }
}
exports.default = Message;
_Message_client = new WeakMap();
//# sourceMappingURL=Message.js.map