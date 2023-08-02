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
class User extends ClientModule_1.default {
    constructor(id, name) {
        super();
        this.name = "";
        this.id = "";
        this.id = id || "";
        this.name = name || "";
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
    isAdmin(chat) {
        return __awaiter(this, void 0, void 0, function* () {
            const admins = yield this.client.getChatAdmins(chat);
            return admins.hasOwnProperty(this.id);
        });
    }
    isLeader(chat) {
        return __awaiter(this, void 0, void 0, function* () {
            const leader = yield this.client.getChatLeader(chat);
            return leader.id == this.id;
        });
    }
}
exports.default = User;
//# sourceMappingURL=User.js.map