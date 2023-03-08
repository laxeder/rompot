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
const Generic_1 = require("@utils/Generic");
class Chat {
    constructor(id, type, name, description, profile, users, status) {
        this.users = {};
        this.client = (0, BotBase_1.default)();
        this.id = id || "";
        this.type = type || "pv";
        this.name = name || "";
        this.description = description || "";
        this.profile = profile || Buffer.from("");
        this.status = status || "offline";
        for (const id in users) {
            this.users[id] = (0, Generic_1.UserClient)(this.client, users[id]);
        }
    }
    setName(name) {
        return __awaiter(this, void 0, void 0, function* () {
            this.name = name;
            yield this.client.setChatName(this, name);
        });
    }
    getName() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.client.getChatName(this);
        });
    }
    getDescription() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.client.getChatDescription(this);
        });
    }
    setDescription(description) {
        return __awaiter(this, void 0, void 0, function* () {
            this.description = description;
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
            this.profile = image;
            return this.client.setChatProfile(this, image);
        });
    }
    IsAdmin(user) {
        return __awaiter(this, void 0, void 0, function* () {
            const admins = yield this.client.getChatAdmins(this);
            return admins.hasOwnProperty((0, Generic_1.getUserId)(user));
        });
    }
    IsLeader(user) {
        return __awaiter(this, void 0, void 0, function* () {
            const leader = yield this.client.getChatLeader(this);
            return leader.id == (0, Generic_1.getUserId)(user);
        });
    }
    getAdmins() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.client.getChatAdmins(this);
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
            return this.client.demoteUserInChat(this, (0, Generic_1.getUser)(user));
        });
    }
    leave() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.client.leaveChat(this);
        });
    }
    send(message) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.client.send((0, Generic_1.getMessage)(message));
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