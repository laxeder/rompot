"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefaultCommandConfig = void 0;
const Command_1 = __importDefault(require("../modules/Command"));
exports.DefaultCommandConfig = {
    prefix: "",
    get(command, commands) {
        const cmds = command.split(/\s+/g);
        const cmd = commands[cmds.shift() || ""];
        if (!!cmd) {
            if (typeof cmd == "string")
                return this.get(cmds.join(" "), commands);
            if (cmd instanceof Command_1.default)
                return cmd;
        }
        return null;
    },
};
//# sourceMappingURL=CommandConfig.js.map