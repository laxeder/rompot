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
const ClientModule_1 = __importDefault(require("../modules/client/models/ClientModule"));
const chat_1 = require("../modules/chat");
const user_1 = require("../modules/user");
const MessageUtils_1 = __importDefault(require("../utils/MessageUtils"));
const Generic_1 = require("../utils/Generic");
class Message extends ClientModule_1.default {
    constructor(chat, text, others = {}) {
        super();
        this.type = rompot_base_1.MessageType.Text;
        this.chat = new chat_1.Chat("");
        this.user = new user_1.User("");
        this.mention = undefined;
        this.id = "";
        this.text = "";
        this.selected = "";
        this.fromMe = false;
        this.apiSend = false;
        this.isDeleted = false;
        this.isEdited = false;
        this.mentions = [];
        this.timestamp = Date.now();
        this.text = text || "";
        (0, Generic_1.injectJSON)(others, this);
        this.chat = chat_1.ChatUtils.applyClient(this.client, chat || "");
        this.user = user_1.UserUtils.applyClient(this.client, this.user || "");
        if (this.mention)
            this.mention = MessageUtils_1.default.applyClient(this.client, this.mention);
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
            const msg = MessageUtils_1.default.get(message);
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
}
exports.default = Message;
//# sourceMappingURL=Message.js.map