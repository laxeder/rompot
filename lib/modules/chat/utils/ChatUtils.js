"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Chat_1 = __importDefault(require("../../chat/models/Chat"));
class ChatUtils {
    /**
     * @param chat Sala de bate-papo que será obtida
     * @returns Retorna a sala de bate-papo
     */
    static get(chat) {
        if (typeof chat == "string") {
            return new Chat_1.default(chat);
        }
        return chat;
    }
    /**
     * @param chat Sala de bate-papo
     * @returns Retorna o ID da sala de bate-papo
     */
    static getId(chat) {
        if (typeof chat == "string") {
            return String(chat || "");
        }
        if (typeof chat == "object" && !Array.isArray(chat) && (chat === null || chat === void 0 ? void 0 : chat.id)) {
            return String(chat.id);
        }
        return String(chat || "");
    }
    /**
     * * Cria uma sala de bate-papo com cliente instanciado
     * @param client Cliente
     * @param chat Sala de bate-papo
     */
    static applyClient(client, chat) {
        if (typeof chat == "string")
            return this.applyClient(client, new Chat_1.default(chat));
        chat.client = client;
        return chat;
    }
}
exports.default = ChatUtils;
//# sourceMappingURL=ChatUtils.js.map