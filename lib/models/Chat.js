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
const User_1 = require("./User");
var bot;
class Chat {
    constructor(id, name, description, type) {
        this.members = {};
        this.id = id;
        this.name = name || "";
        this.description = description || "";
        this.type = type || "pv";
    }
    /**
     * * Define o nome da sala de bate-papo
     * @param name
     */
    setName(name) {
        return __awaiter(this, void 0, void 0, function* () {
            this.name = name;
            yield (bot === null || bot === void 0 ? void 0 : bot.setChatName(this, name));
        });
    }
    /**
     * * Define a descrição da sala de bate-papo
     * @param desc
     */
    setDescription(desc) {
        return __awaiter(this, void 0, void 0, function* () {
            this.description = this.description;
            yield (bot === null || bot === void 0 ? void 0 : bot.setDescription(desc, this));
        });
    }
    /**
     * * Define o bot da sala de bate-papo
     * @param bot
     */
    setBot(bot) {
        bot = bot;
    }
    /**
     * * Retorna o bot da sala de bate-papo
     * @returns
     */
    getBot() {
        return bot;
    }
    /**
     * * Adiciona um novo membro a sala de bate-papo
     * @param member
     */
    addMember(member) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!(member instanceof User_1.User))
                member = new User_1.User(`${member}`);
            yield (bot === null || bot === void 0 ? void 0 : bot.addMember(this, member));
            this.members[member.id] = member;
        });
    }
    /**
     * * Remove um membro da sala de bate-papo
     * @param member
     * @returns
     */
    removeMember(member) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!(member instanceof User_1.User))
                member = new User_1.User(`${member}`);
            yield (bot === null || bot === void 0 ? void 0 : bot.removeMember(this, member));
            delete this.members[member.id];
        });
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
     * * Retorna a imagem do chat
     * @returns
     */
    getProfile() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield (bot === null || bot === void 0 ? void 0 : bot.getProfile(this));
        });
    }
    /**
     * * Define a imagem da sala de bate-papo
     * @param image
     */
    setProfile(image) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield (bot === null || bot === void 0 ? void 0 : bot.setProfile(image, this));
        });
    }
    /**
     * * Sai da sala de bate-papo
     * @returns
     */
    leave() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield (bot === null || bot === void 0 ? void 0 : bot.leaveChat(this));
        });
    }
}
exports.Chat = Chat;
//# sourceMappingURL=Chat.js.map