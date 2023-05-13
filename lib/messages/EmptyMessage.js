"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Message_1 = require("../enums/Message");
const Message_2 = __importDefault(require("./Message"));
class EmptyMessage extends Message_2.default {
    constructor() {
        super("", "");
        this.type = Message_1.MessageType.Empty;
    }
}
exports.default = EmptyMessage;
//# sourceMappingURL=EmptyMessage.js.map