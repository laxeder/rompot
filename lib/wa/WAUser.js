"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const User_1 = __importDefault(require("../modules/User"));
class WAUser extends User_1.default {
    constructor(id, name, description, profile) {
        super(id);
        /** * Nome do usuário */
        this.name = "";
        /** * Descrição do usuário */
        this.description = "";
        /** * É admin da sala de bate-papo*/
        this.isAdmin = false;
        /** * É líder da sala de bate-papo */
        this.isLeader = false;
        this.name = name || "";
        this.description = description || "";
        this.profile = profile || Buffer.from("");
    }
}
exports.default = WAUser;
//# sourceMappingURL=WAUser.js.map