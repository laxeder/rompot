"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.WhatsAppBot = void 0;
const baileys_1 = __importStar(require("@adiwajshing/baileys"));
const WAConvertMessage_1 = require("../controllers/WAConvertMessage");
const WAMessage_1 = require("../controllers/WAMessage");
const logger_1 = require("../config/logger");
const Message_1 = require("../buttons/Message");
const BaseBot_1 = require("../utils/BaseBot");
const Status_1 = require("../models/Status");
const Chat_1 = require("../models/Chat");
const User_1 = require("../models/User");
class WhatsAppBot extends BaseBot_1.BaseBot {
    constructor(config) {
        super();
        this._auth = "";
        this.DisconnectReason = baileys_1.DisconnectReason;
        this.bot = {};
        this.statusOpts = {
            typing: "composing",
            reading: "reading",
            recording: "recording",
            online: "available",
            offline: "unavailable",
        };
        this.config = config || {
            printQRInTerminal: true,
            logger: (0, logger_1.loggerConfig)({ level: "silent" }),
        };
    }
    /**
     * * Conecta ao servidor do WhatsApp
     * @param auth
     * @param config
     * @returns
     */
    connect(auth, config) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                try {
                    if (!config) {
                        config = this.config;
                    }
                    this._auth = auth;
                    this.config = config || this.config;
                    const { state, saveCreds } = yield (0, baileys_1.useMultiFileAuthState)(this._auth);
                    this._bot = (0, baileys_1.default)(Object.assign(Object.assign({}, this.config), { auth: state }));
                    this._bot.ev.on("creds.update", saveCreds);
                    this.store = (0, baileys_1.makeInMemoryStore)({});
                    this.store.bind(this._bot.ev);
                    //! A mensagem não é recebida depois de se reconectar
                    this._bot.ev.on("messages.upsert", (m) => {
                        if (m.messages.length <= 0)
                            return;
                        const message = m.messages[m.messages.length - 1];
                        if (message.key.remoteJid == "status@broadcast")
                            return;
                        const msg = new WAConvertMessage_1.WhatsAppConvertMessage(message, m.type);
                        if (message.key.fromMe) {
                            this.events["bot-message"].next(msg.get());
                            return;
                        }
                        this.events.message.next(msg.get());
                    });
                    this._bot.ev.on("group-participants.update", (group) => {
                        group.participants.forEach((user) => {
                            this.events.member.next({ action: group.action, chat: new Chat_1.Chat(group.id), user: new User_1.User(user) });
                        });
                    });
                    // Verificando se bot conectou
                    this._bot.ev.on("connection.update", (update) => __awaiter(this, void 0, void 0, function* () {
                        var _a, _b, _c, _d, _e, _f;
                        const status = ((_c = (_b = (_a = update.lastDisconnect) === null || _a === void 0 ? void 0 : _a.error) === null || _b === void 0 ? void 0 : _b.output) === null || _c === void 0 ? void 0 : _c.statusCode) || ((_d = update.lastDisconnect) === null || _d === void 0 ? void 0 : _d.error) || 500;
                        this.events.connection.next({ action: update.connection, status, login: update === null || update === void 0 ? void 0 : update.qr });
                        if (update.connection == "open") {
                            this.status.setStatus("online");
                            // Removendo caracteres do ID do bot
                            this.bot.user = Object.assign({}, (_e = this._bot) === null || _e === void 0 ? void 0 : _e.user);
                            this.bot.user.id = ((_f = this.bot.user.id) === null || _f === void 0 ? void 0 : _f.replace(/:(.*)@/, "@")) || "";
                            resolve(true);
                        }
                        if (update.connection == "close") {
                            this.status.setStatus("offline");
                            // Bot desligado
                            if (status === baileys_1.DisconnectReason.loggedOut)
                                return;
                            resolve(yield this.reconnect(this.config));
                        }
                    }));
                }
                catch (err) {
                    reject((err === null || err === void 0 ? void 0 : err.stack) || err);
                }
            }));
        });
    }
    /**
     * * Reconecta ao servidor do WhatsApp
     * @param config
     * @returns
     */
    reconnect(config) {
        this.events.connection.next({ action: "reconnecting" });
        return this.connect(this._auth, config || this.config);
    }
    /**
     * * Desliga a conexão com o servidor do WhatsApp
     * @param reason
     * @returns
     */
    stop(reason) {
        return new Promise(() => {
            var _a;
            (_a = this._bot) === null || _a === void 0 ? void 0 : _a.end(reason);
        });
    }
    /**
     * * Envia um conteúdo
     * @param content
     * @returns
     */
    send(content) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
        return __awaiter(this, void 0, void 0, function* () {
            if (content instanceof Message_1.Message) {
                const waMSG = new WAMessage_1.WhatsAppMessage(this, content);
                yield waMSG.refactory(content);
                const { chat, message, context } = waMSG;
                if (message.hasOwnProperty("templateButtons")) {
                    const fullMsg = yield (0, baileys_1.generateWAMessage)(chat, message, Object.assign({ userJid: (_b = (_a = this._bot) === null || _a === void 0 ? void 0 : _a.user) === null || _b === void 0 ? void 0 : _b.id, logger: this.config.logger }, context));
                    fullMsg.message = { viewOnceMessage: { message: fullMsg.message } };
                    return (_c = this._bot) === null || _c === void 0 ? void 0 : _c.relayMessage(chat, fullMsg.message, { messageId: fullMsg.key.id });
                }
                return (_d = this._bot) === null || _d === void 0 ? void 0 : _d.sendMessage(chat, message, context);
            }
            if (content instanceof Status_1.Status) {
                if (content.status === "reading") {
                    return (_e = this._bot) === null || _e === void 0 ? void 0 : _e.readMessages([
                        { remoteJid: (_f = content.chat) === null || _f === void 0 ? void 0 : _f.id, id: (_g = content.message) === null || _g === void 0 ? void 0 : _g.id, participant: (_h = content.message) === null || _h === void 0 ? void 0 : _h.user.id },
                    ]);
                }
                const status = this.statusOpts[content.status];
                return (_j = this._bot) === null || _j === void 0 ? void 0 : _j.sendPresenceUpdate(status, (_k = content.chat) === null || _k === void 0 ? void 0 : _k.id);
            }
        });
    }
    /**
     * * Faz o download de arquivos do WhatsApp
     * @param message
     * @param type
     * @param options
     * @param ctx
     * @returns
     */
    download(message, type, options, ctx) {
        return (0, baileys_1.downloadMediaMessage)(message, type, options, ctx);
    }
    /**
     * * Verifica se o número está registrado no WhatsApp
     * @returns
     */
    onExists(id) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield ((_a = this._bot) === null || _a === void 0 ? void 0 : _a.onWhatsApp(id));
            if (user && user.length > 0)
                return { exists: user[0].exists, id: user[0].jid };
            return { exists: false, id };
        });
    }
    /**
     * * Atualiza uma mensagem de mídia
     * @param message
     * @returns
     */
    updateMediaMessage(message) {
        var _a;
        if (this._bot)
            return (_a = this._bot) === null || _a === void 0 ? void 0 : _a.updateMediaMessage(message);
        throw "Sock não encontrado.";
    }
    /**
     * * Aceita o convite para um grupo
     * @param code
     * @returns
     */
    groupAcceptInvite(code) {
        var _a;
        return (_a = this._bot) === null || _a === void 0 ? void 0 : _a.groupAcceptInvite(code);
    }
}
exports.WhatsAppBot = WhatsAppBot;
//# sourceMappingURL=WhatsAppBot.js.map