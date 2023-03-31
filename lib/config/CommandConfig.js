"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefaultCommandConfig = void 0;
exports.DefaultCommandConfig = {
    get(command, commands, ...args) {
        var cmdResult = null;
        const replaceTag = (tag, msg) => msg.replace(msg.slice(msg.indexOf(tag), tag.length), "");
        for (const cmd of commands) {
            let msg = command;
            if (!!cmd.prefix) {
                if (!msg.includes(cmd.prefix))
                    continue;
                msg = replaceTag(cmd.prefix, msg);
            }
            let isCMD = true;
            for (const index in cmd.tags) {
                const tag = cmd.tags[index];
                if (!msg.includes(tag)) {
                    if (cmd.reqTags <= 0 || cmd.reqTags > Number(index)) {
                        isCMD = false;
                    }
                    break;
                }
                msg = replaceTag(tag, msg);
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