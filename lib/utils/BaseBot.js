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
    //!TODO: Implimentar usuários
    // public users: Users = {};
    constructor() {
        this.events = { connection: new rxjs_1.BehaviorSubject({}), messages: new rxjs_1.Subject(), chats: new rxjs_1.Subject() };
        this.status = new Status_1.Status("offline");
        this.chats = {};
        this.user = {};
        this.events.chats.subscribe((chat) => (this.chats[chat.id] = chat));
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
    /**
     * * Adiciona um evento
     * @param eventName
     * @param event
     */
    addEvent(eventName, event) {
        this.events[eventName].subscribe(event);
    }
}
exports.BaseBot = BaseBot;
//# sourceMappingURL=BaseBot.js.map