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
exports.WhatsAppMessage = void 0;
const baileys_1 = require("@whiskeysockets/baileys");
const dist_1 = __importStar(require("@laxeder/wa-sticker/dist"));
const rompot_base_1 = require("rompot-base");
const WAModules_1 = require("./WAModules");
const ID_1 = require("./ID");
const Verify_1 = require("../utils/Verify");
class WhatsAppMessage {
    constructor(wa, message) {
        this.chat = "";
        this.message = {};
        this.options = {};
        this.isRelay = false;
        this._message = message;
        this._wa = wa;
    }
    /**
     * * Refatora a mensagem
     * @param message
     */
    refactory(message = this._message) {
        return __awaiter(this, void 0, void 0, function* () {
            this.chat = (0, ID_1.getID)(message.chat.id);
            this.message = yield this.refactoryMessage(message);
            if (message.mention) {
                const waMSG = new WhatsAppMessage(this._wa, message.mention);
                yield waMSG.refactory(message.mention);
                const userJid = (0, ID_1.getID)(!!message.mention.user.id ? message.mention.user.id : this._wa.id);
                this.options.quoted = yield (0, baileys_1.generateWAMessage)(this.chat, waMSG.message, {
                    userJid,
                    upload() {
                        return {};
                    },
                });
                this.options.quoted.key.fromMe = userJid == (0, ID_1.getID)(this._wa.id);
                if (this.chat.includes("@g")) {
                    this.options.quoted.key.participant = userJid;
                }
            }
            if ((0, Verify_1.isMediaMessage)(message))
                yield this.refactoryMediaMessage(message);
            if ((0, Verify_1.isLocationMessage)(message))
                this.refactoryLocationMessage(message);
            if ((0, Verify_1.isReactionMessage)(message))
                this.refactoryReactionMessage(message);
            if ((0, Verify_1.isContactMessage)(message))
                this.refactoryContactMessage(message);
            if ((0, Verify_1.isButtonMessage)(message))
                this.refactoryButtonMessage(message);
            if ((0, Verify_1.isListMessage)(message))
                this.refactoryListMessage(message);
            if ((0, Verify_1.isPollMessage)(message))
                this.refactoryPollMessage(message);
        });
    }
    /**
     * * Refatora outras informações da mensagem
     * @param message
     * @returns
     */
    refactoryMessage(message) {
        return __awaiter(this, void 0, void 0, function* () {
            const msg = {};
            msg.text = message.text;
            if (!!message.user.id && (0, baileys_1.isJidGroup)(message.chat.id)) {
                msg.participant = (0, ID_1.getID)(message.user.id);
            }
            if (message.mentions) {
                msg.mentions = [];
                for (const jid of message.mentions) {
                    msg.mentions.push((0, ID_1.getID)(jid));
                }
                for (const mention of msg.text.split(/@(.*?)/)) {
                    const mentionNumber = mention.split(/\s+/)[0].replace(/\D+/g, "");
                    if (!!!mentionNumber || mentionNumber.length < 9 || mentionNumber.length > 15)
                        continue;
                    const jid = (0, ID_1.getID)(mentionNumber);
                    if (msg.mentions.includes(jid))
                        continue;
                    msg.mentions.push(jid);
                }
            }
            if (message.fromMe)
                msg.fromMe = message.fromMe;
            if (message.id)
                msg.id = message.id;
            if (message.isEdited) {
                msg.edit = {
                    remoteJid: (0, ID_1.getID)(message.chat.id) || "",
                    id: message.id || "",
                    fromMe: message.fromMe || message.user.id == this._wa.id,
                    participant: (0, baileys_1.isJidGroup)(message.chat.id) ? (0, ID_1.getID)(message.user.id || this._wa.id) : undefined,
                    toJSON: () => this,
                };
            }
            return msg;
        });
    }
    /**
     * * Refatora uma mensagem de midia
     * @param message
     */
    refactoryMediaMessage(message) {
        return __awaiter(this, void 0, void 0, function* () {
            const stream = yield message.getStream();
            if ((0, Verify_1.isImageMessage)(message)) {
                this.message.image = stream;
            }
            if ((0, Verify_1.isVideoMessage)(message)) {
                this.message.video = stream;
            }
            if ((0, Verify_1.isAudioMessage)(message)) {
                this.message.audio = stream;
            }
            if ((0, Verify_1.isFileMessage)(message)) {
                this.message.file = stream;
            }
            if ((0, Verify_1.isStickerMessage)(message)) {
                yield this.refatoryStickerMessage(message);
            }
            if (message.isGIF) {
                this.message.gifPlayback = true;
            }
            this.message.caption = this.message.text;
            this.message.mimetype = message.mimetype;
            this.message.fileName = message.name;
            delete this.message.text;
        });
    }
    refatoryStickerMessage(message) {
        return __awaiter(this, void 0, void 0, function* () {
            const stickerFile = yield message.getSticker();
            this.message = Object.assign(Object.assign({}, this.message), { sticker: stickerFile });
            try {
                const sticker = new dist_1.default(stickerFile, {
                    pack: message.pack,
                    author: message.author,
                    categories: message.categories,
                    id: message.stickerId,
                    type: dist_1.StickerTypes.FULL,
                    quality: 100,
                });
                this.message = Object.assign(Object.assign({}, this.message), (yield sticker.toMessage()));
            }
            catch (err) {
                this._wa.ev.emit("error", err);
            }
        });
    }
    refactoryLocationMessage(message) {
        this.message.location = { degreesLatitude: message.latitude, degreesLongitude: message.longitude };
        delete this.message.text;
    }
    refactoryContactMessage(message) {
        this.message.contacts = {
            displayName: message.text,
            contacts: [],
        };
        for (const id of Object.keys(message.contacts)) {
            const user = message.contacts[id];
            const vcard = "BEGIN:VCARD\n" + "VERSION:3.0\n" + `FN:${""}\n` + (user instanceof WAModules_1.WAUser ? `ORG:${user.description};\n` : "") + `TEL;type=CELL;type=VOICE;waid=${user.id}: ${(0, ID_1.getID)(user.id)}\n` + "END:VCARD";
            if (Object.keys(message.contacts).length < 2) {
                this.message.contacts.contacts.push({ vcard });
                return;
            }
            this.message.contacts.contacts.push({
                displayName: "",
                vcard,
            });
        }
        delete this.message.text;
    }
    /**
     * * Refatora uma mensagem de reação
     * @param message
     */
    refactoryReactionMessage(message) {
        this.message = {
            react: {
                key: {
                    remoteJid: (0, ID_1.getID)(message.chat.id),
                    id: message.id || "",
                    fromMe: message.fromMe || !!message.user.id ? message.user.id == this._wa.id : false,
                    participant: message.chat.id.includes("@g") ? (0, ID_1.getID)(message.user.id || this._wa.id) : undefined,
                    toJSON: () => this,
                },
                text: message.text,
            },
        };
    }
    /**
     * * Refatora uma mensagem de enquete
     * @param message
     */
    refactoryPollMessage(message) {
        this.message = {
            poll: {
                name: message.text,
                values: message.options.map((opt) => opt.name),
            },
        };
    }
    /**
     * * Refatora uma mensagem de botão
     * @param message
     */
    refactoryButtonMessage(message) {
        this.message.text = message.text;
        this.message.footer = message.footer;
        this.message.viewOnce = true;
        if (message.type == rompot_base_1.MessageType.TemplateButton) {
            this.message.templateButtons = message.buttons.map((button) => {
                if (button.type == "reply")
                    return { index: button.index, quickReplyButton: { displayText: button.text, id: button.content } };
                if (button.type == "call")
                    return { index: button.index, callButton: { displayText: button.text, phoneNumber: button.content } };
                if (button.type == "url")
                    return { index: button.index, urlButton: { displayText: button.text, url: button.content } };
            });
        }
        else {
            this.message.buttons = message.buttons.map((button) => {
                return { buttonId: button.content, buttonText: { displayText: button.text }, type: 1 };
            });
        }
    }
    /**
     * * Refatora uma mensagem de lista
     * @param message
     */
    refactoryListMessage(message) {
        this.message.buttonText = message.button;
        this.message.description = message.text;
        this.message.footer = message.footer;
        this.message.title = message.title;
        this.message.viewOnce = true;
        this.message.sections = message.list.map((list) => {
            return {
                title: list.title,
                rows: list.items.map((item) => {
                    return { title: item.title, description: item.description, rowId: item.id };
                }),
            };
        });
    }
}
exports.WhatsAppMessage = WhatsAppMessage;
//# sourceMappingURL=WAMessage.js.map