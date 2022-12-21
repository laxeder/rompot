"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Emmiter = void 0;
const events_1 = __importDefault(require("events"));
class Emmiter {
    constructor() {
        this.events = new events_1.default();
        this.on("close", (update) => {
            this.emit("conn", { action: "close", status: update.status });
        });
        this.on("open", (update) => {
            this.emit("conn", { action: "open", status: update.status, isNewLogin: update.isNewLogin });
        });
        this.on("qr", (qr) => {
            this.emit("conn", { action: "qr", status: "offline", qr });
        });
        this.on("closed", (update) => {
            this.emit("conn", { action: "closed", status: update.status });
        });
        this.on("reconnecting", (update) => {
            this.emit("conn", { action: "reconnecting", status: update.status });
        });
        this.on("connecting", (update) => {
            this.emit("conn", { action: "qr", status: update.status });
        });
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
exports.Emmiter = Emmiter;
//# sourceMappingURL=Emmiter.js.map