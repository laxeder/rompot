"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommandControllerEvent = void 0;
const events_1 = __importDefault(require("events"));
class CommandControllerEvent {
    constructor() {
        this.events = new events_1.default();
    }
    on(eventName, listener) {
        this.events.on(eventName, listener);
    }
    off(eventName, listener) {
        this.events.off(eventName, listener);
    }
    removeAllListeners(event) {
        this.events.removeAllListeners(event);
    }
    emit(eventName, arg) {
        return this.events.emit(eventName, arg);
    }
}
exports.CommandControllerEvent = CommandControllerEvent;
//# sourceMappingURL=Command.js.map