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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WhatsAppConvertMessage = void 0;
const baileys_1 = require("@adiwajshing/baileys");
const dist_1 = require("wa-sticker-formatter/dist");
const crypto = __importStar(require("crypto"));
const PollUpdateMessage_1 = __importDefault(require("../messages/PollUpdateMessage"));
const ReactionMessage_1 = __importDefault(require("../messages/ReactionMessage"));
const LocationMessage_1 = __importDefault(require("../messages/LocationMessage"));
const ContactMessage_1 = __importDefault(require("../messages/ContactMessage"));
const StickerMessage_1 = __importDefault(require("../messages/StickerMessage"));
const ButtonMessage_1 = __importDefault(require("../messages/ButtonMessage"));
const MediaMessage_1 = __importDefault(require("../messages/MediaMessage"));
const ImageMessage_1 = __importDefault(require("../messages/ImageMessage"));
const VideoMessage_1 = __importDefault(require("../messages/VideoMessage"));
const AudioMessage_1 = __importDefault(require("../messages/AudioMessage"));
const ListMessage_1 = __importDefault(require("../messages/ListMessage"));
const FileMessage_1 = __importDefault(require("../messages/FileMessage"));
const PollMessage_1 = __importDefault(require("../messages/PollMessage"));
const Message_1 = __importDefault(require("../messages/Message"));
const Chat_1 = __importDefault(require("../modules/Chat"));
const User_1 = __importDefault(require("../modules/User"));
const ID_1 = require("./ID");
class WhatsAppConvertMessage {
    constructor(wa, message, type) {
        this._message = {};
        this._convertedMessage = new Message_1.default("", "");
        this._user = new User_1.default("");
        this._chat = new Chat_1.default("");
        this._wa = wa;
        this.set(message, type);
    }
    /**
     * * Define a mensagem a ser convertida
     * @param message
     * @param type
     */
    set(message = this._message, type) {
        this._message = message;
        this._type = type;
    }
    /**
     * * Retorna a mensagem convertida
     */
    get() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.convertMessage(this._message, this._type);
            if (this._mention)
                this._convertedMessage.mention = this._mention;
            this._convertedMessage.chat = this._chat;
            this._convertedMessage.user = this._user;
            return this._convertedMessage;
        });
    }
    /**
     * * Converte a mensagem
     * @param message
     * @param type
     */
    convertMessage(message, type) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const id = (0, ID_1.replaceID)(((_a = message === null || message === void 0 ? void 0 : message.key) === null || _a === void 0 ? void 0 : _a.remoteJid) || "");
            const chat = this._wa.chats[id] ? this._wa.chats[id] : new Chat_1.default(id);
            if (id) {
                if (chat)
                    this._chat = chat;
                this._chat.id = id;
            }
            if (chat === null || chat === void 0 ? void 0 : chat.id.includes("@g"))
                this._chat.type = "group";
            if (chat === null || chat === void 0 ? void 0 : chat.id.includes("@s"))
                this._chat.type = "pv";
            if (message.pushName)
                this._chat.name = message.pushName;
            const userID = (0, ID_1.replaceID)(message.key.participant || message.participant || message.key.remoteJid || "");
            this._user = (chat === null || chat === void 0 ? void 0 : chat.users) && (chat === null || chat === void 0 ? void 0 : chat.users[userID]) ? chat === null || chat === void 0 ? void 0 : chat.users[userID] : new User_1.default(userID);
            this._user.name = message.pushName || "";
            yield this.convertContentMessage(message.message);
            if (message.key.fromMe) {
                this._convertedMessage.fromMe = message.key.fromMe;
                this._user.id = (0, ID_1.replaceID)(this._wa.id);
            }
            if (message.messageTimestamp)
                this._convertedMessage.timestamp = message.messageTimestamp;
            if (message.key.id)
                this._convertedMessage.id = message.key.id;
        });
    }
    /**
     * * Converte o conteudo da mensagem
     * @param messageContent
     * @returns
     */
    convertContentMessage(messageContent) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            if (!!!messageContent)
                return;
            const contentType = (0, baileys_1.getContentType)(messageContent);
            if (!contentType)
                return;
            let content = contentType === "conversation" ? { text: messageContent[contentType] } : messageContent[contentType];
            if (content.message) {
                yield this.convertContentMessage(content.message);
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
            if (!!!this._convertedMessage.text) {
                this._convertedMessage.text =
                    content.text || content.caption || content.buttonText || ((_a = content.hydratedTemplate) === null || _a === void 0 ? void 0 : _a.hydratedContentText) || content.displayName || content.contentText || this._convertedMessage.text || "";
            }
            if (content.contextInfo) {
                yield this.convertContextMessage(content.contextInfo);
            }
            if ((_b = content.singleSelectReply) === null || _b === void 0 ? void 0 : _b.selectedRowId) {
                this._convertedMessage.selected = content.singleSelectReply.selectedRowId;
            }
            if (content.selectedId) {
                this._convertedMessage.selected = content.selectedId;
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
                    this._convertedMessage.mentions.push((0, ID_1.replaceID)(jid));
                }
            }
            if (context.quotedMessage) {
                const message = {
                    key: {
                        remoteJid: (0, ID_1.replaceID)(this._chat.id),
                        participant: (0, ID_1.replaceID)(context.participant),
                        id: context.stanzaId,
                    },
                    message: context.quotedMessage,
                };
                const wa = new WhatsAppConvertMessage(this._wa, message);
                this._mention = yield wa.get();
            }
        });
    }
    /**
     * * Converte mensagem de localização
     * @param content
     */
    convertLocationMessage(content) {
        this._convertedMessage = new LocationMessage_1.default(this._chat, content.degreesLatitude, content.degreesLongitude);
    }
    /**
     * * Converte mensagem com contatos
     * @param content
     */
    convertContactMessage(content) {
        const msg = new ContactMessage_1.default(this._chat, content.displayName, []);
        const getContact = (vcard) => {
            const user = new User_1.default("");
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
        this._convertedMessage = msg;
    }
    /**
     * * Converte mensagem de midia
     * @param content
     * @param contentType
     */
    convertMediaMessage(content, contentType) {
        return __awaiter(this, void 0, void 0, function* () {
            var msg = new MediaMessage_1.default(this._chat, "", Buffer.from(""));
            const file = { stream: this._message };
            if (contentType == "documentMessage") {
                msg = new FileMessage_1.default(this._chat, this._convertedMessage.text, file);
            }
            if (contentType == "imageMessage") {
                msg = new ImageMessage_1.default(this._chat, this._convertedMessage.text, file);
            }
            if (contentType == "videoMessage") {
                msg = new VideoMessage_1.default(this._chat, this._convertedMessage.text, file);
            }
            if (contentType == "audioMessage") {
                msg = new AudioMessage_1.default(this._chat, file);
            }
            if (contentType == "stickerMessage") {
                msg = new StickerMessage_1.default(this._chat, file);
                const data = yield (0, dist_1.extractMetadata)(yield this._wa.downloadStreamMessage(file));
                if (msg instanceof StickerMessage_1.default) {
                    msg.author = data["sticker-pack-publisher"] || "";
                    msg.id = data["sticker-pack-id"] || msg.id;
                    msg.pack = data["sticker-pack-name"] || "";
                }
            }
            if (content.gifPlayback) {
                msg.isGIF = true;
            }
            this._convertedMessage = msg;
        });
    }
    /**
     * * Converte uma mensagem de reação
     * @param content
     */
    convertReactionMessage(content) {
        this._convertedMessage = new ReactionMessage_1.default(this._chat, content.text, content.key.id);
    }
    /**
     * * Converte uma mensagem de enquete
     * @param content
     */
    convertPollCreationMessage(content) {
        var _a;
        const pollCreation = this._wa.polls[this._chat.id];
        const pollMessage = new PollMessage_1.default(this._chat, content.name);
        if (!!pollCreation && (pollCreation === null || pollCreation === void 0 ? void 0 : pollCreation.options) && ((_a = pollCreation === null || pollCreation === void 0 ? void 0 : pollCreation.options) === null || _a === void 0 ? void 0 : _a.length) > 0) {
            pollMessage.options = pollCreation.options;
        }
        else {
            for (const opt of content.options) {
                pollMessage.addOption(opt.optionName);
            }
        }
        this._convertedMessage = pollMessage;
    }
    /**
     * * Converte uma mensagem de enquete atualizada
     * @param content
     */
    convertPollUpdateMessage(content) {
        return __awaiter(this, void 0, void 0, function* () {
            const pollCreation = this._wa.polls[content.pollCreationMessageKey.id];
            const pollUpdate = new PollUpdateMessage_1.default(this._chat, (pollCreation === null || pollCreation === void 0 ? void 0 : pollCreation.text) || "");
            if (pollCreation) {
                const userId = this._user.id;
                const poll = (0, baileys_1.decryptPollVote)(content.vote, {
                    pollCreatorJid: (0, ID_1.getID)(pollCreation.user.id),
                    pollMsgId: content.pollCreationMessageKey.id,
                    pollEncKey: pollCreation.secretKey,
                    voterJid: (0, ID_1.getID)(userId),
                });
                const hashVotes = poll.selectedOptions.map((opt) => Buffer.from(opt).toString("hex").toUpperCase()).sort();
                const userHashVotes = pollCreation.getUserVotes(userId).sort();
                const options = {};
                yield Promise.all(pollCreation.options.map((opt) => __awaiter(this, void 0, void 0, function* () {
                    const hash = Buffer.from(yield crypto.subtle.digest("SHA-256", new TextEncoder().encode(Buffer.from(opt.name).toString())))
                        .toString("hex")
                        .toUpperCase();
                    options[hash] = opt;
                })));
                let vote = null;
                for (const hash of Object.keys(options)) {
                    if (hashVotes.length > userHashVotes.length) {
                        if (userHashVotes.includes(hash))
                            continue;
                        vote = options[hash];
                        pollUpdate.action = "add";
                    }
                    else {
                        if (hashVotes.includes(hash))
                            continue;
                        vote = options[hash];
                        pollUpdate.action = "remove";
                    }
                }
                pollUpdate.selected = (vote === null || vote === void 0 ? void 0 : vote.id) || "";
                pollUpdate.text = (vote === null || vote === void 0 ? void 0 : vote.name) || "";
                pollCreation.setUserVotes(userId, hashVotes);
                this._wa.polls[pollCreation.id] = pollCreation;
                yield this._wa.savePolls(this._wa.polls);
            }
            this._convertedMessage = pollUpdate;
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
        const buttonMSG = new ButtonMessage_1.default(this._chat, "", "");
        if (buttonMessage.hydratedTemplate)
            buttonMessage = buttonMessage.hydratedTemplate;
        buttonMSG.text = buttonMessage.contentText || buttonMessage.hydratedContentText || "";
        buttonMSG.footer = buttonMessage.footerText || buttonMessage.hydratedFooterText || "";
        // buttonMSG.setType(buttonMessage.headerType || buttonMessage.hydratedHeaderType || 1)
        if (buttonMessage.buttons) {
            buttonMSG.type = "plain";
            (_a = buttonMessage.buttons) === null || _a === void 0 ? void 0 : _a.map((button) => {
                var _a;
                buttonMSG.addReply(((_a = button === null || button === void 0 ? void 0 : button.buttonText) === null || _a === void 0 ? void 0 : _a.displayText) || "", button.buttonId || String(Date.now()));
            });
        }
        if (buttonMessage.hydratedButtons) {
            buttonMSG.type = "template";
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
        this._convertedMessage = buttonMSG;
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
        const listMSG = new ListMessage_1.default(this._chat, "", "");
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
        this._convertedMessage = listMSG;
    }
}
exports.WhatsAppConvertMessage = WhatsAppConvertMessage;
//# sourceMappingURL=WAConvertMessage.js.map