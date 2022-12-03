"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContactMessage = void 0;
const Message_1 = require("./Message");
const User_1 = require("../models/User");
class ContactMessage extends Message_1.Message {
    constructor(chat, text, contacts, mention, id) {
        super(chat, text, mention, id);
        this.contacts = [];
        if (contacts instanceof User_1.User) {
            this.contacts = [contacts];
        }
        else
            this.contacts = contacts;
    }
    /**
     * * Define o usuário do contato
     * @param user
     */
    setContacts(user) {
        this.contacts = user;
    }
    /**
     * * retorna os contatos da mensagem
     * @returns
     */
    getContacts() {
        return this.contacts;
    }
}
exports.ContactMessage = ContactMessage;
//# sourceMappingURL=ContactMessage.js.map