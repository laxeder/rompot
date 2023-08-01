"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Message_1 = __importDefault(require("../messages/Message"));
const Chat_1 = __importDefault(require("../modules/chat/models/Chat"));
class MessageUtils {
    /**
     * @param message Mensagem que será obtida
     * @returns Retorna a mensagem
     */
    static get(message) {
        if (typeof message == "string") {
            return new Message_1.default(new Chat_1.default(""), message);
        }
        return message;
    }
    /**
     * @param message Mensagem
     * @returns Retorna o ID da mensagem
     */
    static getId(message) {
        if (typeof message == "string") {
            return String(message || "");
        }
        if (typeof message == "object" && !Array.isArray(message) && (message === null || message === void 0 ? void 0 : message.id)) {
            return String(message.id);
        }
        return String(message || "");
    }
    /**
     * * Cria uma mensagem com cliente instanciado
     * @param client Cliente
     * @param msg Mensagem
     * @returns
     */
    static applyClient(client, message) {
        message.client = client;
        message.chat.client = client;
        message.user.client = client;
        if (message.mention)
            MessageUtils.applyClient(client, message.mention);
        return message;
    }
}
exports.default = MessageUtils;
//# sourceMappingURL=MessageUtils.js.map