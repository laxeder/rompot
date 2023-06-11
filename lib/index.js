"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigWAEvents = exports.WhatsAppConvertMessage = exports.WhatsAppBot = exports.MultiFileAuthState = void 0;
const Client_1 = __importDefault(require("./modules/Client"));
const WAConvertMessage_1 = require("./wa/WAConvertMessage");
Object.defineProperty(exports, "WhatsAppConvertMessage", { enumerable: true, get: function () { return WAConvertMessage_1.WhatsAppConvertMessage; } });
const ConfigWAEvents_1 = __importDefault(require("./wa/ConfigWAEvents"));
exports.ConfigWAEvents = ConfigWAEvents_1.default;
const Auth_1 = require("./wa/Auth");
Object.defineProperty(exports, "MultiFileAuthState", { enumerable: true, get: function () { return Auth_1.MultiFileAuthState; } });
const WhatsAppBot_1 = __importDefault(require("./wa/WhatsAppBot"));
exports.WhatsAppBot = WhatsAppBot_1.default;
__exportStar(require("./config/index"), exports);
__exportStar(require("./enums/index"), exports);
__exportStar(require("./interfaces/index"), exports);
__exportStar(require("./messages/index"), exports);
__exportStar(require("./modules/index"), exports);
__exportStar(require("./utils/index"), exports);
__exportStar(require("./types"), exports);
__exportStar(require("./wa/WAModules"), exports);
__exportStar(require("./wa/WAStatus"), exports);
__exportStar(require("./wa/WAModule"), exports);
__exportStar(require("./wa/WATypes"), exports);
exports.default = Client_1.default;
//# sourceMappingURL=index.js.map