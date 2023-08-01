"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const rompot_base_1 = require("rompot-base");
const Message_1 = __importDefault(require("./Message"));
const Generic_1 = require("../utils/Generic");
class ListMessage extends Message_1.default {
    constructor(chat, text, button, footer, title, others = {}) {
        super(chat, text);
        this.type = rompot_base_1.MessageType.List;
        this.list = [];
        this.button = button;
        this.footer = footer || "";
        this.title = title || "";
        (0, Generic_1.injectJSON)(others, this);
    }
    /**
     * * Adiciona uma seção
     * @param title Titulo da lista
     * @param items Items da lista
     * @returns Categoria criada
     */
    addCategory(title, items = []) {
        const index = this.list.length;
        this.list.push({ title, items });
        return index;
    }
    /**
     * * Adiciona um item a lista
     * @param index Categoria do item
     * @param title Titulo do item
     * @param description Descrição do item
     * @param id ID do item
     */
    addItem(index, title, description = "", id = String(Date.now())) {
        return this.list[index].items.push({ title, description, id });
    }
}
exports.default = ListMessage;
//# sourceMappingURL=ListMessage.js.map