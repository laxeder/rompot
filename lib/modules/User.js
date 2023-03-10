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
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _User_client;
Object.defineProperty(exports, "__esModule", { value: true });
const Base_1 = require("./Base");
const Chat_1 = __importDefault(require("./Chat"));
class User {
    constructor(id, name, description, profile) {
        _User_client.set(this, (0, Base_1.ClientBase)());
        this.id = id || "";
        this.name = name || "";
        this.description = description || "";
        this.profile = profile || Buffer.from("");
        this.isAdmin = false;
        this.isLeader = false;
    }
    get client() {
        return __classPrivateFieldGet(this, _User_client, "f");
    }
    set client(client) {
        __classPrivateFieldSet(this, _User_client, client, "f");
    }
    /** * Bloqueia o usuário */
    blockUser() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.client.blockUser(this);
        });
    }
    /** Desbloqueia o usuário */
    unblockUser() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.client.unblockUser(this);
        });
    }
    /**
     * @returns Retorna o nome do usuário
     */
    getName() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.client.getUserName(this);
        });
    }
    /**
     * * Define o nome do usuário
     * @param name Nome do usuáro
     */
    setName(name) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.client.setUserName(this, name);
        });
    }
    /**
     * @returns Retorna a descrição do usuário
     */
    getDescription() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.client.getUserDescription(this);
        });
    }
    /**
     * * Define a descrição do usuário
     * @param description Descrição do usuário
     */
    setDescription(description) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.client.setUserDescription(this, description);
        });
    }
    /**
     * @returns Retorna a imagem de perfil do usuário
     */
    getProfile() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.client.getUserProfile(this);
        });
    }
    /**
     * * Define a foto de perfil do usuário
     * @param image Foto de perfil do usuário
     */
    setProfile(image) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.client.setUserProfile(this, image);
        });
    }
    /**
     * @param chat Sala de bate-papo que está o usuário
     * @returns Retorna se o usuário é administrador daquela sala de bate-papo
     */
    IsAdmin(chat) {
        return __awaiter(this, void 0, void 0, function* () {
            const admins = yield this.client.getChatAdmins(Chat_1.default.getId(chat));
            return admins.hasOwnProperty(this.id);
        });
    }
    /**
     * @param chat Sala de bate-papo que está o usuário
     * @returns Retorna se o usuário é lider daquela sala de bate-papo
     */
    IsLeader(chat) {
        return __awaiter(this, void 0, void 0, function* () {
            const leader = yield this.client.getChatLeader(Chat_1.default.getId(chat));
            return leader.id == this.id;
        });
    }
    /**
     * @param user Usuário que será obtido
     * @returns Retorna o usuário
     */
    static get(user) {
        if (typeof user == "string") {
            return new User(user);
        }
        return user;
    }
    /**
     * @param user Usuário
     * @returns Retorna o ID do usuário
     */
    static getId(user) {
        if (typeof user == "string") {
            return String(user || "");
        }
        if (typeof user == "object" && !Array.isArray(user) && (user === null || user === void 0 ? void 0 : user.id)) {
            return String(user.id);
        }
        return String(user || "");
    }
    /**
     * * Cria um usuário com cliente instanciado
     * @param client Cliente
     * @param user Usuário
     * @returns
     */
    static Client(client, user) {
        if (typeof user == "string")
            return this.Client(client, new User(user));
        user.client = client;
        return user;
    }
}
exports.default = User;
_User_client = new WeakMap();
//# sourceMappingURL=User.js.map