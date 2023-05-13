"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Message_1 = require("../enums/Message");
const Message_2 = __importDefault(require("./Message"));
const Generic_1 = require("../utils/Generic");
class LocationMessage extends Message_2.default {
    constructor(chat, latitude, longitude, others = {}) {
        super(chat, "");
        this.type = Message_1.MessageType.Location;
        (0, Generic_1.injectJSON)(others, this);
        this.latitude = latitude;
        this.longitude = longitude;
    }
    /**
     * * Definir localização
     * @param latitude Latitude
     * @param longitude Longitude
     */
    setLocation(latitude, longitude) {
        this.latitude = latitude;
        this.longitude = longitude;
    }
}
exports.default = LocationMessage;
//# sourceMappingURL=LocationMessage.js.map