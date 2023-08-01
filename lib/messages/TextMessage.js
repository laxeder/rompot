"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const rompot_base_1 = require("rompot-base");
const Message_1 = __importDefault(require("./Message"));
class TextMessage extends Message_1.default {
    constructor(chat, text, others = {}) {
        super(chat, text, others);
        this.type = rompot_base_1.MessageType.Text;
    }
}
exports.default = TextMessage;
//# sourceMappingURL=TextMessage.js.map