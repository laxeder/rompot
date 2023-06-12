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
exports.WhatsAppConvertMessage = void 0;
const baileys_1 = require("@whiskeysockets/baileys");
const dist_1 = require("@laxeder/wa-sticker/dist");
const crypto_digest_sync_1 = __importDefault(require("crypto-digest-sync"));
const long_1 = __importDefault(require("long"));
const Message_1 = require("../enums/Message");
const index_1 = require("../messages/index");
const Chat_1 = __importDefault(require("../modules/Chat"));
const User_1 = __importDefault(require("../modules/User"));
const WAModules_1 = require("./WAModules");
const ID_1 = require("./ID");
const Verify_1 = require("../utils/Verify");
class WhatsAppConvertMessage {
    constructor(wa, message, type) {
        this.message = {};
        this.convertedMessage = new index_1.Message("", "");
        this.user = new User_1.default("");
        this.chat = new Chat_1.default("");
        this.wa = wa;
        this.set(message, type);
    }
    /**
     * * Define a mensagem a ser convertida
     * @param message
     * @param type
     */
    set(message = this.message, type) {
        this.message = message;
        this.type = type;
    }
    /**
     * * Retorna a mensagem convertida
     */
    get() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.convertMessage(this.message, this.type);
            if (this.mention)
                this.convertedMessage.mention = this.mention;
            this.convertedMessage.chat = new Chat_1.default(this.chat.id, this.chat.type, this.chat.name);
            this.convertedMessage.user = new User_1.default(this.user.id, this.user.name);
            return this.convertedMessage;
        });
    }
    /**
     * * Converte a mensagem
     * @param message
     * @param type
     */
    convertMessage(message, type = "notify") {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            if (!!!message) {
                this.convertedMessage = new index_1.EmptyMessage();
                return;
            }
            const id = (0, ID_1.replaceID)(((_a = message === null || message === void 0 ? void 0 : message.key) === null || _a === void 0 ? void 0 : _a.remoteJid) || "");
            const chat = this.wa.chats[id] ? this.wa.chats[id] : new WAModules_1.WAChat(id);
            if (id) {
                if (chat)
                    this.chat = chat;
                this.chat.id = id;
            }
            if (chat === null || chat === void 0 ? void 0 : chat.id.includes("@g")) {
                this.chat.type = "group";
                this.chat.name = ((_b = this.wa.chats[chat.id]) === null || _b === void 0 ? void 0 : _b.name) || "";
            }
            if ((chat === null || chat === void 0 ? void 0 : chat.id.includes("@s")) || !chat.id.includes("@")) {
                this.chat.type = "pv";
                if (!message.key.fromMe) {
                    this.chat.name = message.pushName;
                    //? O WhatsApp não envia o nome de um chat privado normalmente, então recolho ele da mensagem
                    if (!this.wa.chats.hasOwnProperty(id) || (!!this.chat.name && this.wa.chats[id].name != this.chat.name)) {
                        yield this.wa.addChat(this.chat);
                    }
                }
            }
            const userID = (0, ID_1.replaceID)(message.key.fromMe ? this.wa.id : message.key.participant || message.participant || message.key.remoteJid || "");
            const user = this.wa.users[userID] || new WAModules_1.WAUser(userID);
            if (!!message.pushName)
                user.name = message.pushName;
            //? O WhatsApp não envia o nome do usuário normalmente, então recolho ele da mensagem
            if (!this.wa.users.hasOwnProperty(userID) || (!!user.name && this.wa.users[userID].name != user.name)) {
                yield this.wa.addUser(user);
            }
            this.user = user;
            yield this.convertContentMessage(message.message);
            if (this.message.key.fromMe) {
                this.convertedMessage.fromMe = this.message.key.fromMe;
                this.user.id = (0, ID_1.replaceID)(this.wa.id);
            }
            this.convertedMessage.apiSend = this.wa.apiMessagesId.includes(this.message.key.id);
            if (long_1.default.isLong(this.message.messageTimestamp)) {
                this.message.messageTimestamp = this.message.messageTimestamp.toNumber();
            }
            if (this.message.messageTimestamp)
                this.convertedMessage.timestamp = this.message.messageTimestamp;
            if (this.message.key.id)
                this.convertedMessage.id = this.message.key.id;
        });
    }
    /**
     * * Converte o conteudo da mensagem
     * @param messageContent
     * @returns
     */
    convertContentMessage(messageContent) {
        var _a, _b, _c;
        return __awaiter(this, void 0, void 0, function* () {
            if (!!!messageContent) {
                this.convertedMessage = new index_1.EmptyMessage();
                return;
            }
            const contentType = (0, baileys_1.getContentType)(messageContent);
            if (!contentType) {
                this.convertedMessage = new index_1.EmptyMessage();
                return;
            }
            if (contentType == "protocolMessage") {
                if (!!((_a = messageContent[contentType]) === null || _a === void 0 ? void 0 : _a.historySyncNotification)) {
                    this.convertedMessage = new index_1.EmptyMessage();
                    return;
                }
                if (!!messageContent[contentType].editedMessage) {
                    yield this.convertEditedMessage(messageContent[contentType]);
                    return;
                }
                this.convertedMessage.isDeleted = true;
            }
            let content = contentType === "conversation" ? { text: messageContent[contentType] } : messageContent[contentType];
            if (content.message) {
                yield this.convertContentMessage(content.message);
                return;
            }
            if (contentType == "editedMessage") {
                yield this.convertEditedMessage(messageContent[contentType].message);
                return;
            }
            if (contentType == "imageMessage" || contentType == "videoMessage" || contentType == "audioMessage" || contentType == "stickerMessage" || contentType == "documentMessage") {
                yield this.convertMediaMessage(content, contentType);
            }
            if (contentType === "buttonsMessage" || contentType === "templateMessage") {
                this.convertButtonMessage(messageContent);
            }
            if (contentType === "listMessage") {
                this.convertListMessage(messageContent);
            }
            if (contentType === "locationMessage") {
                this.convertLocationMessage(content);
            }
            if (contentType === "contactMessage" || contentType == "contactsArrayMessage") {
                this.convertContactMessage(content);
            }
            if (contentType === "reactionMessage") {
                this.convertReactionMessage(content);
            }
            if (contentType === "pollCreationMessage") {
                this.convertPollCreationMessage(content);
            }
            if (contentType == "pollUpdateMessage") {
                yield this.convertPollUpdateMessage(content);
            }
            if (!!!this.convertedMessage.text) {
                this.convertedMessage.text =
                    content.text || content.caption || content.buttonText || ((_b = content.hydratedTemplate) === null || _b === void 0 ? void 0 : _b.hydratedContentText) || content.displayName || content.contentText || this.convertedMessage.text || "";
            }
            if (content.contextInfo) {
                yield this.convertContextMessage(content.contextInfo);
            }
            if ((_c = content.singleSelectReply) === null || _c === void 0 ? void 0 : _c.selectedRowId) {
                this.convertedMessage.selected = content.singleSelectReply.selectedRowId;
            }
            if (content.selectedId) {
                this.convertedMessage.selected = content.selectedId;
            }
        });
    }
    /**
     * * Converte o contexto da mensagem
     * @param context
     * @returns
     */
    convertContextMessage(context) {
        return __awaiter(this, void 0, void 0, function* () {
            if (context.mentionedJid) {
                for (const jid of context.mentionedJid) {
                    this.convertedMessage.mentions.push((0, ID_1.replaceID)(jid));
                }
            }
            if (context.quotedMessage) {
                const message = {
                    key: {
                        remoteJid: (0, ID_1.replaceID)(this.chat.id),
                        participant: (0, ID_1.replaceID)(context.participant),
                        id: context.stanzaId,
                    },
                    message: context.quotedMessage,
                };
                const wa = new WhatsAppConvertMessage(this.wa, message);
                this.mention = yield wa.get();
            }
        });
    }
    /**
     * * Converte mensagem de localização
     * @param content
     */
    convertLocationMessage(content) {
        this.convertedMessage = new index_1.LocationMessage(this.chat, content.degreesLatitude, content.degreesLongitude);
    }
    /**
     * * Converte mensagem com contatos
     * @param content
     */
    convertContactMessage(content) {
        const msg = new index_1.ContactMessage(this.chat, content.displayName, []);
        const getContact = (vcard) => {
            const user = new WAModules_1.WAUser("");
            if (typeof vcard == "object") {
                vcard = vcard.vcard;
            }
            const name = vcard.slice(vcard.indexOf("FN:"));
            user.name = name.slice(3, name.indexOf("\n"));
            const id = vcard.slice(vcard.indexOf("waid=") + 5);
            user.id = (0, ID_1.replaceID)(id.slice(0, id.indexOf(":")) + "@s.whatsapp.net");
            return user;
        };
        if (content.contacts) {
            content.contacts.forEach((vcard) => {
                msg.contacts.push(getContact(vcard));
            });
        }
        if (content.vcard) {
            msg.contacts.push(getContact(content.vcard));
        }
        this.convertedMessage = msg;
    }
    /**
     * * Converte mensagem de midia
     * @param content
     * @param contentType
     */
    convertMediaMessage(content, contentType) {
        return __awaiter(this, void 0, void 0, function* () {
            var msg = new index_1.MediaMessage(this.chat, "", Buffer.from(""));
            const file = { stream: this.message };
            if (contentType == "documentMessage") {
                msg = new index_1.FileMessage(this.chat, this.convertedMessage.text, file);
            }
            if (contentType == "imageMessage") {
                msg = new index_1.ImageMessage(this.chat, this.convertedMessage.text, file);
            }
            if (contentType == "videoMessage") {
                msg = new index_1.VideoMessage(this.chat, this.convertedMessage.text, file);
            }
            if (contentType == "audioMessage") {
                msg = new index_1.AudioMessage(this.chat, file);
            }
            if (contentType == "stickerMessage") {
                msg = new index_1.StickerMessage(this.chat, file);
                try {
                    yield (0, dist_1.extractMetadata)(yield this.wa.downloadStreamMessage(file))
                        .then((data) => {
                        if ((0, Verify_1.isStickerMessage)(msg)) {
                            msg.author = data["sticker-pack-publisher"] || "";
                            msg.stickerId = data["sticker-pack-id"] || "";
                            msg.pack = data["sticker-pack-name"] || "";
                        }
                    })
                        .catch((err) => {
                        this.wa.ev.emit("error", err);
                    });
                }
                catch (err) {
                    this.wa.ev.emit("error", err);
                }
            }
            if (content.gifPlayback) {
                msg.isGIF = true;
            }
            if (!!content.mimetype) {
                msg.mimetype = content.mimetype;
            }
            if (!!content.fileName) {
                msg.name = content.fileName;
            }
            this.convertedMessage = msg;
        });
    }
    /**
     * * Converte uma mensagem de reação
     * @param content
     */
    convertReactionMessage(content) {
        this.convertedMessage = new index_1.ReactionMessage(this.chat, content.text, content.key.id);
    }
    /**
     * * Converte uma mensagem editada
     * @param content
     */
    convertEditedMessage(content) {
        return __awaiter(this, void 0, void 0, function* () {
            this.set(Object.assign(Object.assign({}, content), { message: content.editedMessage }), this.type);
            yield this.get();
            this.convertedMessage.isEdited = true;
        });
    }
    /**
     * * Converte uma mensagem de enquete
     * @param content
     */
    convertPollCreationMessage(content) {
        var _a;
        const pollCreation = this.wa.polls[this.chat.id];
        const pollMessage = new index_1.PollMessage(this.chat, content.name);
        if (!!pollCreation && (pollCreation === null || pollCreation === void 0 ? void 0 : pollCreation.options) && ((_a = pollCreation === null || pollCreation === void 0 ? void 0 : pollCreation.options) === null || _a === void 0 ? void 0 : _a.length) > 0) {
            pollMessage.options = pollCreation.options;
        }
        else {
            for (const opt of content.options) {
                pollMessage.addOption(opt.optionName);
            }
        }
        this.convertedMessage = pollMessage;
    }
    /**
     * * Converte uma mensagem de enquete atualizada
     * @param content
     */
    convertPollUpdateMessage(content) {
        return __awaiter(this, void 0, void 0, function* () {
            const pollCreation = this.wa.polls[content.pollCreationMessageKey.id];
            const pollUpdate = new index_1.PollUpdateMessage(this.chat, (pollCreation === null || pollCreation === void 0 ? void 0 : pollCreation.text) || "");
            if (pollCreation) {
                const userId = this.user.id;
                const poll = (0, baileys_1.decryptPollVote)(content.vote, {
                    pollCreatorJid: (0, ID_1.getID)(pollCreation.user.id),
                    pollMsgId: content.pollCreationMessageKey.id,
                    pollEncKey: pollCreation.secretKey,
                    voterJid: (0, ID_1.getID)(userId),
                });
                const votesAlias = {};
                const hashVotes = poll.selectedOptions.map((opt) => Buffer.from(opt).toString("hex").toUpperCase()).sort();
                const oldVotes = pollCreation.getUserVotes(userId).sort();
                const nowVotes = [];
                for (const opt of pollCreation.options) {
                    const hash = Buffer.from((0, crypto_digest_sync_1.default)("SHA-256", new TextEncoder().encode(Buffer.from(opt.name).toString())))
                        .toString("hex")
                        .toUpperCase();
                    votesAlias[opt.name] = opt;
                    if (hashVotes.includes(hash)) {
                        nowVotes.push(opt.name);
                    }
                }
                let vote = null;
                const avaibleVotes = Object.keys(votesAlias);
                for (const name of avaibleVotes) {
                    if (nowVotes.length > oldVotes.length) {
                        if (oldVotes.includes(name) || !nowVotes.includes(name))
                            continue;
                        vote = votesAlias[name];
                        pollUpdate.action = "add";
                        break;
                    }
                    else {
                        if (nowVotes.includes(name) || !oldVotes.includes(name))
                            continue;
                        vote = votesAlias[name];
                        pollUpdate.action = "remove";
                        break;
                    }
                }
                pollUpdate.selected = (vote === null || vote === void 0 ? void 0 : vote.id) || "";
                pollUpdate.text = (vote === null || vote === void 0 ? void 0 : vote.name) || "";
                pollCreation.setUserVotes(userId, nowVotes);
                this.wa.polls[pollCreation.id] = pollCreation;
                yield this.wa.savePolls(this.wa.polls);
            }
            this.convertedMessage = pollUpdate;
        });
    }
    /**
     * * Converte uma mensagem de botão
     * @param content
     * @returns
     */
    convertButtonMessage(content) {
        var _a, _b;
        let buttonMessage = content.buttonsMessage || content.templateMessage;
        const buttonMSG = new index_1.ButtonMessage(this.chat, "", "");
        if (buttonMessage.hydratedTemplate)
            buttonMessage = buttonMessage.hydratedTemplate;
        buttonMSG.text = buttonMessage.contentText || buttonMessage.hydratedContentText || "";
        buttonMSG.footer = buttonMessage.footerText || buttonMessage.hydratedFooterText || "";
        // buttonMSG.setType(buttonMessage.headerType || buttonMessage.hydratedHeaderType || 1)
        if (buttonMessage.buttons) {
            buttonMSG.type = Message_1.MessageType.Button;
            (_a = buttonMessage.buttons) === null || _a === void 0 ? void 0 : _a.map((button) => {
                var _a;
                buttonMSG.addReply(((_a = button === null || button === void 0 ? void 0 : button.buttonText) === null || _a === void 0 ? void 0 : _a.displayText) || "", button.buttonId || String(Date.now()));
            });
        }
        if (buttonMessage.hydratedButtons) {
            buttonMSG.type = Message_1.MessageType.TemplateButton;
            (_b = buttonMessage.hydratedButtons) === null || _b === void 0 ? void 0 : _b.map((button) => {
                if (button.callButton) {
                    buttonMSG.addCall(button.callButton.displayText || "", button.callButton.phoneNumber || buttonMSG.buttons.length);
                }
                if (button.urlButton) {
                    buttonMSG.addUrl(button.urlButton.displayText || "", button.urlButton.url || "");
                }
                if (button.quickReplyButton) {
                    buttonMSG.addReply(button.quickReplyButton.displayText || "", button.quickReplyButton.id);
                }
            });
        }
        this.convertedMessage = buttonMSG;
    }
    /**
     * * Converte uma mensagem de lista
     * @param content
     * @returns
     */
    convertListMessage(content) {
        var _a;
        let listMessage = content.listMessage;
        if (!!!listMessage)
            return;
        const listMSG = new index_1.ListMessage(this.chat, "", "");
        listMSG.text = listMessage.description || "";
        listMSG.title = listMessage.title || "";
        listMSG.footer = listMessage.footerText || "";
        listMSG.button = listMessage.buttonText || "";
        (_a = listMessage === null || listMessage === void 0 ? void 0 : listMessage.sections) === null || _a === void 0 ? void 0 : _a.map((list) => {
            var _a;
            const index = listMSG.list.length;
            listMSG.addCategory(list.title || "");
            (_a = list.rows) === null || _a === void 0 ? void 0 : _a.map((item) => {
                listMSG.addItem(index, item.title || "", item.description || "", item.rowId || "");
            });
        });
        this.convertedMessage = listMSG;
    }
}
exports.WhatsAppConvertMessage = WhatsAppConvertMessage;
//# sourceMappingURL=WAConvertMessage.js.map