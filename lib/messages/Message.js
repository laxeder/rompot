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
const BotBase_1 = __importDefault(require("@modules/BotBase"));
const Chat_1 = __importDefault(require("@modules/Chat"));
const User_1 = __importDefault(require("@modules/User"));
const bot_1 = require("@utils/bot");
const MediaMessage_1 = __importDefault(require("./MediaMessage"));
class Message {
    constructor(chat, text, mention, id) {
        this.chat = Chat_1.default.Inject(this.bot, Chat_1.default.getChat(chat));
        this.id = id || String(Date.now());
        this.user = new User_1.default(this.bot.id);
        this.text = text;
        this.fromMe = true;
        this.selected = "";
        this.mentions = [];
        if (mention) {
            this.mention = Message.Inject(this.bot, mention);
        }
        else {
            this.mention = mention;
        }
        this.timestamp = Date.now();
    }
    get bot() {
        return new BotBase_1.default();
    }
    addReaction(reaction) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.bot.addReaction(this, reaction);
        });
    }
    reply(message, mention = true) {
        return __awaiter(this, void 0, void 0, function* () {
            const msg = Message.getMessage(message);
            if (mention)
                msg.mention = this;
            return this.bot.send(msg);
        });
    }
    read() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.bot.readMessage(this);
        });
    }
    inject(bot, msg) {
        this.id = msg.id;
        this.text = msg.text;
        this.fromMe = msg.fromMe;
        this.mentions = msg.mentions;
        this.timestamp = msg.timestamp;
        this.chat = Chat_1.default.Inject(bot, msg.chat);
        this.user = User_1.default.Inject(bot, msg.user);
        if (msg.mention) {
            this.mention = Message.Inject(bot, msg.mention);
        }
        if (msg instanceof MediaMessage_1.default && this instanceof MediaMessage_1.default) {
            this.getStream = msg.getStream;
        }
        (0, bot_1.setBotProperty)(bot, this);
        (0, bot_1.setBotProperty)(bot, this.chat);
        (0, bot_1.setBotProperty)(bot, this.user);
    }
    /**
     * @param message Mensagem que será obtida
     * @returns Retorna a mensagem
     */
    static getMessage(message) {
        if (typeof message == "string") {
            return new Message(new Chat_1.default(""), message);
        }
        return message;
    }
    /**
     * @param message Mensagem
     * @returns Retorna o ID da mensagem
     */
    static getMessageId(message) {
        if (typeof message == "string") {
            return String(message || "");
        }
        if (typeof message == "object" && !Array.isArray(message) && (message === null || message === void 0 ? void 0 : message.id)) {
            return String(message.id);
        }
        return String(message || "");
    }
    /**
     * * Injeta a interface no modulo
     * @param bot Client que irá executar os métodos
     * @param message Interface da mensagem
     */
    static Inject(bot, msg) {
        const module = new Message(msg.chat, msg.text);
        module.inject(bot, msg);
        return Object.assign(Object.assign({}, msg), module);
    }
}
exports.default = Message;
//# sourceMappingURL=Message.js.map