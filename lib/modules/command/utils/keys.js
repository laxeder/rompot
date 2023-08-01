"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CMDKeyExact = exports.CMDKey = exports.CommandKeyExact = void 0;
const rompot_base_1 = require("rompot-base");
const CommandKey_1 = __importDefault(require("../../command/models/CommandKey"));
/** Chave do comando exata */
class CommandKeyExact extends CommandKey_1.default {
    constructor() {
        super(...arguments);
        this.type = rompot_base_1.CMDKeyType.Exact;
    }
}
exports.CommandKeyExact = CommandKeyExact;
/** Chave do comando */
function CMDKey(...values) {
    return new CommandKey_1.default(...values);
}
exports.CMDKey = CMDKey;
/** Chave exata do comando */
function CMDKeyExact(...values) {
    return new CommandKeyExact(...values);
}
exports.CMDKeyExact = CMDKeyExact;
//# sourceMappingURL=keys.js.map