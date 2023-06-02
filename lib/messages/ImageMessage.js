"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Message_1 = require("../enums/Message");
const MediaMessage_1 = __importDefault(require("./MediaMessage"));
const Generic_1 = require("../utils/Generic");
class ImageMessage extends MediaMessage_1.default {
    constructor(chat, text, file, others = {}) {
        super(chat, text, file);
        this.type = Message_1.MessageType.Image;
        this.mimetype = "image/png";
        (0, Generic_1.injectJSON)(others, this);
    }
    /**
     * @returns Obter imagem
     */
    getImage() {
        return this.getStream();
    }
}
exports.default = ImageMessage;
//# sourceMappingURL=ImageMessage.js.map