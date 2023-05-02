"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Message_1 = __importDefault(require("./Message"));
class EmptyMessage extends Message_1.default {
    constructor() {
        super("", "");
    }
}
exports.default = EmptyMessage;
//# sourceMappingURL=EmptyMessage.js.map