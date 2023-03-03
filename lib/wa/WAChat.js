"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Chat_1 = __importDefault(require("@modules/Chat"));
class WAChat extends Chat_1.default {
    constructor(id, type, name, description, profile, users, status) {
        super(id);
        this.id = id;
        this.type = type || "pv";
        this.name = name || "";
        this.description = description || "";
        this.profile = profile || Buffer.from("");
        this.status = status || "offline";
        this.users = users || {};
    }
}
exports.default = WAChat;
//# sourceMappingURL=WAChat.js.map