"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const MediaMessage_1 = __importDefault(require("./MediaMessage"));
class FileMessage extends MediaMessage_1.default {
    constructor(chat, text, file, mention, id, user, fromMe, selected, mentions, timestamp) {
        super(chat, text, file, mention, id, user, fromMe, selected, mentions, timestamp);
    }
    /**
     * @returns Obter arquivo
     */
    getFile() {
        return this.getStream();
    }
}
exports.default = FileMessage;
//# sourceMappingURL=FileMessage.js.map