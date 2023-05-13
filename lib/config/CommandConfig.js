"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefaultCommandConfig = void 0;
const Generic_1 = require("../utils/Generic");
exports.DefaultCommandConfig = {
    get(command, commands, ...args) {
        let cmdResult = null;
        for (const cmd of commands) {
            let msg = command;
            if (!!cmd.prefix) {
                const newMsg = (0, Generic_1.replaceCommandTag)(cmd.prefix, msg);
                if (msg == newMsg)
                    continue;
                msg = newMsg;
            }
            let isCMD = false;
            for (const index in cmd.tags) {
                const tag = cmd.tags[index];
                const newMsg = (0, Generic_1.replaceCommandTag)(tag, msg);
                if (msg == newMsg) {
                    if (cmd.reqTags <= 0 || cmd.reqTags > Number(index)) {
                        isCMD = false;
                    }
                    break;
                }
                isCMD = true;
                msg = newMsg;
            }
            if (isCMD) {
                if (!!cmdResult && cmdResult.tags > cmd.tags)
                    continue;
                cmdResult = cmd;
            }
        }
        return cmdResult;
    },
};
//# sourceMappingURL=CommandConfig.js.map