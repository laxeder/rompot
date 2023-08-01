"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CMDPerm = void 0;
const CommandPermission_1 = __importDefault(require("../../command/models/CommandPermission"));
function CMDPerm(id, isPermited) {
    return new CommandPermission_1.default(id, isPermited);
}
exports.CMDPerm = CMDPerm;
//# sourceMappingURL=perms.js.map