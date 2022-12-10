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
exports.Bot = void 0;
const rxjs_1 = require("rxjs");
const Commands_1 = require("./Commands");
const Message_1 = require("../messages/Message");
const Status_1 = require("./Status");
const uuidv4_1 = require("uuidv4");
class Bot {
    constructor(commands) {
        this.events = {
            connection: new rxjs_1.BehaviorSubject({}),
            "bot-message": new rxjs_1.Subject(),
            message: new rxjs_1.Subject(),
            member: new rxjs_1.Subject(),
            chat: new rxjs_1.Subject(),
            error: new rxjs_1.Subject(),
        };
        this._await = new rxjs_1.Subject();
        this._awaitObv = [];
        this._autoMessages = {};
        this.status = new Status_1.Status("offline");
        this.config = {};
        this.id = "";
        if (commands) {
            this.setCommands(commands);
        }
        this.on("message", (message) => {
            if (this.config.disableAutoCommand)
                return;
            const command = this.getCommand(message.text);
            if (command)
                command.execute(message);
        });
    }
    /**
     * * Adiciona um evento
     * @param eventName
     * @param event
     * @returns
     */
    on(eventName, event, pipe) {
        const error = (0, rxjs_1.catchError)((err) => {
            this.events.error.next(err);
            return (0, rxjs_1.of)("Error in event");
        });
        const m = (0, rxjs_1.map)((v) => {
            if (v.setBot) {
                v.setBot(this);
            }
            return v;
        });
        if (!!!pipe)
            return this.events[eventName].pipe(error, m).subscribe(event);
        return this.events[eventName].pipe(error, pipe, m).subscribe(event);
    }
    /**
     * * Define a lista de comandos
     * @param commands
     */
    setCommands(commands) {
        this._commands = commands;
        this._commands.setBot(this);
    }
    /**
     * * Retorna um comando
     * @param cmd
     * @param commands
     * @returns
     */
    getCommand(cmd, commands = this.getCommands()) {
        const text = cmd.split(/\s+/i)[0];
        const lowText = text.toLowerCase().trim();
        return commands.get([cmd, text, lowText]);
    }
    /**
     * * Retorna os comandos do bot
     * @returns
     */
    getCommands() {
        if (!this._commands) {
            this._commands = new Commands_1.Commands({}, this);
        }
        return this._commands;
    }
    /**
     * * Retorna o status do bot
     * @returns
     */
    getStatus() {
        return this.status;
    }
    /**
     * * Envia um conteúdo
     * @param content
     * @returns
     */
    send(content) {
        return __awaiter(this, void 0, void 0, function* () {
            if (content instanceof Message_1.Message) {
                return yield this.sendMessage(content);
            }
            if (content instanceof Status_1.Status) {
                return this.sendStatus(content);
            }
        });
    }
    /**
     * * Adiciona uma chamada há uma lista de chamadas para serem chamadas
     * @param fn
     * @returns
     */
    add(fn) {
        return new Promise((resolve, reject) => {
            const observer = this._await.subscribe((obs) => __awaiter(this, void 0, void 0, function* () {
                try {
                    if (obs !== observer)
                        return;
                    try {
                        var response = yield fn();
                    }
                    catch (e) {
                        reject(e);
                    }
                    observer.unsubscribe();
                    const index = this._awaitObv.indexOf(observer);
                    this._awaitObv.splice(index, 1);
                    if (this._awaitObv.length > 0) {
                        this._await.next(this._awaitObv[index]);
                    }
                    resolve(response);
                }
                catch (err) {
                    reject(err);
                }
            }));
            this._awaitObv.push(observer);
            if (this._awaitObv.length <= 1) {
                this._await.next(observer);
            }
        });
    }
    /**
     * * Cria um tempo de espera
     * @param timeout
     * @returns
     */
    sleep(timeout = 1000) {
        return new Promise((resolve) => setTimeout(resolve, timeout));
    }
    /**
     * * Automotiza uma mensagem
     * @param message
     * @param timeout
     * @param chats
     * @param id
     * @returns
     */
    addAutomate(message, timeout, chats, id = (0, uuidv4_1.uuid)()) {
        return __awaiter(this, void 0, void 0, function* () {
            const now = Date.now();
            // Criar e atualizar dados da mensagem automatizada
            this._autoMessages[id] = { id, chats: chats || (yield this.getChats()), updatedAt: now, message };
            // Aguarda o tempo definido
            yield this.sleep(timeout - now);
            // Cancelar se estiver desatualizado
            if (this._autoMessages[id].updatedAt !== now)
                return;
            yield Promise.all(this._autoMessages[id].chats.map((chat) => __awaiter(this, void 0, void 0, function* () {
                var _a;
                const automated = this._autoMessages[id];
                if (automated.updatedAt !== now)
                    return;
                (_a = automated.message) === null || _a === void 0 ? void 0 : _a.setChat(chat);
                // Enviar mensagem
                yield this.send(automated.message);
                // Remover sala de bate-papo da mensagem
                const nowChats = automated.chats;
                const index = nowChats.indexOf(automated.chats[chat.id]);
                this._autoMessages[id].chats = nowChats.splice(index + 1, nowChats.length);
            })));
        });
    }
    /**
     * * Retorna o ID do bot
     * @returns
     */
    getId() {
        return this.id;
    }
    /**
     * * Define o ID do bot
     * @param id
     */
    setId(id) {
        this.id = id;
    }
    sendMessage(message) {
        return __awaiter(this, void 0, void 0, function* () {
            return message;
        });
    }
    sendStatus(status) {
        return __awaiter(this, void 0, void 0, function* () { });
    }
    connect(auth, config) {
        return __awaiter(this, void 0, void 0, function* () { });
    }
    reconnect(config) {
        return __awaiter(this, void 0, void 0, function* () { });
    }
    stop(reason) {
        return __awaiter(this, void 0, void 0, function* () { });
    }
    getChat(id) {
        return __awaiter(this, void 0, void 0, function* () { });
    }
    setChat(chat) {
        return __awaiter(this, void 0, void 0, function* () { });
    }
    getChats() {
        return __awaiter(this, void 0, void 0, function* () { });
    }
    setChats(chat) {
        return __awaiter(this, void 0, void 0, function* () { });
    }
    removeChat(id) {
        return __awaiter(this, void 0, void 0, function* () { });
    }
    addMember(chat, user) {
        return __awaiter(this, void 0, void 0, function* () { });
    }
    removeMember(chat, user) {
        return __awaiter(this, void 0, void 0, function* () { });
    }
    deleteMessage(message) {
        return __awaiter(this, void 0, void 0, function* () { });
    }
    removeMessage(message) {
        return __awaiter(this, void 0, void 0, function* () { });
    }
    deleteChat(message) {
        return __awaiter(this, void 0, void 0, function* () { });
    }
    setDescription(desc, id) {
        return __awaiter(this, void 0, void 0, function* () { });
    }
    getDescription(id) {
        return __awaiter(this, void 0, void 0, function* () { });
    }
    setChatName(id, name) {
        return __awaiter(this, void 0, void 0, function* () { });
    }
    createChat(name) {
        return __awaiter(this, void 0, void 0, function* () { });
    }
    leaveChat(chat) {
        return __awaiter(this, void 0, void 0, function* () { });
    }
    unblockUser(user) {
        return __awaiter(this, void 0, void 0, function* () { });
    }
    blockUser(user) {
        return __awaiter(this, void 0, void 0, function* () { });
    }
    setBotName(name) {
        return __awaiter(this, void 0, void 0, function* () { });
    }
    setProfile(image, id) {
        return __awaiter(this, void 0, void 0, function* () { });
    }
    getProfile(id) {
        return __awaiter(this, void 0, void 0, function* () { });
    }
}
exports.Bot = Bot;
//# sourceMappingURL=Bot.js.map