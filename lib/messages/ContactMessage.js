"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const rompot_base_1 = require("rompot-base");
const Message_1 = __importDefault(require("./Message"));
const UserUtils_1 = __importDefault(require("../modules/user/utils/UserUtils"));
const Generic_1 = require("../utils/Generic");
class ContactMessage extends Message_1.default {
    constructor(chat, text, contacts, others = {}) {
        super(chat, text);
        this.type = rompot_base_1.MessageType.Contact;
        this.contacts = {};
        for (let contact in contacts) {
            const user = UserUtils_1.default.applyClient(this.client, contact);
            this.contacts[user.id] = user;
        }
        (0, Generic_1.injectJSON)(others, this);
    }
}
exports.default = ContactMessage;
//# sourceMappingURL=ContactMessage.js.map