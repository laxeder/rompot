"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefaultCommandConfig = void 0;
exports.DefaultCommandConfig = {
    get(command, commands, ...args) {
        var cmdResult = null;
        for (const cmd of commands) {
            let msg = command;
            let isCMD = true;
            const tags = cmd.tags;
            if (!!cmd.prefix)
                tags.unshift(cmd.prefix);
            for (const tag of cmd.tags) {
                if (!msg.includes(tag)) {
                    isCMD = false;
                    break;
                }
                msg.slice(msg.indexOf(tag), tag.length);
            }
            if (isCMD) {
                cmdResult = cmd;
                break;
            }
        }
        return cmdResult;
    },
};
//# sourceMappingURL=CommandConfig.js.map