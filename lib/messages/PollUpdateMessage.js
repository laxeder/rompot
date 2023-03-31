"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const PollMessage_1 = __importDefault(require("./PollMessage"));
class PollUpdateMessage extends PollMessage_1.default {
    constructor(chat, text, options, mention, id, user, fromMe, selected, mentions, timestamp) {
        super(chat, text, options, mention, id, user, fromMe, selected, mentions, timestamp);
        /** * ação */
        this.action = "create";
        this.options = options || [];
    }
}
exports.default = PollUpdateMessage;
//# sourceMappingURL=PollUpdateMessage.js.map