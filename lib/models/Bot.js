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
const Commands_1 = require("./Commands");
const Message_1 = require("../messages/Message");
const Emmiter_1 = require("../utils/Emmiter");
const Status_1 = require("./Status");
const PubSub_1 = require("../utils/PubSub");
class Bot extends Emmiter_1.Emmiter {
    constructor(commands) {
        super();
        this.pb = new PubSub_1.PubSub();
        this._awaitMessages = {};
        this._autoMessages = {};
        this.status = new Status_1.Status("offline");
        this.config = {};
        this.id = "";
        if (commands) {
            this.setCommands(commands);
        }
        this.on("message", (message) => {
            if (message.fromMe && !this.config.autoRunBotCommand)
                return;
            if (!message.fromMe && this.config.disableAutoCommand)
                return;
            const command = this.getCommand(message.text);
            if (command)
                command.execute(message);
        });
        this.on("me", (message) => {
            if (!this.config.autoRunBotCommand || this.config.receiveAllMessages)
                return;
            const command = this.getCommand(message.text);
            if (command)
                command.execute(message);
        });
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
        return commands.getCommand(cmd);
    }
    /**
     * * Retorna os comandos do bot
     * @returns
     */
    getCommands() {
        if (!this._commands) {
            this._commands = new Commands_1.Commands({});
            this._commands.setBot(this);
        }
        return this._commands;
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
            this.pb.sub(() => __awaiter(this, void 0, void 0, function* () {
                try {
                    resolve(yield fn());
                }
                catch (e) {
                    this.emit("error", e);
                    reject(e);
                }
            }));
        });
    }
    /**
     * * Aguarda uma mensagem ser recebida em uma sala de bate-papo
     * @param chat chat que aguardará a mensagem
     * @param ignoreBot ignorar mensagem do bot
     * @param stopRead para de fazer a leitura da mensagem
     * @returns
     */
    awaitMessage(chat, stopRead = true, ignoreBot = true) {
        return new Promise((resolve, reject) => {
            try {
                if (!this._awaitMessages[chat.id]) {
                    this._awaitMessages[chat.id] = [{ ignoreBot, stopRead, callback: resolve }];
                }
                else {
                    this._awaitMessages[chat.id].push({ ignoreBot, stopRead, callback: resolve });
                }
            }
            catch (e) {
                this.emit("error", e);
                reject(e);
            }
        });
    }
    /**
     * * Responde as mensagens que estão em aguarde
     * @param message mensagem do chat que aguarda as mensagens
     * @returns
     */
    sendAwaitMessages(message) {
        var stop = false;
        if (this._awaitMessages[message.chat.id]) {
            this._awaitMessages[message.chat.id].forEach((value, index) => {
                if (!message.fromMe || (message.fromMe && !value.ignoreBot)) {
                    value === null || value === void 0 ? void 0 : value.callback(message);
                    this._awaitMessages[message.chat.id].splice(index, 1);
                    if (value.stopRead)
                        stop = true;
                }
            });
        }
        return stop;
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
    addAutomate(message, timeout, chats, id = String(Date.now())) {
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
    //! ****************** Bot functions ******************
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