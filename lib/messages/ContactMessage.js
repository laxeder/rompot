"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Message_1 = __importDefault(require("@messages/Message"));
const Generic_1 = require("@utils/Generic");
class ContactMessage extends Message_1.default {
    constructor(chat, text, contacts, mention, id, user, fromMe, selected, mentions, timestamp) {
        super(chat, text, mention, id, user, fromMe, selected, mentions, timestamp);
        this.contacts = [];
        for (const contact in contacts) {
            this.contacts.push((0, Generic_1.UserClient)(this.client, (0, Generic_1.getUser)(contact)));
        }
    }
}
exports.default = ContactMessage;
//# sourceMappingURL=ContactMessage.js.map