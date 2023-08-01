"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const rompot_base_1 = require("rompot-base");
const Message_1 = __importDefault(require("./Message"));
const Generic_1 = require("../utils/Generic");
class ButtonMessage extends Message_1.default {
    constructor(chat, text, footer, others = {}) {
        super(chat, text);
        this.type = rompot_base_1.MessageType.TemplateButton;
        this.buttons = [];
        this.footer = footer || "";
        (0, Generic_1.injectJSON)(others, this);
    }
    /**
     * * Adiciona um botão com uma url
     * @param text Texto da botão
     * @param url Url do botão
     * @param index Posição do botão
     */
    addUrl(text, url, index = this.buttons.length + 1) {
        this.buttons.push({ index, type: "url", text, content: url });
    }
    /**
     * * Adiciona um botão com um telefone
     * @param text Texto do botão
     * @param phone Tefefone do botão
     * @param index Posição do botão
     */
    addCall(text, phone, index = this.buttons.length + 1) {
        this.buttons.push({ index, type: "call", text, content: phone });
    }
    /**
     * * Adiciona um botão respondivel
     * @param text Texto do botão
     * @param id ID do botão
     * @param index Posição do botão
     */
    addReply(text, id = String(this.buttons.length + 1), index = this.buttons.length + 1) {
        this.buttons.push({ index, type: "reply", text, content: id });
    }
    /**
     * * Remove um botão
     * @param index Posição do botão
     */
    remove(index) {
        this.buttons.splice(index);
    }
}
exports.default = ButtonMessage;
//# sourceMappingURL=ButtonMessage.js.map