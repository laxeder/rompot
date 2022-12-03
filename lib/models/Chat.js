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
exports.Chat = void 0;
class Chat {
    constructor(id, name, isOld) {
        this.members = {};
        this.type = "pv";
        this.id = id;
        if (name)
            this.name = name;
        if (isOld)
            this.isOld = isOld;
    }
    /**
     * * Define o ID da sala de bate-papo
     * @param id
     */
    setId(id) {
        this.id = id;
    }
    /**
     * * Define o nome da sala de bate-papo
     * @param name
     */
    setName(name) {
        this.name = name;
    }
    /**
     * * Define se é uma nova sala de bate-papo
     * @param isOld
     */
    setIsOld(isOld) {
        this.isOld = isOld;
    }
    /**
     * * Retorna o ID da sala de bate-papo
     * @returns
     */
    getId() {
        return this.id;
    }
    /**
     * * Retorna o nome da sala de bate-papo
     * @returns
     */
    getName() {
        return this.name;
    }
    /**
     * * Retorna se é uma nova sala de bate-papo
     * @returns
     */
    getIsOld() {
        return this.isOld || false;
    }
    /**
     * * Define o bot da sala de bate-papo
     * @param bot
     */
    setBot(bot) {
        this._bot = bot;
    }
    /**
     * * Retorna o bot da sala de bate-papo
     * @returns
     */
    getBot() {
        return this._bot;
    }
    /**
     * * Adiciona um novo membro a sala de bate-papo
     * @param external
     * @param member
     */
    addMember(member, external = true) {
        return __awaiter(this, void 0, void 0, function* () {
            if (external && this._bot) {
                yield this._bot.addMember(this, member);
            }
            this.members[member.id] = member;
        });
    }
    /**
     * * Remove um membro da sala de bate-papo
     * @param member
     * @param external
     * @returns
     */
    removeMember(member, external = true) {
        return __awaiter(this, void 0, void 0, function* () {
            if (external && this._bot) {
                yield this._bot.removeMember(this, member);
            }
            delete this.members[member.id];
        });
    }
    /**
     * * Define os membros da sala de bate-papo
     * @param members
     */
    setMembers(members) {
        this.members = members;
    }
    /**
     * * Retorna os membros da sala de bate-papo
     * @returns
     */
    getMembers() {
        return this.members;
    }
    /**
     * * Retorna um membro da sala de bate-papo
     * @param member
     * @returns
     */
    getMember(member) {
        return this.members[member.id];
    }
    /**
     * * Definir tipo da sala de bate-papo
     * @param type
     */
    setType(type) {
        this.type = type;
    }
    /**
     * * Retorna o tipo da sala de bate-papo
     * @returns
     */
    getType() {
        return this.type;
    }
}
exports.Chat = Chat;
//# sourceMappingURL=Chat.js.map