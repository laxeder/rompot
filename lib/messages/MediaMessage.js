"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Message_1 = __importDefault(require("./Message"));
class MediaMessage extends Message_1.default {
    constructor(chat, text, file, mention, id, user, fromMe, selected, mentions, timestamp) {
        super(chat, text, mention, id, user, fromMe, selected, mentions, timestamp);
        /** * O arquivo é um GIF */
        this.isGIF = false;
        this.file = file;
    }
    /**
     * @returns Obter arquivo
     */
    getStream(stream) {
        return __awaiter(this, void 0, void 0, function* () {
            return stream || this.file;
        });
    }
}
exports.default = MediaMessage;
//# sourceMappingURL=MediaMessage.js.map