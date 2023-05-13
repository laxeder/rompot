"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Message_1 = require("../enums/Message");
const index_1 = require("./index");
const Generic_1 = require("../utils/Generic");
class StickerMessage extends index_1.MediaMessage {
    constructor(chat, file, others = {}) {
        super(chat, "", file);
        this.type = Message_1.MessageType.Sticker;
        this.mimetype = "image/webp";
        this.categories = [];
        this.stickerId = "";
        this.author = "";
        this.pack = "";
        (0, Generic_1.injectJSON)(others, this);
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