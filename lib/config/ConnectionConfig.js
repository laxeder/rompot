"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefaultConnectionConfig = void 0;
const CommandConfig_1 = require("./CommandConfig");
exports.DefaultConnectionConfig = {
    commandConfig: CommandConfig_1.DefaultCommandConfig,
    disableAutoCommand: false,
    disableAutoTyping: false,
    disableAutoRead: false,
    maxReconnectTimes: 12,
    reconnectTimeout: 1000,
};
//# sourceMappingURL=ConnectionConfig.js.map