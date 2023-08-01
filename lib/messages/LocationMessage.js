"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const rompot_base_1 = require("rompot-base");
const Message_1 = __importDefault(require("./Message"));
const Generic_1 = require("../utils/Generic");
class LocationMessage extends Message_1.default {
    constructor(chat, latitude, longitude, others = {}) {
        super(chat, "");
        this.type = rompot_base_1.MessageType.Location;
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