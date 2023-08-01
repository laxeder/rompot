"use strict";
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _ClientModule_clientId;
Object.defineProperty(exports, "__esModule", { value: true });
const ClientUtils_1 = __importDefault(require("../../client/utils/ClientUtils"));
class ClientModule {
    constructor(client = "") {
        _ClientModule_clientId.set(this, "");
        if (typeof client === "string") {
            __classPrivateFieldSet(this, _ClientModule_clientId, client, "f");
        }
        if (typeof client === "object") {
            __classPrivateFieldSet(this, _ClientModule_clientId, (client === null || client === void 0 ? void 0 : client.id) || "", "f");
        }
    }
    set client(client) {
        if (typeof client === "string") {
            __classPrivateFieldSet(this, _ClientModule_clientId, client, "f");
        }
        if (typeof client === "object") {
            __classPrivateFieldSet(this, _ClientModule_clientId, (client === null || client === void 0 ? void 0 : client.id) || "", "f");
        }
    }
    get client() {
        return ClientUtils_1.default.getClient(__classPrivateFieldGet(this, _ClientModule_clientId, "f"));
    }
    set clientId(clientId) {
        this.clientId = clientId;
    }
    get clientId() {
        return __classPrivateFieldGet(this, _ClientModule_clientId, "f");
    }
}
exports.default = ClientModule;
_ClientModule_clientId = new WeakMap();
//# sourceMappingURL=ClientModule.js.map