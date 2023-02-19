"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Message_1 = __importDefault(require("./Message"));
//@ts-ignore
class LocationMessage extends Message_1.default {
    constructor(chat, latitude, longitude, mention, id) {
        super(chat, "", mention, id);
        this.latitude = latitude;
        this.longitude = longitude;
    }
    setLocation(latitude, longitude) {
        this.latitude = latitude;
        this.longitude = longitude;
    }
    /**
     * * Injeta a interface no modulo
     * @param bot Bot que irá executar os métodos
     * @param message Interface da mensagem
     */
    static Inject(bot, msg) {
        const module = new LocationMessage(msg.chat, msg.latitude, msg.longitude);
        module.inject(bot, msg);
        return Object.assign(Object.assign({}, msg), module);
    }
}
exports.default = LocationMessage;
//# sourceMappingURL=LocationMessage.js.map