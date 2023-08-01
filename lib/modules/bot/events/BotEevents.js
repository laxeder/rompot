"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = require("events");
class BotEvents {
    constructor() {
        this.ev = new events_1.EventEmitter();
    }
    on(eventName, listener) {
        this.ev.on(eventName, listener);
    }
    off(eventName, listener) {
        this.ev.off(eventName, listener);
    }
    removeAllListeners(event) {
        this.ev.removeAllListeners(event);
    }
    emit(eventName, arg) {
        return this.ev.emit(eventName, arg);
    }
}
exports.default = BotEvents;
//# sourceMappingURL=BotEevents.js.map