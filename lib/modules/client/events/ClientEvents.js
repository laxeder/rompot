"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = __importDefault(require("events"));
class ClientEvents {
    constructor() {
        this.ev = new events_1.default();
        this.on("close", () => {
            this.emit("conn", { action: "close" });
        });
        this.on("open", (update) => {
            this.emit("conn", { action: "open", isNewLogin: update.isNewLogin });
        });
        this.on("qr", (qr) => {
            this.emit("conn", { action: "qr", qr });
        });
        this.on("stop", () => {
            this.emit("conn", { action: "stop" });
        });
        this.on("reconnecting", () => {
            this.emit("conn", { action: "reconnecting" });
        });
        this.on("connecting", () => {
            this.emit("conn", { action: "connecting" });
        });
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
exports.default = ClientEvents;
//# sourceMappingURL=ClientEvents.js.map