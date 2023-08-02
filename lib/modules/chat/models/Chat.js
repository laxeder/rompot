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
const ClientModule_1 = __importDefault(require("../../client/models/ClientModule"));
const UserUtils_1 = __importDefault(require("../../user/utils/UserUtils"));
const MessageUtils_1 = __importDefault(require("../../../utils/MessageUtils"));
class Chat extends ClientModule_1.default {
    constructor(id, type, name) {
        super();
        this.id = "";
        this.type = "pv";
        this.name = "";
        this.id = id || "";
        this.type = type || "pv";
        this.name = name || "";
    }
    getName() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.client.getChatName(this);
        });
    }
    setName(name) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.client.setChatName(this, name);
        });
    }
    getDescription() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.client.getChatDescription(this);
        });
    }
    setDescription(description) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.client.setChatDescription(this, description);
        });
    }
    getProfile() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.client.getChatProfile(this);
        });
    }
    setProfile(image) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.client.setChatProfile(this, image);
        });
    }
    isAdmin(user) {
        return __awaiter(this, void 0, void 0, function* () {
            const admins = yield this.client.getChatAdmins(this);
            return admins.hasOwnProperty(UserUtils_1.default.getId(user));
        });
    }
    isLeader(user) {
        return __awaiter(this, void 0, void 0, function* () {
            const leader = yield this.client.getChatLeader(this);
            return leader.id == UserUtils_1.default.getId(user);
        });
    }
    getAdmins() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.client.getChatAdmins(this);
        });
    }
    getUsers() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.client.getChatUsers(this);
        });
    }
    addUser(user) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.client.addUserInChat(this, user);
        });
    }
    removeUser(user) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.client.removeUserInChat(this, user);
        });
    }
    promote(user) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.client.promoteUserInChat(this, user);
        });
    }
    demote(user) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.client.demoteUserInChat(this, user);
        });
    }
    leave() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.client.leaveChat(this);
        });
    }
    send(message) {
        return __awaiter(this, void 0, void 0, function* () {
            const msg = MessageUtils_1.default.get(message);
            if (!msg.chat.id)
                msg.chat.id = this.id;
            if (!msg.user.id)
                msg.user.id = this.client.id;
            return this.client.send(msg);
        });
    }
    changeStatus(status) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.client.changeChatStatus(this, status);
        });
    }
}
exports.default = Chat;
//# sourceMappingURL=Chat.js.map