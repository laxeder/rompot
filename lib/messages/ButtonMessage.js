"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Message_1 = __importDefault(require("./Message"));
class ButtonMessage extends Message_1.default {
    constructor(chat, text, footer, mention, id, user, fromMe, selected, mentions, timestamp) {
        super(chat, text, mention, id, user, fromMe, selected, mentions, timestamp);
        this.buttons = [];
        this.footer = footer || "";
    }
    addUrl(text, url, index = this.buttons.length + 1) {
        this.buttons.push({ index, type: "url", text, content: url });
    }
    addCall(text, phone, index = this.buttons.length + 1) {
        this.buttons.push({ index, type: "call", text, content: phone });
    }
    addReply(text, id = String(this.buttons.length + 1), index = this.buttons.length + 1) {
        this.buttons.push({ index, type: "reply", text, content: id });
    }
    remove(index) {
        this.buttons.splice(index);
    }
}
exports.default = ButtonMessage;
//# sourceMappingURL=ButtonMessage.js.map