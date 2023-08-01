"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const rompot_base_1 = require("rompot-base");
const index_1 = require("./index");
const Generic_1 = require("../utils/Generic");
class VideoMessage extends index_1.MediaMessage {
    constructor(chat, text, file, others = {}) {
        super(chat, text, file);
        this.type = rompot_base_1.MessageType.Video;
        this.mimetype = "video/mp4";
        (0, Generic_1.injectJSON)(others, this);
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