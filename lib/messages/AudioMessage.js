"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const MediaMessage_1 = __importDefault(require("./MediaMessage"));
class AudioMessage extends MediaMessage_1.default {
    constructor(chat, file, mention, id, user, fromMe, selected, mentions, timestamp) {
        super(chat, "", file, mention, id, user, fromMe, selected, mentions, timestamp);
    }
    getAudio() {
        return this.getStream(this.file);
    }
}
exports.default = AudioMessage;
//# sourceMappingURL=AudioMessage.js.map