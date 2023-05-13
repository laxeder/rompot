"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WAMessage = exports.WAChat = exports.WAUser = void 0;
const Message_1 = __importDefault(require("../messages/Message"));
const Chat_1 = __importDefault(require("../modules/Chat"));
const User_1 = __importDefault(require("../modules/User"));
const Generic_1 = require("../utils/Generic");
class WAUser extends User_1.default {
    constructor(id, name, description, profile) {
        super(id);
        this.name = name || "";
        this.description = description || "";
        this.profile = profile || Buffer.from("");
        this.isAdmin = false;
        this.isLeader = false;
    }
}
exports.WAUser = WAUser;
class WAChat extends Chat_1.default {
    constructor(id, type, name, description, profile, users) {
        super(id, type);
        /** * Usuários da sala de bate-papo */
        this.users = {};
        this.name = name || "";
        this.description = description || "";
        this.profile = profile || Buffer.from("");
        this.users = users || {};
    }
}
exports.WAChat = WAChat;
class WAMessage extends Message_1.default {
    constructor(chat, text, others) {
        super(chat, text);
        (0, Generic_1.injectJSON)(others, this);
    }
}
exports.WAMessage = WAMessage;
//# sourceMappingURL=WAModules.js.map