"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Message_1 = __importDefault(require("@messages/Message"));
class ListMessage extends Message_1.default {
    constructor(chat, text, button, footer, title, mention, id, user, fromMe, selected, mentions, timestamp) {
        super(chat, text, mention, id, user, fromMe, selected, mentions, timestamp);
        this.list = [];
        this.button = button;
        this.footer = footer || "";
        this.title = title || "";
    }
    addCategory(title, items = []) {
        const index = this.list.length;
        this.list.push({ title, items });
        return index;
    }
    addItem(index, title, description = "", id = String(Date.now())) {
        return this.list[index].items.push({ title, description, id });
    }
}
exports.default = ListMessage;
//# sourceMappingURL=ListMessage.js.map