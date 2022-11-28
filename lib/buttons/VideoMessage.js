"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VideoMessage = void 0;
const MediaMessage_1 = require("./MediaMessage");
class VideoMessage extends MediaMessage_1.MediaMessage {
    constructor(chat, text, video, mention, id) {
        super(chat, text, mention, id);
        this.setVideo(video);
    }
}
exports.VideoMessage = VideoMessage;
//# sourceMappingURL=VideoMessage.js.map