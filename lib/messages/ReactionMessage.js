"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Message_1 = __importDefault(require("./Message"));
class ReactionMessage extends Message_1.default {
    constructor(chat, reaction, receive, id, user, fromMe, selected, mentions, timestamp) {
        super(chat, reaction, undefined, id, user, fromMe, selected, mentions, timestamp);
        if (receive instanceof Message_1.default) {
            this.id = receive.id;
        }
        else {
            this.id = receive;
        }
    }
}
exports.default = ReactionMessage;
//# sourceMappingURL=ReactionMessage.js.map