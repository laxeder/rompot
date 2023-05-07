"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const MediaMessage_1 = __importDefault(require("./MediaMessage"));
class StickerMessage extends MediaMessage_1.default {
    constructor(chat, file, mention, id, user, fromMe, selected, mentions, timestamp) {
        super(chat, "", file, mention, id, user, fromMe, selected, mentions, timestamp);
        /** * Criador da figurinha */
        this.author = "";
        /** * Pacote da figurinha */
        this.pack = "";
        /** * Categoria da figurinha */
        this.categories = [];
        /** * ID da figurinha */
        this.stickerId = "";
        this.mimetype = "image/webp";
    }
    /**
     * @returns Obter figurinha
     */
    getSticker() {
        return this.getStream();
    }
}
exports.default = StickerMessage;
//# sourceMappingURL=StickerMessage.js.map