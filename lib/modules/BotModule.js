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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _BotModule_promiseMessages, _BotModule_autoMessages;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BuildBot = void 0;
const ConnectionConfig_1 = require("@config/ConnectionConfig");
const LocationMessage_1 = __importDefault(require("@messages/LocationMessage"));
const ContactMessage_1 = __importDefault(require("@messages/ContactMessage"));
const ButtonMessage_1 = __importDefault(require("@messages/ButtonMessage"));
const MediaMessage_1 = __importDefault(require("@messages/MediaMessage"));
const VideoMessage_1 = __importDefault(require("@messages/VideoMessage"));
const ImageMessage_1 = __importDefault(require("@messages/ImageMessage"));
const ListMessage_1 = __importDefault(require("@messages/ListMessage"));
const Message_1 = __importDefault(require("@messages/Message"));
const User_1 = __importDefault(require("@modules/User"));
const Chat_1 = __importDefault(require("@modules/Chat"));
const User_2 = __importDefault(require("@modules/User"));
const PromiseMessages_1 = __importDefault(require("@utils/PromiseMessages"));
const bot_1 = require("@utils/bot");
const error_1 = require("@utils/error");
const Emmiter_1 = __importDefault(require("@utils/Emmiter"));
const sleep_1 = __importDefault(require("@utils/sleep"));
const AudioMessage_1 = __importDefault(require("@messages/AudioMessage"));
class BotModule extends Emmiter_1.default {
    constructor(bot, config) {
        super();
        _BotModule_promiseMessages.set(this, new PromiseMessages_1.default());
        _BotModule_autoMessages.set(this, {});
        this.commands = [];
        this.bot = bot;
        this.config = config || ConnectionConfig_1.DefaultConnectionConfig;
        this.configEvents();
    }
    get id() {
        return this.bot.id;
    }
    /** * Configura os eventos */
    configEvents() {
        var _a, _b;
        (_a = this.bot) === null || _a === void 0 ? void 0 : _a.ev.on("message", (message) => {
            var _a;
            try {
                if (__classPrivateFieldGet(this, _BotModule_promiseMessages, "f").resolvePromiseMessages(message))
                    return;
                if (message.fromMe && this.config.disableAutoCommand)
                    return;
                if (this.config.disableAutoCommand)
                    return;
                (_a = this.config.commandConfig.get(message.text, this.commands)) === null || _a === void 0 ? void 0 : _a.execute(message);
            }
            catch (err) {
                this.emit("error", (0, error_1.getError)(err));
            }
        });
        (_b = this.bot) === null || _b === void 0 ? void 0 : _b.ev.on("me", (message) => {
            var _a;
            try {
                if (__classPrivateFieldGet(this, _BotModule_promiseMessages, "f").resolvePromiseMessages(message))
                    return;
                if (this.config.disableAutoCommand || this.config.receiveAllMessages)
                    return;
                (_a = this.getCommand(message.text)) === null || _a === void 0 ? void 0 : _a.execute(message);
            }
            catch (err) {
                this.emit("error", (0, error_1.getError)(err));
            }
        });
    }
    /**
     * * Conectar bot
     * @param auth Autenticação do bot
     */
    connect(auth) {
        return this.bot.connect(auth);
    }
    /**
     * * Reconectar bot
     * @param alert Alerta que está reconectando
     */
    reconnect(alert) {
        return this.bot.reconnect(alert);
    }
    /**
     * * Parar bot
     * @param reason Razão por parar bot
     */
    stop(reason) {
        return this.bot.stop(reason);
    }
    /**
     * * Adiciona uma reação na mensagem
     * @param message Mensagem que será reagida
     * @param reaction Reação
     */
    addReaction(message, reaction) {
        return this.bot.addReaction(Message_1.default.Inject(this, message), reaction);
    }
    /**
     * * Remove a reação da mensagem
     * @param message Mensagem que terá sua reação removida
     */
    removeReaction(message) {
        return this.bot.removeReaction(Message_1.default.Inject(this, message));
    }
    /**
     * * Deletar mensagem
     * @param message Mensagem que será deletada da sala de bate-papos
     */
    deleteMessage(message) {
        return this.bot.removeMessage(Message_1.default.Inject(this, message));
    }
    /**
     * * Remover mensagem
     * @param message Mensagem que será removida da sala de bate-papo
     */
    removeMessage(message) {
        return this.bot.removeMessage(Message_1.default.Inject(this, message));
    }
    readMessage(message) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.bot.readMessage(message);
        });
    }
    /**
     * * Envia um conteúdo
     * @param content
     * @returns Retorna o conteudo enviado
     */
    send(message) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return Message_1.default.Inject(this, yield this.bot.send(message));
            }
            catch (err) {
                this.emit("error", (0, error_1.getError)(err));
            }
            return Message_1.default.Inject(this, message);
        });
    }
    /**
     * * Aguarda uma mensagem ser recebida em uma sala de bate-papo
     * @param chatId Sala de bate-papo que irá receber a mensagem
     * @param ignoreMessageFromMe Ignora a mensagem se quem enviou foi o próprio bot
     * @param stopRead Para de ler a mensagem no evento
     * @param ignoreMessages Não resolve a promessa se a mensagem recebida é a mesma escolhida
     */
    awaitMessage(chat, ignoreMessageFromMe = true, stopRead = true, ...ignoreMessages) {
        return __classPrivateFieldGet(this, _BotModule_promiseMessages, "f").addPromiseMessage(Chat_1.default.getChatId(chat), ignoreMessageFromMe, stopRead, ...ignoreMessages);
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
            try {
                const now = Date.now();
                // Criar e atualizar dados da mensagem automatizada
                __classPrivateFieldGet(this, _BotModule_autoMessages, "f")[id] = { id, chats: chats || (yield this.getChats()), updatedAt: now, message };
                // Aguarda o tempo definido
                yield (0, sleep_1.default)(timeout - now);
                // Cancelar se estiver desatualizado
                if (__classPrivateFieldGet(this, _BotModule_autoMessages, "f")[id].updatedAt !== now)
                    return;
                yield Promise.all(__classPrivateFieldGet(this, _BotModule_autoMessages, "f")[id].chats.map((chat) => __awaiter(this, void 0, void 0, function* () {
                    var _a;
                    const automated = __classPrivateFieldGet(this, _BotModule_autoMessages, "f")[id];
                    if (automated.updatedAt !== now)
                        return;
                    (_a = automated.message) === null || _a === void 0 ? void 0 : _a.setChat(chat);
                    // Enviar mensagem
                    yield this.send(automated.message);
                    // Remover sala de bate-papo da mensagem
                    const nowChats = automated.chats;
                    const index = nowChats.indexOf(automated.chats[chat.id]);
                    __classPrivateFieldGet(this, _BotModule_autoMessages, "f")[id].chats = nowChats.splice(index + 1, nowChats.length);
                })));
            }
            catch (err) {
                this.emit("error", (0, error_1.getError)(err));
            }
        });
    }
    /**
     * * Define os comandos do bot
     * @param commands Comandos que será injetado
     */
    setCommands(commands) {
        this.commands = commands;
    }
    /**
     * @returns Retorna os comandos do bot
     */
    getCommands() {
        return this.commands;
    }
    /**
     * * Adiciona um comando na lista de comandos
     * @param command Comando que será adicionado
     */
    addCommand(command) {
        this.commands.push(command);
    }
    /**
     * @param command Comando que será procurado
     * @param args Argumentos que serão usados na construção do comando
     * @returns Retorna um comando do bot
     */
    getCommand(command) {
        var _a;
        const cmd = (_a = this.config.commandConfig) === null || _a === void 0 ? void 0 : _a.get(command, this.commands);
        if (!cmd)
            return null;
        (0, bot_1.setBotProperty)(this, cmd);
        //@ts-ignore
        return cmd;
    }
    //! <==============================> CHAT <==============================>
    /**
     * @param chat Sala de bate-papo
     * @returns Retorna uma sala de bate-papo
     */
    getChat(chat) {
        return __awaiter(this, void 0, void 0, function* () {
            const iChat = yield this.bot.getChat(Chat_1.default.getChat(chat));
            if (!iChat)
                return null;
            return Chat_1.default.Inject(this, iChat);
        });
    }
    /**
     * * Define uma sala de bate-papo
     * @param chat Sala de bate-papo
     */
    setChat(chat) {
        return __awaiter(this, void 0, void 0, function* () {
            this.bot.setChat(Chat_1.default.Inject(this, chat));
        });
    }
    /**
     * @returns Retorna as sala de bate-papo que o bot está
     */
    getChats() {
        return __awaiter(this, void 0, void 0, function* () {
            const modules = {};
            const chats = yield this.bot.getChats();
            for (const id in chats) {
                modules[id] = Chat_1.default.Inject(this, chats[id]);
            }
            return modules;
        });
    }
    /**
     * * Define as salas de bate-papo que o bot está
     * @param chats Salas de bate-papo
     */
    setChats(chats) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.bot.setChats(chats);
        });
    }
    /**
     * * Adiciona uma sala de bate-papo
     * @param chat Sala de bate-papo
     */
    addChat(chat) {
        return this.bot.addChat(Chat_1.default.Inject(this, Chat_1.default.getChat(chat)));
    }
    /**
     * * Remove uma sala de bate-papo
     * @param chat Sala de bate-papo
     */
    removeChat(chat) {
        return this.bot.removeChat(Chat_1.default.Inject(this, Chat_1.default.getChat(chat)));
    }
    /**
     * @param chat Sala de bate-papo
     * @returns Retorna o nome da sala de bate-papo
     */
    getChatName(chat) {
        return this.bot.getChatName(Chat_1.default.getChat(chat));
    }
    /**
     * @param chat Sala de bate-papo
     * @param name Nome da sala de bate-papo
     */
    setChatName(chat, name) {
        return this.bot.setChatName(Chat_1.default.getChat(chat), name);
    }
    /**
     * @param chat Sala de bate-papo
     * @returns Retorna a descrição da sala de bate-papo
     */
    getChatDescription(chat) {
        return this.bot.getChatDescription(Chat_1.default.getChat(chat));
    }
    /**
     * @param chat Sala de bate-papo
     * @param description Descrição da sala de bate-papo
     */
    setChatDescription(chat, description) {
        return this.bot.setChatDescription(Chat_1.default.getChat(chat), description);
    }
    /**
     * @param chat Sala de bate-papo
     * @returns Retorna a imagem de perfil da sala de bate-papo
     */
    getChatProfile(chat) {
        return this.bot.getChatProfile(Chat_1.default.getChat(chat));
    }
    /**
     * @param chat Sala de bate-papo
     * @param profile Imagem de perfil da sala de bate-papo
     */
    setChatProfile(chat, profile) {
        return this.bot.setChatProfile(Chat_1.default.getChat(chat), profile);
    }
    /**
     * * Altera o status da sala de bate-papo
     * @param chat Sala de bate-papo
     * @param status Status da sala de bate-papo
     */
    changeChatStatus(chat, status) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.bot.changeChatStatus(Chat_1.default.Inject(this, Chat_1.default.getChat(chat)), status);
        });
    }
    /**
     * * Adiciona um novo usuário a uma sala de bate-papo
     * @param chat Sala de bate-papo
     * @param user Usuário
     */
    addUserInChat(chat, user) {
        return this.bot.addUserInChat(Chat_1.default.getChat(chat), User_2.default.getUser(user));
    }
    /**
     * * Adiciona um novo usuário a uma sala de bate-papo
     * @param chat Sala de bate-papo
     * @param user Usuário
     */
    removeUserInChat(chat, user) {
        return this.bot.removeUserInChat(Chat_1.default.getChat(chat), User_2.default.getUser(user));
    }
    /**
     * * Promove há administrador um usuário da sala de bate-papo
     * @param chat Sala de bate-papo
     * @param user Usuário
     */
    promoteUserInChat(chat, user) {
        return this.bot.promoteUserInChat(Chat_1.default.getChat(chat), User_2.default.getUser(user));
    }
    /**
     * * Remove a administração um usuário da sala de bate-papo
     * @param chat Sala de bate-papo
     * @param user Usuário
     */
    demoteUserInChat(chat, user) {
        return this.bot.demoteUserInChat(Chat_1.default.getChat(chat), User_2.default.getUser(user));
    }
    /**
     * * Cria uma sala de bate-papo
     * @param chat Sala de bate-papo
     */
    createChat(chat) {
        return this.bot.createChat(Chat_1.default.getChat(chat));
    }
    /**
     * * Sai de uma sala de bate-papo
     * @param chat Sala de bate-papo
     */
    leaveChat(chat) {
        return this.bot.leaveChat(Chat_1.default.getChat(chat));
    }
    /**
     * @param chat Sala de bate-papo
     * @returns Retorna os administradores de uma sala de bate-papo
     */
    getChatAdmins(chat) {
        return __awaiter(this, void 0, void 0, function* () {
            const admins = yield this.bot.getChatAdmins(Chat_1.default.getChat(chat));
            const adminModules = {};
            Object.keys(admins).forEach((id) => {
                adminModules[id] = User_2.default.Inject(this, admins[id]);
            });
            return adminModules;
        });
    }
    /**
     * @param chat Sala de bate-papo
     * @returns Retorna o lider da sala de bate-papo
     */
    getChatLeader(chat) {
        return __awaiter(this, void 0, void 0, function* () {
            const leader = yield this.bot.getChatLeader(Chat_1.default.getChat(chat));
            return User_2.default.Inject(this, leader);
        });
    }
    //! <==============================> USER <==============================>
    /**
     * @param user Usuário
     * @returns Retorna um usuário
     */
    getUser(user) {
        return __awaiter(this, void 0, void 0, function* () {
            const usr = yield this.bot.getUser(User_2.default.getUser(user));
            if (usr)
                return User_1.default.Inject(this, usr);
            return null;
        });
    }
    /**
     * * Define um usuário
     * @param user Usuário
     */
    setUser(user) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.bot.setUser(User_2.default.Inject(this, User_2.default.getUser(user)));
        });
    }
    /**
     * @returns Retorna a lista de usuários do bot
     */
    getUsers() {
        return __awaiter(this, void 0, void 0, function* () {
            const modules = {};
            const users = yield this.bot.getUsers();
            for (const id in users) {
                modules[id] = User_2.default.Inject(this, users[id]);
            }
            return modules;
        });
    }
    /**
     * * Define a lista de usuários do bot
     * @param users Usuários
     */
    setUsers(users) {
        return this.bot.setUsers(users);
    }
    /**
     * * Adiciona um novo usuário
     * @param user Usuário
     */
    addUser(user) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.bot.addUser(User_2.default.Inject(this, User_2.default.getUser(user)));
        });
    }
    /**
     * * Remove um usuário
     * @param user Usuário
     */
    removeUser(user) {
        return this.bot.removeUser(User_2.default.getUser(user));
    }
    /**
     * @param user Usuário
     * @returns Retorna o nome do usuário
     */
    getUserName(user) {
        if (User_2.default.getUserId(user) == this.id)
            return this.getBotName();
        return this.bot.getUserName(User_2.default.getUser(user));
    }
    /**
     * @param user Usuário
     * @param name Nome do usuário
     */
    setUserName(user, name) {
        if (User_2.default.getUserId(user) == this.id)
            return this.setBotName(name);
        return this.bot.setUserName(User_2.default.getUser(user), name);
    }
    /**
     * @param user Usuário
     * @returns Retorna a descrição do usuário
     */
    getUserDescription(user) {
        if (User_2.default.getUserId(user) == this.id)
            return this.getBotDescription();
        return this.bot.getUserDescription(User_2.default.getUser(user));
    }
    /**
     * @param user Usuário
     * @param description Descrição do usuário
     */
    setUserDescription(user, description) {
        if (User_2.default.getUserId(user) == this.id)
            return this.setBotDescription(description);
        return this.bot.setUserDescription(User_2.default.getUser(user), description);
    }
    /**
     * @param user Usuário
     * @returns Retorna a foto de perfil do usuário
     */
    getUserProfile(user) {
        if (User_2.default.getUserId(user) == this.id)
            return this.getBotProfile();
        return this.bot.getUserProfile(User_2.default.getUser(user));
    }
    /**
     * @param user Usuário
     * @param profile Imagem de perfil do usuário
     */
    setUserProfile(user, profile) {
        if (User_2.default.getUserId(user) == this.id)
            return this.setBotProfile(profile);
        return this.bot.setUserProfile(User_2.default.getUser(user), profile);
    }
    /**
     * * Desbloqueia um usuário
     * @param user Usuário
     */
    unblockUser(user) {
        return this.bot.unblockUser(User_2.default.getUser(user));
    }
    /**
     * * Bloqueia um usuário
     * @param user Usuário
     */
    blockUser(user) {
        return this.bot.blockUser(User_2.default.getUser(user));
    }
    //! <===============================> BOT <==============================>
    /**
     * @returns Retorna o nome do bot
     */
    getBotName() {
        return this.bot.getBotName();
    }
    /**
     * * Define o nome do bot
     * @param name Nome do bot
     */
    setBotName(name) {
        return this.bot.setBotName(name);
    }
    /**
     * @returns Retorna a descrição do bot
     */
    getBotDescription() {
        return this.bot.getBotDescription();
    }
    /**
     * * Define a descrição do bot
     * @param description Descrição do bot
     */
    setBotDescription(description) {
        return this.bot.setBotDescription(description);
    }
    /**
     * @returns Retorna foto de perfil do bot
     */
    getBotProfile() {
        return this.bot.getBotProfile();
    }
    /**
     * * Define foto de perfil do bot
     * @param image Foto de perfil do bot
     */
    setBotProfile(profile) {
        return this.bot.setBotProfile(profile);
    }
    //! <=============================> MODULES <=============================>
    /**
     * * Sala de bate-papo
     * @param id Sala de bate-papo
     */
    Chat(chat) {
        return Chat_1.default.Inject(this, this.bot.Chat(Chat_1.default.getChat(chat)));
    }
    /**
     * * Usuário
     * @param user Usuário
     */
    User(user) {
        return User_2.default.Inject(this, this.bot.User(User_2.default.getUser(user)));
    }
    /**
     * * Mensagem
     * @param chat Sala de bate-papo
     * @param text Texto da mensagem
     */
    Message(chat, text) {
        return Message_1.default.Inject(this, this.bot.Message(this.Chat(chat), text));
    }
    /**
     * * Mensagem contendo uma mídia
     * @param chat Sala de bate-papo
     * @param text Texto da mensagem
     */
    MediaMessage(chat, text, file) {
        return MediaMessage_1.default.Inject(this, this.bot.MediaMessage(this.Chat(chat), text, file));
    }
    /**
     * * Mensagem com imagem
     * @param chat Sala de bate-papo
     * @param text Texto da mensagem
     * @param image Imagem
     */
    ImageMessage(chat, text, image) {
        return ImageMessage_1.default.Inject(this, this.bot.ImageMessage(this.Chat(chat), text, image));
    }
    /**
     * * Mensagem com vídeo
     * @param chat Sala de bate-papo
     * @param text Texto da mensagem
     * @param video Video
     */
    VideoMessage(chat, text, video) {
        return VideoMessage_1.default.Inject(this, this.bot.VideoMessage(this.Chat(chat), text, video));
    }
    /**
     * * Mensagem com audio
     * @param chat Sala de bate-papo
     * @param audio Audio
     */
    AudioMessage(chat, audio) {
        return AudioMessage_1.default.Inject(this, this.bot.AudioMessage(this.Chat(chat), audio));
    }
    /**
     * * Mensagem com contatos
     * @param chat Sala de bate-papo
     * @param text Texto da mensagem
     * @param contact Contato
     */
    ContactMessage(chat, text, contact) {
        return ContactMessage_1.default.Inject(this, this.bot.ContactMessage(this.Chat(chat), text, contact));
    }
    /**
     * * Mensagem com localização
     * @param chat Sala de bate-papo
     * @param longitude Longitude
     * @param latitude Latitude
     */
    LocationMessage(chat, latitude, longitude) {
        return LocationMessage_1.default.Inject(this, this.bot.LocationMessage(this.Chat(chat), longitude, latitude));
    }
    /**
     * * Mensagem com lista
     * @param chat Sala de bate-papo
     * @param text Texto da mensagem
     */
    ListMessage(chat, text, button) {
        return ListMessage_1.default.Inject(this, this.bot.ListMessage(this.Chat(chat), text, button));
    }
    /**
     * * Mensagem com botões
     * @param chat Sala de bate-papo
     * @param text Texto da mensagem
     */
    ButtonMessage(chat, text) {
        return ButtonMessage_1.default.Inject(this, this.bot.ButtonMessage(this.Chat(chat), text));
    }
}
exports.default = BotModule;
_BotModule_promiseMessages = new WeakMap(), _BotModule_autoMessages = new WeakMap();
function BuildBot(bot, config) {
    return new BotModule(bot, config);
}
exports.BuildBot = BuildBot;
//# sourceMappingURL=BotModule.js.map