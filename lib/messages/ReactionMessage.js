"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Message_1 = require("../enums/Message");
const Message_2 = __importDefault(require("./Message"));
const Generic_1 = require("../utils/Generic");
class ReactionMessage extends Message_2.default {
    constructor(chat, reaction, receive, others = {}) {
        super(chat, reaction);
        this.type = Message_1.MessageType.Reaction;
        if (typeof receive === "string") {
            this.id = receive;
        }
        else {
            this.id = receive.id;
        }
        (0, Generic_1.injectJSON)(others, this);
    }
}
exports.default = ReactionMessage;
//# sourceMappingURL=ReactionMessage.js.map