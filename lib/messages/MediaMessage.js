"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Message_1 = __importDefault(require("./Message"));
class MediaMessage extends Message_1.default {
    constructor(chat, text, file, mention, id, user, fromMe, selected, mentions, timestamp) {
        super(chat, text, mention, id, user, fromMe, selected, mentions, timestamp);
        /** * O arquivo é um GIF */
        this.isGIF = false;
        /** * MimeType */
        this.mimetype = "application/octet-stream";
        /** * Nome do arquivo */
        this.name = "";
        this.file = file;
    }
    /**
     * @returns Obter arquivo
     */
    getStream() {
        return this.client.downloadStreamMessage(this);
    }
}
exports.default = MediaMessage;
//# sourceMappingURL=MediaMessage.js.map