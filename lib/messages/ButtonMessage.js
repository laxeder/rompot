"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Message_1 = __importDefault(require("./Message"));
//@ts-ignore
class ButtonMessage extends Message_1.default {
    constructor(chat, text, footer = "") {
        super(chat, text);
        this.buttons = [];
        this.footer = footer;
    }
    addUrl(text, url, index = this.buttons.length + 1) {
        this.buttons.push({ index, type: "url", text, content: url });
    }
    addCall(text, phone, index = this.buttons.length + 1) {
        this.buttons.push({ index, type: "call", text, content: phone });
    }
    addReply(text, id = this.generateID(), index = this.buttons.length + 1) {
        this.buttons.push({ index, type: "reply", text, content: id });
    }
    remove(index) {
        this.buttons.splice(index);
    }
    generateID() {
        return String(this.buttons.length + 1);
    }
    /**
     * * Injeta a interface no modulo
     * @param bot Bot que irá executar os métodos
     * @param message Interface da mensagem
     */
    static Inject(bot, msg) {
        const module = new ButtonMessage(msg.chat, msg.text);
        module.inject(bot, msg);
        module.footer = msg.footer;
        module.buttons = msg.buttons;
        return Object.assign(Object.assign({}, msg), module);
    }
}
exports.default = ButtonMessage;
//# sourceMappingURL=ButtonMessage.js.map