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
exports.User = void 0;
var bot;
class User {
    constructor(id, name = "", isAdmin = false, isLeader = false) {
        this.id = "";
        this.isAdmin = false;
        this.isLeader = false;
        this.id = id;
        this.name = name;
        this.isAdmin = isAdmin;
        this.isLeader = isLeader;
    }
    /**
     * * Define o bot do usuário
     * @param bot
     */
    setBot(bot) {
        bot = bot;
    }
    /**
     * * Retorna o bot do usuário
     * @returns
     */
    getBot() {
        return bot;
    }
    /**
     * * Bloqueia o usuário
     */
    blockUser() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield (bot === null || bot === void 0 ? void 0 : bot.blockUser(this));
        });
    }
    /**
     * * Desbloqueia o usuário
     */
    unblockUser() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield (bot === null || bot === void 0 ? void 0 : bot.unblockUser(this));
        });
    }
    /**
     * * Retorna a imagem do usuário
     * @returns
     */
    getProfile() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield (bot === null || bot === void 0 ? void 0 : bot.getProfile(this));
        });
    }
    /**
     * * Retorna a descrição do usuário
     * @returns
     */
    getDescription() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield (bot === null || bot === void 0 ? void 0 : bot.getDescription(this));
        });
    }
    /**
     * * Verifica se o usuário tem permissão
     * @param userPermissions
     * @param commandPermissions
     * @param ignore
     * @returns
     */
    checkPermissions(userPermissions, commandPermissions, ignore = []) {
        if (commandPermissions.length <= 0)
            return true;
        commandPermissions = commandPermissions.filter((p) => {
            if (ignore.includes(p))
                return true;
            return userPermissions.indexOf(p) > -1;
        });
        return commandPermissions.length <= 0;
    }
}
exports.User = User;
//# sourceMappingURL=User.js.map