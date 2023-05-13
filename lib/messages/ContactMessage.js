"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Message_1 = require("../enums/Message");
const Message_2 = __importDefault(require("./Message"));
const User_1 = __importDefault(require("../modules/User"));
const Generic_1 = require("../utils/Generic");
class ContactMessage extends Message_2.default {
    constructor(chat, text, contacts, others = {}) {
        super(chat, text);
        this.type = Message_1.MessageType.Contact;
        this.contacts = [];
        for (let contact in contacts) {
            this.contacts.push((0, Generic_1.ApplyClient)(User_1.default.get(contact), this.client));
        }
        (0, Generic_1.injectJSON)(others, this);
    }
}
exports.default = ContactMessage;
//# sourceMappingURL=ContactMessage.js.map