"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const rompot_base_1 = require("rompot-base");
const Message_1 = __importDefault(require("./Message"));
const Generic_1 = require("../utils/Generic");
class MediaMessage extends Message_1.default {
    constructor(chat, text, file, others = {}) {
        super(chat, text);
        this.type = rompot_base_1.MessageType.Media;
        this.mimetype = "application/octet-stream";
        this.isGIF = false;
        this.name = "";
        this.file = file;
        (0, Generic_1.injectJSON)(others, this);
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