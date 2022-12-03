"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImageMessage = void 0;
const MediaMessage_1 = require("./MediaMessage");
class ImageMessage extends MediaMessage_1.MediaMessage {
    constructor(chat, text, image, mention, id) {
        super(chat, text, mention, id);
        this.setImage(image);
    }
}
exports.ImageMessage = ImageMessage;
//# sourceMappingURL=ImageMessage.js.map