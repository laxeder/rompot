"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientBase = void 0;
const Base_1 = require("./Base");
const Client_1 = __importDefault(require("./Client"));
function ClientBase() {
    return new Client_1.default(new Base_1.BotBase());
}
exports.ClientBase = ClientBase;
//# sourceMappingURL=ClientBase.js.map