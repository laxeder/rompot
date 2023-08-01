"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const BotBase_1 = __importDefault(require("../../bot/models/BotBase"));
const Client_1 = __importDefault(require("./Client"));
function ClientBase() {
    return new Client_1.default(new BotBase_1.default());
}
exports.default = ClientBase;
//# sourceMappingURL=ClientBase.js.map