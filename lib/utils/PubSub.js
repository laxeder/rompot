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
exports.PubSub = void 0;
class PubSub {
    constructor() {
        this.observers = [];
    }
    sub(callback) {
        this.observers.push(callback);
        if (this.observers.length > 1)
            return;
        return this.pub();
    }
    unsub(index) {
        this.observers.splice(index, 1);
        if (this.observers.length > 0)
            this.pub(index + 1);
    }
    getSub(index) {
        return this.observers[index];
    }
    pub(...args) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.observers.length <= 0)
                return;
            const result = yield this.observers[0](...args);
            this.unsub(0);
            return result;
        });
    }
}
exports.PubSub = PubSub;
//# sourceMappingURL=PubSub.js.map