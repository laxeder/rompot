"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Message_1 = __importDefault(require("@messages/Message"));
//@ts-ignore
class ContactMessage extends Message_1.default {
    constructor(chat, text, contacts, mention, id) {
        super(chat, text, mention, id);
        this.contacts = [];
        if (Array.isArray(contacts)) {
            contacts.forEach((contact) => {
                this.contacts.push(contact);
            });
        }
        else {
            this.contacts.push(contacts || "");
        }
    }
    /**
     * * Injeta a interface no modulo
     * @param bot Bot que irá executar os métodos
     * @param message Interface da mensagem
     */
    static Inject(bot, msg) {
        const module = new ContactMessage(msg.chat, msg.text, msg.contacts);
        module.inject(bot, msg);
        return Object.assign(Object.assign({}, msg), module);
    }
}
exports.default = ContactMessage;
//# sourceMappingURL=ContactMessage.js.map