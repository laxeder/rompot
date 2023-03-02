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
const baileys_1 = require("@adiwajshing/baileys");
const pino_1 = __importDefault(require("pino"));
const LocationMessage_1 = __importDefault(require("../messages/LocationMessage"));
const ContactMessage_1 = __importDefault(require("../messages/ContactMessage"));
const ButtonMessage_1 = __importDefault(require("../messages/ButtonMessage"));
const ImageMessage_1 = __importDefault(require("../messages/ImageMessage"));
const MediaMessage_1 = __importDefault(require("../messages/MediaMessage"));
const VideoMessage_1 = __importDefault(require("../messages/VideoMessage"));
// import AudioMessage from "../messages/AudioMessage";
const ListMessage_1 = __importDefault(require("../messages/ListMessage"));
const Message_1 = __importDefault(require("../messages/Message"));
const ID_1 = require("./ID");
const Chat_1 = __importDefault(require("../modules/Chat"));
const User_1 = __importDefault(require("../modules/User"));
const WAUser_1 = __importDefault(require("./WAUser"));
const AudioMessage_1 = __importDefault(require("../messages/AudioMessage"));
class WhatsAppConvertMessage {
    constructor(wa, message, type) {
        this._message = {};
        this._convertedMessage = new Message_1.default(new Chat_1.default(""), "");
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
        return __awaiter(this, void 0, void 0, function* () {
            const id = (0, ID_1.replaceID)(message.key.remoteJid || "");
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
            // if (type) this._convertedMessage.isOld = type !== "notify";
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
            if (contentType == "imageMessage" || contentType == "videoMessage" || contentType == "audioMessage") {
                this.convertMediaMessage(content, contentType);
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
            if (!!!this._convertedMessage.text) {
                this._convertedMessage.text = content.text || content.caption || content.buttonText || content.contentText || ((_a = content.hydratedTemplate) === null || _a === void 0 ? void 0 : _a.hydratedContentText) || content.displayName || "";
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
        this._convertedMessage = new ContactMessage_1.default(this._chat, content.displayName, []);
        const getContact = (vcard) => {
            //TODO: obter diretamente contato
            const user = new WAUser_1.default("");
            if (typeof vcard == "object") {
                vcard = vcard.vcard;
            }
            const name = vcard.slice(vcard.indexOf("FN:"));
            user.name = name.slice(3, name.indexOf("\n"));
            const id = vcard.slice(vcard.indexOf("waid=") + 5);
            user.id = (0, ID_1.replaceID)(id.slice(0, id.indexOf(":")) + "@s.whatsapp.net");
            return user.id;
        };
        const contacts = [];
        if (content.contacts) {
            content.contacts.forEach((vcard) => {
                contacts.push(getContact(vcard));
            });
        }
        if (content.vcard) {
            contacts.push(getContact(content.vcard));
        }
        if (this._convertedMessage instanceof ContactMessage_1.default) {
            this._convertedMessage.contacts = contacts;
        }
    }
    /**
     * * Converte mensagem de midia
     * @param content
     * @param contentType
     */
    convertMediaMessage(content, contentType) {
        if (contentType == "imageMessage") {
            this._convertedMessage = new ImageMessage_1.default(this._chat, this._convertedMessage.text, content.url);
        }
        if (contentType == "videoMessage") {
            this._convertedMessage = new VideoMessage_1.default(this._chat, this._convertedMessage.text, content.url);
        }
        if (contentType == "audioMessage") {
            this._convertedMessage = new AudioMessage_1.default(this._chat, content.url);
        }
        if (content.gifPlayback && this._convertedMessage instanceof MediaMessage_1.default) {
            this._convertedMessage.isGIF = true;
        }
        const logger = (0, pino_1.default)({ level: "silent" });
        if (this._convertedMessage instanceof MediaMessage_1.default) {
            const download = () => {
                return (0, baileys_1.downloadMediaMessage)(this._message, "buffer", {}, {
                    logger,
                    reuploadRequest: (msg) => new Promise((resolve) => resolve(msg)),
                });
            };
            Object.defineProperty(this._convertedMessage, "getStream", {
                get: () => download,
            });
        }
    }
    /**
     * * Converte uma mensagem de botão
     * @param content
     * @returns
     */
    convertButtonMessage(content) {
        var _a, _b;
        let buttonMessage = content.buttonsMessage || content.templateMessage;
        const buttonMSG = new ButtonMessage_1.default(this._chat, "");
        if (buttonMessage.hydratedTemplate)
            buttonMessage = buttonMessage.hydratedTemplate;
        buttonMSG.text = buttonMessage.contentText || buttonMessage.hydratedContentText || "";
        buttonMSG.footer = buttonMessage.footerText || buttonMessage.hydratedFooterText || "";
        // buttonMSG.setType(buttonMessage.headerType || buttonMessage.hydratedHeaderType || 1)
        (_a = buttonMessage.buttons) === null || _a === void 0 ? void 0 : _a.map((button) => {
            var _a;
            buttonMSG.addReply(((_a = button === null || button === void 0 ? void 0 : button.buttonText) === null || _a === void 0 ? void 0 : _a.displayText) || "", button.buttonId || buttonMSG.generateID());
        });
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
        const listMSG = new ListMessage_1.default(this._chat, "", "", "", "");
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