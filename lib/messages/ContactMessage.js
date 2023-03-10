"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Message_1 = __importDefault(require("./Message"));
const User_1 = __importDefault(require("../modules/User"));
class ContactMessage extends Message_1.default {
    constructor(chat, text, contacts, mention, id, user, fromMe, selected, mentions, timestamp) {
        super(chat, text, mention, id, user, fromMe, selected, mentions, timestamp);
        /** * Contatos */
        this.contacts = [];
        for (const contact in contacts) {
            this.contacts.push(User_1.default.Client(this.client, User_1.default.get(contact)));
        }
    }
}
exports.default = ContactMessage;
//# sourceMappingURL=ContactMessage.js.map