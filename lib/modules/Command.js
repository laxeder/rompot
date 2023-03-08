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
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _Command_client;
Object.defineProperty(exports, "__esModule", { value: true });
const BotBase_1 = __importDefault(require("./BotBase"));
class Command {
    constructor() {
        this.tags = [];
        this.prefix = "";
        this.name = "";
        this.description = "";
        this.categories = [];
        this.permissions = [];
        _Command_client.set(this, (0, BotBase_1.default)());
    }
    get client() {
        return __classPrivateFieldGet(this, _Command_client, "f");
    }
    set client(c) {
        __classPrivateFieldSet(this, _Command_client, c, "f");
    }
    execute(message) {
        return __awaiter(this, void 0, void 0, function* () { });
    }
    response(message) {
        return __awaiter(this, void 0, void 0, function* () { });
    }
    help(message) {
        return __awaiter(this, void 0, void 0, function* () { });
    }
}
exports.default = Command;
_Command_client = new WeakMap();
//# sourceMappingURL=Command.js.map