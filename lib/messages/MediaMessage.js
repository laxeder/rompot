"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Message_1 = __importDefault(require("./Message"));
class MediaMessage extends Message_1.default {
    constructor(chat, text, file, mention, id, user, fromMe, selected, mentions, timestamp) {
        super(chat, text, mention, id, user, fromMe, selected, mentions, timestamp);
        this.isGIF = false;
        this.file = file;
    }
    getStream(stream) {
        return stream || this.file;
    }
}
exports.default = MediaMessage;
//# sourceMappingURL=MediaMessage.js.map