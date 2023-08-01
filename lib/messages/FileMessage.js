"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const rompot_base_1 = require("rompot-base");
const MediaMessage_1 = __importDefault(require("./MediaMessage"));
const Generic_1 = require("../utils/Generic");
class FileMessage extends MediaMessage_1.default {
    constructor(chat, text, file, others = {}) {
        super(chat, text, file);
        this.type = rompot_base_1.MessageType.File;
        (0, Generic_1.injectJSON)(others, this);
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