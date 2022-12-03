"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseBot = void 0;
const rxjs_1 = require("rxjs");
const Status_1 = require("../models/Status");
class BaseBot {
    constructor() {
        this.events = {
            connection: new rxjs_1.BehaviorSubject({}),
            "bot-message": new rxjs_1.Subject(),
            message: new rxjs_1.Subject(),
            member: new rxjs_1.Subject(),
            chat: new rxjs_1.Subject(),
            error: new rxjs_1.Subject(),
        };
        this.status = new Status_1.Status("offline");
        this.user = {};
    }
    send(message) {
        return __awaiter(this, void 0, void 0, function* () { });
    }
    connect(auth, config) {
        return __awaiter(this, void 0, void 0, function* () { });
    }
    reconnect(config) {
        return __awaiter(this, void 0, void 0, function* () { });
    }
    stop(reason) {
        return __awaiter(this, void 0, void 0, function* () { });
    }
    getChat(id) {
        return __awaiter(this, void 0, void 0, function* () { });
    }
    setChat(chat) {
        return __awaiter(this, void 0, void 0, function* () { });
    }
    getChats() {
        return __awaiter(this, void 0, void 0, function* () { });
    }
    setChats(chat) {
        return __awaiter(this, void 0, void 0, function* () { });
    }
    removeChat(id) {
        return __awaiter(this, void 0, void 0, function* () { });
    }
    addMember(chat, user) {
        return __awaiter(this, void 0, void 0, function* () { });
    }
    removeMember(chat, user) {
        return __awaiter(this, void 0, void 0, function* () { });
    }
    /**
     * * Adiciona um evento
     * @param eventName
     * @param event
     * @returns
     */
    on(eventName, event, pipe) {
        const error = (0, rxjs_1.catchError)((err) => {
            this.events.error.next(err);
            return (0, rxjs_1.of)("Error in event");
        });
        if (!!!pipe)
            return this.events[eventName].pipe(error).subscribe(event);
        return this.events[eventName].pipe(pipe, error).subscribe(event);
    }
}
exports.BaseBot = BaseBot;
//# sourceMappingURL=BaseBot.js.map