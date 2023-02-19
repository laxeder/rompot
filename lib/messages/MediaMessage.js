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
//@ts-ignore
class MediaMessage extends Message_1.default {
    constructor(chat, text, file, mention, id) {
        super(chat, text, mention, id);
        this.isGIF = false;
        this.file = file || Buffer.from(String(file || ""));
    }
    getStream(stream = this.file) {
        return __awaiter(this, void 0, void 0, function* () {
            if (Buffer.isBuffer(stream))
                return stream;
            return Buffer.from(String(stream || ""));
        });
    }
    /**
     * * Injeta a interface no modulo
     * @param bot Bot que irá executar os métodos
     * @param message Interface da mensagem
     */
    static Inject(bot, msg) {
        const module = new MediaMessage(msg.chat, msg.text, msg.file);
        module.inject(bot, msg);
        return Object.assign(Object.assign({}, msg), module);
    }
}
exports.default = MediaMessage;
//# sourceMappingURL=MediaMessage.js.map