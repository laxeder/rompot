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
class WaitCallBack {
    constructor() {
        this.observers = [];
    }
    /**
     * * Inscreve um onservador
     * @param callback
     * @returns
     */
    sub(callback) {
        this.observers.push(callback);
        if (this.observers.length > 1)
            return;
        return this.pub();
    }
    /**
     * * Desinscreve um observador
     * @param index
     */
    unsub(index) {
        this.observers.splice(index, 1);
        if (this.observers.length > 0)
            this.pub(index + 1);
    }
    /**
     * @param index Posição em que está escrito
     * @returns Retorna um observador
     */
    getSub(index) {
        return this.observers[index];
    }
    /**
     * * Publica aos observadores
     * @param args
     * @returns
     */
    pub(...args) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.observers.length <= 0)
                return;
            const result = yield this.observers[0](...args);
            this.unsub(0);
            return result;
        });
    }
    /**
     * * Aguarda os processos anteriores terminarem para iniciar uma nova
     * @param fn
     * @returns
     */
    waitCall(fn) {
        return new Promise((resolve, reject) => {
            this.sub(() => __awaiter(this, void 0, void 0, function* () {
                try {
                    const result = yield fn();
                    resolve(result);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
}
exports.default = WaitCallBack;
//# sourceMappingURL=WaitCallBack.js.map