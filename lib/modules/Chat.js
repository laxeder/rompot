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
const Message_1 = __importDefault(require("../messages/Message"));
const BotBase_1 = __importDefault(require("./BotBase"));
const User_1 = __importDefault(require("./User"));
const bot_1 = require("../utils/bot");
class Chat {
    constructor(id, type, name, description, profile, users, status) {
        this.id = id;
        this.type = type || "pv";
        this.name = name || "";
        this.description = description || "";
        this.profile = profile || Buffer.from("");
        this.users = users || {};
        this.status = status || "offline";
    }
    get bot() {
        return new BotBase_1.default();
    }
    setName(name) {
        return __awaiter(this, void 0, void 0, function* () {
            this.name = name;
            yield this.bot.setChatName(this, name);
        });
    }
    getName() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.bot.getChatName(this);
        });
    }
    getDescription() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.bot.getChatDescription(this);
        });
    }
    setDescription(description) {
        return __awaiter(this, void 0, void 0, function* () {
            this.description = description;
            return this.bot.setChatDescription(this, description);
        });
    }
    getProfile() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.bot.getChatProfile(this);
        });
    }
    setProfile(image) {
        return __awaiter(this, void 0, void 0, function* () {
            this.profile = image;
            return this.bot.setChatProfile(this, image);
        });
    }
    IsAdmin(user) {
        return __awaiter(this, void 0, void 0, function* () {
            const admins = yield this.bot.getChatAdmins(this);
            return admins.hasOwnProperty(User_1.default.getUserId(user));
        });
    }
    IsLeader(user) {
        return __awaiter(this, void 0, void 0, function* () {
            const leader = yield this.bot.getChatLeader(this);
            return leader.id == User_1.default.getUserId(user);
        });
    }
    getAdmins() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.bot.getChatAdmins(this);
        });
    }
    addUser(user) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.bot.addUserInChat(this, user);
        });
    }
    removeUser(user) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.bot.removeUserInChat(this, user);
        });
    }
    promote(user) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.bot.promoteUserInChat(this, user);
        });
    }
    demote(user) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.bot.demoteUserInChat(this, user);
        });
    }
    leave() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.bot.leaveChat(this);
        });
    }
    send(message) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.bot.send(Message_1.default.getMessage(message));
        });
    }
    changeStatus(status) {
        return this.bot.changeChatStatus(this, status);
    }
    /**
     * @param chat Sala de bate-papo que será obtida
     * @returns Retorna a sala de bate-papo
     */
    static getChat(chat) {
        if (typeof chat == "string") {
            return new Chat(chat);
        }
        return chat;
    }
    /**
     * @param chat Sala de bate-papo
     * @returns Retorna o ID da sala de bate-papo
     */
    static getChatId(chat) {
        if (typeof chat == "string") {
            return String(chat || "");
        }
        if (typeof chat == "object" && !Array.isArray(chat) && (chat === null || chat === void 0 ? void 0 : chat.id)) {
            return String(chat.id);
        }
        return String(chat || "");
    }
    /**
     * * Injeta a interface no modulo
     * @param bot Bot que irá executar os métodos
     * @param chat Interface da sala de bate-papo
     */
    static Inject(bot, chat) {
        const module = new Chat(chat.id, chat.type, chat.name, chat.description, chat.profile);
        for (const id in chat.users) {
            const user = chat.users[id];
            if (!(user instanceof User_1.default)) {
                module.users[id] = User_1.default.Inject(bot, chat.users[id]);
            }
            else {
                module.users[id] = user;
            }
        }
        (0, bot_1.setBotProperty)(bot, module);
        return Object.assign(Object.assign({}, chat), module);
    }
}
exports.default = Chat;
//# sourceMappingURL=Chat.js.map