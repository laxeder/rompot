"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = exports.loggerConfig = exports.defaultConfig = void 0;
const pino_1 = __importDefault(require("pino"));
const pino_pretty_1 = __importDefault(require("pino-pretty"));
exports.defaultConfig = (0, pino_pretty_1.default)({
    ignore: "pid,hostname",
    translateTime: true,
    levelFirst: true,
    colorize: true,
});
const loggerConfig = (options = exports.defaultConfig) => (0, pino_1.default)(options);
exports.loggerConfig = loggerConfig;
exports.logger = (0, pino_1.default)(exports.defaultConfig);
//# sourceMappingURL=logger.js.map