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
const Base_1 = require("./Base");
const Generic_1 = require("../utils/Generic");
class User {
    constructor(id, name, description, profile) {
        this.client = (0, Base_1.ClientBase)();
        this.id = id || "";
        this.name = name || "";
        this.description = description || "";
        this.profile = profile || Buffer.from("");
        this.isAdmin = false;
        this.isLeader = false;
    }
    blockUser() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.client.blockUser(this);
        });
    }
    unblockUser() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.client.unblockUser(this);
        });
    }
    getName() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.client.getUserName(this);
        });
    }
    setName(name) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.client.setUserName(this, name);
        });
    }
    getDescription() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.client.getUserDescription(this);
        });
    }
    setDescription(description) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.client.setUserDescription(this, description);
        });
    }
    getProfile() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.client.getUserProfile(this);
        });
    }
    setProfile(image) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.client.setUserProfile(this, image);
        });
    }
    IsAdmin(chat) {
        return __awaiter(this, void 0, void 0, function* () {
            const chatId = (0, Generic_1.getChatId)(chat);
            const admins = yield this.client.getChatAdmins(chatId);
            return admins.hasOwnProperty(this.id);
        });
    }
    IsLeader(chat) {
        return __awaiter(this, void 0, void 0, function* () {
            const chatId = (0, Generic_1.getChatId)(chat);
            const leader = yield this.client.getChatLeader(chatId);
            return leader.id == this.id;
        });
    }
}
exports.default = User;
//# sourceMappingURL=User.js.map