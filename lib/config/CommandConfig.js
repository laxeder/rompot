"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefaultCommandConfig = void 0;
const Generic_1 = require("../utils/Generic");
exports.DefaultCommandConfig = {
    get(command, commands, ...args) {
        var cmdResult = null;
        for (const cmd of commands) {
            let msg = command;
            const textLow = msg.toLowerCase();
            if (!!cmd.prefix) {
                if (!textLow.includes(cmd.prefix.toLowerCase()))
                    continue;
                msg = (0, Generic_1.replaceCommandTag)(cmd.prefix, msg);
            }
            let isCMD = true;
            for (const index in cmd.tags) {
                const tag = cmd.tags[index];
                if (!textLow.includes(tag.toLowerCase())) {
                    if (cmd.reqTags <= 0 || cmd.reqTags > Number(index)) {
                        isCMD = false;
                    }
                    break;
                }
                msg = (0, Generic_1.replaceCommandTag)(tag, msg);
            }
            if (isCMD) {
                cmdResult = cmd;
                break;
            }
        }
        if (!!cmdResult)
            return cmdResult;
        return null;
    },
};
//# sourceMappingURL=CommandConfig.js.map