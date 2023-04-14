"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientEvents = exports.BotEvents = void 0;
const events_1 = __importDefault(require("events"));
class BotEvents {
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
    /** * Emite um evento */
    emit(eventName, arg) {
        return this.events.emit(eventName, arg);
    }
}
exports.BotEvents = BotEvents;
class ClientEvents extends BotEvents {
    constructor() {
        super();
        this.on("close", () => {
            this.emit("conn", { action: "close" });
        });
        this.on("open", (update) => {
            this.emit("conn", { action: "open", isNewLogin: update.isNewLogin });
        });
        this.on("qr", (qr) => {
            this.emit("conn", { action: "qr", qr });
        });
        this.on("closed", () => {
            this.emit("conn", { action: "closed" });
        });
        this.on("reconnecting", () => {
            this.emit("conn", { action: "reconnecting" });
        });
        this.on("connecting", () => {
            this.emit("conn", { action: "connecting" });
        });
    }
}
exports.ClientEvents = ClientEvents;
//# sourceMappingURL=Emmiter.js.map