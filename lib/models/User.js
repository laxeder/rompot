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
const Bot_1 = require("./Bot");
class User {
    constructor(id, name, phone, bot) {
        this.id = "";
        if (phone)
            this.phone = phone;
        if (name)
            this.name = name;
        this._bot = bot || new Bot_1.Bot();
        this.setId(id);
    }
    /**
     * * Define o ID do usuário
     * @param id
     */
    setId(id) {
        if (id.includes("@"))
            this.setPhone(id.split("@")[0]);
        this.id = id;
    }
    /**
     * * Define o nome do usuário
     * @param name
     */
    setName(name) {
        this.name = name;
    }
    /**
     * * Definir número do usuário
     * @param phone
     */
    setPhone(phone) {
        this.phone = phone;
    }
    /**
     * * Retorna o ID do usuário
     * @returns
     */
    getId() {
        return this.id || "";
    }
    /**
     * * Retorna o nome do usuário
     * @returns
     */
    getName() {
        return this.name;
    }
    /**
     * * Definir número do usuário
     * @returns
     */
    getPhone() {
        return this.phone || "";
    }
    /**
     * * Define o bot do usuário
     * @param bot
     */
    setBot(bot) {
        this._bot = bot;
    }
    /**
     * * Retorna o bot do usuário
     * @returns
     */
    getBot() {
        return this._bot;
    }
    /**
     * * Bloqueia o usuário
     */
    blockUser() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this._bot.blockUser(this);
        });
    }
    /**
     * * Desbloqueia o usuário
     */
    unblockUser() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this._bot.unblockUser(this);
        });
    }
    /**
     * * Retorna a imagem do usuário
     * @returns
     */
    getProfile() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this._bot.getProfile(this);
        });
    }
    /**
     * * Retorna a descrição do usuário
     * @returns
     */
    getDescription() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this._bot.getDescription(this);
        });
    }
    /**
     * * Define se o usuáio é admin da sala de bate-papo
     * @param admin
     */
    setAdmin(admin) {
        this.isAdmin = admin;
    }
    /**
     * * Retorna se o usuário é admin da sala de bate-papo
     * @returns
     */
    getAdmin() {
        return this.isAdmin || false;
    }
    /**
     * * Define se o usuáio é dono da sala de bate-papo
     * @param owner
     */
    setLeader(owner) {
        this.isOwner = owner;
    }
    /**
     * * Retorna se o usuário é dono da sala de bate-papo
     * @returns
     */
    getLeader() {
        return this.isOwner || false;
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