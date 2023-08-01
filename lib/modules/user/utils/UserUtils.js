"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const User_1 = __importDefault(require("../../user/models/User"));
class UserUtils {
    /**
     * @param user Usuário que será obtido
     * @returns Retorna o usuário
     */
    static get(user) {
        if (typeof user == "string") {
            return new User_1.default(user);
        }
        return user;
    }
    /**
     * @param user Usuário
     * @returns Retorna o ID do usuário
     */
    static getId(user) {
        if (typeof user == "string") {
            return String(user || "");
        }
        if (typeof user == "object" && !Array.isArray(user) && (user === null || user === void 0 ? void 0 : user.id)) {
            return String(user.id);
        }
        return String(user || "");
    }
    /**
     * * Cria um usuário com cliente instanciado
     * @param client Cliente
     * @param user Usuário
     * @returns
     */
    static applyClient(client, user) {
        if (typeof user == "string")
            return this.applyClient(client, new User_1.default(user));
        user.client = client;
        return user;
    }
}
exports.default = UserUtils;
//# sourceMappingURL=UserUtils.js.map