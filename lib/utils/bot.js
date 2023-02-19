"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setBotProperty = void 0;
function setBotProperty(bot, obj) {
    Object.defineProperty(obj, "bot", {
        get: () => bot,
        set: (value) => (bot = value),
    });
}
exports.setBotProperty = setBotProperty;
//# sourceMappingURL=bot.js.map