"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Client_1 = __importDefault(require("./Client"));
const WhatsAppBot_1 = __importDefault(require("../wa/WhatsAppBot"));
function BotBase() {
    return new Client_1.default(new WhatsAppBot_1.default());
}
exports.default = BotBase;
//# sourceMappingURL=BotBase.js.map