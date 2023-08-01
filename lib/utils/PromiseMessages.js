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
class PromiseMessages {
    constructor(promisses = {}) {
        this.promisses = {};
        this.promisses = promisses;
    }
    addPromiseMessage(chatId, config) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.promisses.hasOwnProperty(chatId)) {
                this.promisses[chatId] = [];
            }
            return new Promise((resolve) => {
                this.promisses[chatId].push({
                    stopRead: !!config.stopRead,
                    ignoreMessageFromMe: !!config.ignoreMessageFromMe,
                    ignoreMessages: config.ignoreMessages || [],
                    resolve,
                });
            });
        });
    }
    resolvePromiseMessages(message) {
        const chatId = message.chat.id;
        var stop = false;
        if (!!!chatId || !this.promisses.hasOwnProperty(chatId))
            return stop;
        this.promisses[chatId].forEach((prom, index) => {
            if (message.fromMe && prom.ignoreMessageFromMe)
                return;
            let cont = true;
            for (const m of prom.ignoreMessages) {
                if (m.id == message.id) {
                    cont = false;
                    break;
                }
            }
            if (!cont)
                return;
            prom.resolve(message);
            this.promisses[chatId].splice(index, 1);
            if (prom.stopRead)
                stop = true;
        });
        return stop;
    }
}
exports.default = PromiseMessages;
//# sourceMappingURL=PromiseMessages.js.map