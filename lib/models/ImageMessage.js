"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImageMessage = void 0;
const Message_1 = require("./Message");
class ImageMessage extends Message_1.Message {
    constructor(chat, text, image, mention, id) {
        super(chat, text, mention, id);
        this.image = image;
    }
    setImage(image) {
        this.image = image;
    }
    getImage() {
        return this.image;
    }
}
exports.ImageMessage = ImageMessage;
//# sourceMappingURL=ImageMessage.js.map