"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Message_1 = __importDefault(require("@messages/Message"));
class LocationMessage extends Message_1.default {
    constructor(chat, latitude, longitude, mention, id, user, fromMe, selected, mentions, timestamp) {
        super(chat, "", mention, id, user, fromMe, selected, mentions, timestamp);
        this.latitude = latitude;
        this.longitude = longitude;
    }
    setLocation(latitude, longitude) {
        this.latitude = latitude;
        this.longitude = longitude;
    }
}
exports.default = LocationMessage;
//# sourceMappingURL=LocationMessage.js.map