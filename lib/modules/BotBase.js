"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const BotModule_1 = __importDefault(require("./BotModule"));
const WhatsAppBot_1 = __importDefault(require("../wa/WhatsAppBot"));
class BotBase extends BotModule_1.default {
    constructor() {
        super(new WhatsAppBot_1.default());
    }
}
exports.default = BotBase;
//# sourceMappingURL=BotBase.js.map