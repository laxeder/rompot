"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListMessage = void 0;
const uuidv4_1 = require("uuidv4");
const Message_1 = require("./Message");
class ListMessage extends Message_1.Message {
    constructor(chat, title, text, footer, buttonText) {
        super(chat, text);
        this.list = [];
        this.title = title;
        this.text = text;
        this.footer = footer;
        this.buttonText = buttonText;
    }
    /**
     * * Adiciona uma seção
     * @param title
     * @param items
     * @returns
     */
    addCategory(title, items = []) {
        const index = this.list.length;
        this.list.push({ title, items });
        return index;
    }
    /**
     * * Adiciona um item a lista
     * @param index
     * @param title
     * @param description
     * @param id
     * @returns
     */
    addItem(index, title, description = "", id = this.generateID()) {
        return this.list[index].items.push({ title, description, id });
    }
    /**
     * * Gera um novo ID
     * @returns
     */
    generateID() {
        return (0, uuidv4_1.uuid)();
    }
}
exports.ListMessage = ListMessage;
//# sourceMappingURL=ListMessage.js.map