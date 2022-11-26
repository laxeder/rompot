"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ButtonMessage = void 0;
const Message_1 = require("./Message");
class ButtonMessage extends Message_1.Message {
    constructor(chat, text, footer = "", type = 1) {
        super(chat, text);
        this.buttons = [];
        this.footer = footer;
        this.type = type;
    }
    /**
     * * Define o rodapé da mensagem
     * @param footer
     */
    setFooter(footer) {
        this.footer = footer;
    }
    /**
     * * Define o tipo da mensagem
     * @param type
     */
    setType(type) {
        this.type = type;
    }
    /**
     * * Adiciona um botão com uma url
     * @param text
     * @param url
     * @param index
     * @returns
     */
    addUrl(text, url, index = this.buttons.length + 1) {
        this.buttons.push({ index, url: { text, url } });
        return this;
    }
    /**
     * * Adiciona um botão com um telefone
     * @param text
     * @param call
     * @param index
     * @returns
     */
    addCall(text, phone, index = this.buttons.length + 1) {
        this.buttons.push({ index, call: { text, phone } });
        return this;
    }
    /**
     * * Adiciona um botão respondivel
     * @param text
     * @param id
     * @param index
     * @returns
     */
    addReply(text, id = this.generateID(), index = this.buttons.length + 1) {
        this.buttons.push({ index, reply: { text, id } });
        return this;
    }
    /**
     * * Remove um botão
     * @param index
     */
    remove(index) {
        this.buttons = this.buttons.filter((button) => {
            if (button.index !== index)
                return button;
        });
    }
    /**
     * * Gera um novo ID
     * @returns
     */
    generateID() {
        return String(this.buttons.length + 1);
    }
}
exports.ButtonMessage = ButtonMessage;
//# sourceMappingURL=ButtonMessage.js.map