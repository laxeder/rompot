"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AudioMessage = void 0;
const MediaMessage_1 = require("./MediaMessage");
class AudioMessage extends MediaMessage_1.MediaMessage {
    constructor(chat, text, audio, mention, id) {
        super(chat, text, mention, id);
        this.setAudio(audio);
    }
}
exports.AudioMessage = AudioMessage;
//# sourceMappingURL=AudioMessage.js.map