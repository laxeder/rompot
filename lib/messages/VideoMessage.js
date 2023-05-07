"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const MediaMessage_1 = __importDefault(require("./MediaMessage"));
class VideoMessage extends MediaMessage_1.default {
    constructor(chat, text, file, mention, id, user, fromMe, selected, mentions, timestamp) {
        super(chat, text, file, mention, id, user, fromMe, selected, mentions, timestamp);
        this.mimetype = "video/mp4";
    }
    /**
     * @returns Obter vídeo
     */
    getVideo() {
        return this.getStream();
    }
}
exports.default = VideoMessage;
//# sourceMappingURL=VideoMessage.js.map