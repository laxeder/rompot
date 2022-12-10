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
const Bot_1 = require("./Bot");
const User_1 = require("./User");
class Chat {
    constructor(id, name, isOld) {
        this._bot = new Bot_1.Bot();
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
    setName(name, external = false) {
        return __awaiter(this, void 0, void 0, function* () {
            this.name = name;
            if (external)
                yield this._bot.setChatName(this, name);
        });
    }
    /**
     * * Define a descrição da sala de bate-papo
     * @param desc
     */
    setDescription(desc, external = false) {
        return __awaiter(this, void 0, void 0, function* () {
            this.description = this.description;
            if (external)
                yield this._bot.setDescription(desc, this);
        });
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
     * * Retorna a descrição da sala de bate-papo
     * @returns
     */
    getDescription() {
        return this.description;
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
            if (!(member instanceof User_1.User))
                member = new User_1.User(`${member}`);
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
            if (!(member instanceof User_1.User))
                member = new User_1.User(`${member}`);
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
        if (!(member instanceof User_1.User))
            member = new User_1.User(`${member}`);
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
    /**
     * * Retorna a imagem do chat
     * @returns
     */
    getProfile() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this._bot.getProfile(this);
        });
    }
    /**
     * * Define a imagem da sala de bate-papo
     * @param image
     */
    setProfile(image) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this._bot.setProfile(image, this);
        });
    }
    /**
     * * Sai da sala de bate-papo
     * @returns
     */
    leave() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this._bot.leaveChat(this);
        });
    }
}
exports.Chat = Chat;
//# sourceMappingURL=Chat.js.map