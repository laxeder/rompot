"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = __importDefault(require("events"));
const client_1 = require("../../client");
class CommandControllerEvent extends client_1.ClientModule {
    constructor() {
        super(...arguments);
        this.ev = new events_1.default();
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
exports.default = CommandControllerEvent;
//# sourceMappingURL=CommandControllerEvent.js.map