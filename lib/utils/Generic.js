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
exports.getError = exports.getImageURL = exports.sleep = exports.UserClient = exports.ChatClient = exports.MessageClient = exports.setClientProperty = exports.getUserId = exports.getUser = exports.getChatId = exports.getChat = exports.getMessageId = exports.getMessage = void 0;
const stream_1 = require("stream");
const https_1 = __importDefault(require("https"));
const Message_1 = __importDefault(require("@messages/Message"));
const User_1 = __importDefault(require("@modules/User"));
const Chat_1 = __importDefault(require("@modules/Chat"));
/**
 * @param message Mensagem que será obtida
 * @returns Retorna a mensagem
 */
function getMessage(message) {
    if (typeof message == "string") {
        return new Message_1.default(new Chat_1.default(""), message);
    }
    return message;
}
exports.getMessage = getMessage;
/**
 * @param message Mensagem
 * @returns Retorna o ID da mensagem
 */
function getMessageId(message) {
    if (typeof message == "string") {
        return String(message || "");
    }
    if (typeof message == "object" && !Array.isArray(message) && (message === null || message === void 0 ? void 0 : message.id)) {
        return String(message.id);
    }
    return String(message || "");
}
exports.getMessageId = getMessageId;
/**
 * @param chat Sala de bate-papo que será obtida
 * @returns Retorna a sala de bate-papo
 */
function getChat(chat) {
    if (typeof chat == "string") {
        return new Chat_1.default(chat);
    }
    return chat;
}
exports.getChat = getChat;
/**
 * @param chat Sala de bate-papo
 * @returns Retorna o ID da sala de bate-papo
 */
function getChatId(chat) {
    if (typeof chat == "string") {
        return String(chat || "");
    }
    if (typeof chat == "object" && !Array.isArray(chat) && (chat === null || chat === void 0 ? void 0 : chat.id)) {
        return String(chat.id);
    }
    return String(chat || "");
}
exports.getChatId = getChatId;
/**
 * @param user Usuário que será obtido
 * @returns Retorna o usuário
 */
function getUser(user) {
    if (typeof user == "string") {
        return new User_1.default(user);
    }
    return user;
}
exports.getUser = getUser;
/**
 * @param user Usuário
 * @returns Retorna o ID do usuário
 */
function getUserId(user) {
    if (typeof user == "string") {
        return String(user || "");
    }
    if (typeof user == "object" && !Array.isArray(user) && (user === null || user === void 0 ? void 0 : user.id)) {
        return String(user.id);
    }
    return String(user || "");
}
exports.getUserId = getUserId;
/**
 * * Define o cliente de um objeto
 * @param client
 * @param obj
 */
function setClientProperty(client, obj) {
    Object.defineProperty(obj, "client", {
        get: () => client,
        set: (value) => (client = value),
    });
}
exports.setClientProperty = setClientProperty;
/**
 * * Cria uma mensagem com cliente instanciado
 * @param client Cliente
 * @param msg Mensagem
 * @returns
 */
function MessageClient(client, msg) {
    const message = new Message_1.default(msg.chat, msg.text, msg.mention, msg.id, msg.user, msg.fromMe, msg.selected, msg.mentions, msg.timestamp);
    message.client = client;
    return Object.assign(Object.assign({}, msg), message);
}
exports.MessageClient = MessageClient;
/**
 * * Cria uma sala de bate-papo com cliente instanciado
 * @param client Cliente
 * @param chat Sala de bate-papo
 * @returns
 */
function ChatClient(client, chat) {
    const c = new Chat_1.default(chat.id, chat.type, chat.name, chat.description, chat.profile, chat.users, chat.status);
    c.client = client;
    return Object.assign(Object.assign({}, chat), c);
}
exports.ChatClient = ChatClient;
/**
 * * Cria um usuário com cliente instanciado
 * @param client Cliente
 * @param user Usuário
 * @returns
 */
function UserClient(client, user) {
    const u = new User_1.default(user.id, user.name, user.description, user.profile);
    u.client = client;
    return Object.assign(Object.assign({}, user), u);
}
exports.UserClient = UserClient;
/**
 * * Aguarda um determinado tempo
 * @param timeout
 * @returns
 */
function sleep(timeout = 1000) {
    return __awaiter(this, void 0, void 0, function* () {
        const result = timeout - 2147483647;
        if (result > 0) {
            yield new Promise((res) => setTimeout(res, 2147483647));
            yield sleep(result);
        }
        else {
            yield new Promise((res) => setTimeout(res, timeout));
        }
    });
}
exports.sleep = sleep;
/**
 * * Obtem a imagem de uma url
 * @param uri URL
 * @returns
 */
function getImageURL(uri) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!!!uri)
            return Buffer.from("");
        return new Promise((res, rej) => {
            try {
                https_1.default
                    .request(uri, (response) => {
                    var data = new stream_1.Transform();
                    response.on("data", (chunk) => data.push(chunk));
                    response.on("end", () => res(data.read()));
                })
                    .end();
            }
            catch (e) {
                res(Buffer.from(""));
            }
        });
    });
}
exports.getImageURL = getImageURL;
/**
 * @param err Erro
 * @returns Retorna um erro
 */
function getError(err) {
    if (!(err instanceof Error)) {
        err = new Error(`${err}`);
    }
    return err;
}
exports.getError = getError;
//# sourceMappingURL=Generic.js.map