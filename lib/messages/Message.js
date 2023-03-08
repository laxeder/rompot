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
const BotBase_1 = __importDefault(require("../modules/BotBase"));
const Generic_1 = require("../utils/Generic");
class Message {
    constructor(chat, text, mention, id, user, fromMe, selected, mentions, timestamp) {
        this.client = (0, BotBase_1.default)();
        this.chat = (0, Generic_1.ChatClient)(this.client, (0, Generic_1.getChat)(chat || ""));
        this.user = (0, Generic_1.UserClient)(this.client, (0, Generic_1.getUser)(user || ""));
        this.id = id || "";
        this.text = text || "";
        this.fromMe = !!fromMe;
        this.selected = selected || "";
        this.mentions = mentions || [];
        this.timestamp = timestamp || Date.now();
        if (mention)
            this.mention = new Message(mention.chat, mention.text, mention.mention, mention.id, mention.user, mention.fromMe, mention.selected, mention.mentions, mention.timestamp);
    }
    addReaction(reaction) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.client.addReaction(this, reaction);
        });
    }
    reply(message, mention = true) {
        return __awaiter(this, void 0, void 0, function* () {
            const msg = (0, Generic_1.getMessage)(message);
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