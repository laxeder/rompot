"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Message_1 = __importDefault(require("./Message"));
//@ts-ignore
class ListMessage extends Message_1.default {
    constructor(chat, text, buttonText, title, footer) {
        super(chat, text);
        this.list = [];
        this.button = buttonText;
        this.title = title || "";
        this.footer = footer || "";
    }
    addCategory(title, items = []) {
        const index = this.list.length;
        this.list.push({ title, items });
        return index;
    }
    addItem(index, title, description = "", id = this.generateID()) {
        return this.list[index].items.push({ title, description, id });
    }
    /**
     * @returns Retorna um ID
     */
    generateID() {
        return String(Date.now());
    }
    /**
     * * Injeta a interface no modulo
     * @param bot Bot que irá executar os métodos
     * @param message Interface da mensagem
     */
    static Inject(bot, msg) {
        const module = new ListMessage(msg.chat, msg.text, msg.text);
        module.inject(bot, msg);
        return Object.assign(Object.assign({}, msg), module);
    }
}
exports.default = ListMessage;
//# sourceMappingURL=ListMessage.js.map