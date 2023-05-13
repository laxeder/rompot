"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Message_1 = require("../enums/Message");
const MediaMessage_1 = __importDefault(require("./MediaMessage"));
const Generic_1 = require("../utils/Generic");
class AudioMessage extends MediaMessage_1.default {
    constructor(chat, file, others = {}) {
        super(chat, "", file);
        this.type = Message_1.MessageType.Audio;
        this.mimetype = "audio/mp4";
        (0, Generic_1.injectJSON)(others, this);
    }
    /**
     * @returns Obter audio
     */
    getAudio() {
        return this.getStream();
    }
}
exports.default = AudioMessage;
//# sourceMappingURL=AudioMessage.js.map