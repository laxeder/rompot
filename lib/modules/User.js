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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const BotBase_1 = __importDefault(require("@modules/BotBase"));
const Chat_1 = __importDefault(require("@modules/Chat"));
const bot_1 = require("@utils/bot");
class User {
    constructor(id, name, description, profile) {
        this.id = id;
        this.name = name || "";
        this.description = description || "";
        this.profile = profile || Buffer.from("");
    }
    get bot() {
        return new BotBase_1.default();
    }
    blockUser() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.bot.blockUser(this);
        });
    }
    unblockUser() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.bot.unblockUser(this);
        });
    }
    getName() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.bot.getUserName(this);
        });
    }
    setName(name) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.bot.setUserName(this, name);
        });
    }
    getDescription() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.bot.getUserDescription(this);
        });
    }
    setDescription(description) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.bot.setUserDescription(this, description);
        });
    }
    getProfile() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.bot.getUserProfile(this);
        });
    }
    setProfile(image) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.bot.setUserProfile(this, image);
        });
    }
    IsAdmin(chat) {
        return __awaiter(this, void 0, void 0, function* () {
            const chatId = Chat_1.default.getChatId(chat);
            const admins = yield this.bot.getChatAdmins(chatId);
            return admins.hasOwnProperty(this.id);
        });
    }
    IsLeader(chat) {
        return __awaiter(this, void 0, void 0, function* () {
            const chatId = Chat_1.default.getChatId(chat);
            const leader = yield this.bot.getChatLeader(chatId);
            return leader.id == this.id;
        });
    }
    /**
     * @param user Usuário que será obtido
     * @returns Retorna o usuário
     */
    static getUser(user) {
        if (typeof user == "string") {
            return new User(user);
        }
        return user;
    }
    /**
     * @param user Usuário
     * @returns Retorna o ID do usuário
     */
    static getUserId(user) {
        if (typeof user == "string") {
            return String(user || "");
        }
        if (typeof user == "object" && !Array.isArray(user) && (user === null || user === void 0 ? void 0 : user.id)) {
            return String(user.id);
        }
        return String(user || "");
    }
    /**
     * * Injeta a interface no modulo
     * @param bot Client que irá executar os métodos
     * @param user Interface do usuário
     */
    static Inject(bot, user) {
        const userModule = new User(user.id, user.name, user.description, user.profile);
        (0, bot_1.setBotProperty)(bot, userModule);
        return Object.assign(Object.assign({}, user), userModule);
    }
}
exports.default = User;
//# sourceMappingURL=User.js.map