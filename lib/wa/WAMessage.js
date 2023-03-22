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
exports.WhatsAppMessage = void 0;
const baileys_1 = require("@adiwajshing/baileys");
const LocationMessage_1 = __importDefault(require("../messages/LocationMessage"));
const ContactMessage_1 = __importDefault(require("../messages/ContactMessage"));
const ButtonMessage_1 = __importDefault(require("../messages/ButtonMessage"));
const ImageMessage_1 = __importDefault(require("../messages/ImageMessage"));
const MediaMessage_1 = __importDefault(require("../messages/MediaMessage"));
const VideoMessage_1 = __importDefault(require("../messages/VideoMessage"));
const AudioMessage_1 = __importDefault(require("../messages/AudioMessage"));
const FileMessage_1 = __importDefault(require("../messages/FileMessage"));
const ListMessage_1 = __importDefault(require("../messages/ListMessage"));
const ID_1 = require("./ID");
const StickerMessage_1 = __importDefault(require("../messages/StickerMessage"));
const dist_1 = __importStar(require("wa-sticker-formatter/dist"));
class WhatsAppMessage {
    constructor(wa, message) {
        this.chat = "";
        this.message = {};
        this.options = {};
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
                this.options.quoted = yield (0, baileys_1.generateWAMessage)(this.chat, waMSG.message, {
                    userJid: (0, ID_1.getID)(waMSG.message.participant || this._wa.id),
                    upload() {
                        return {};
                    },
                });
                this.options.quoted.key.fromMe = (0, ID_1.getID)(waMSG.message.participant) == (0, ID_1.getID)(this._wa.id);
            }
            if (message instanceof ButtonMessage_1.default)
                yield this.refactoryButtonMessage(message);
            if (message instanceof MediaMessage_1.default)
                yield this.refactoryMediaMessage(message);
            if (message instanceof LocationMessage_1.default)
                this.refactoryLocationMessage(message);
            if (message instanceof ContactMessage_1.default)
                this.refactoryContactMessage(message);
            if (message instanceof ListMessage_1.default)
                this.refactoryListMessage(message);
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
            msg.participant = (0, ID_1.getID)(message.user.id);
            if (message.mentions) {
                msg.mentions = [];
                message.mentions.forEach((jid) => {
                    msg.mentions.push((0, ID_1.getID)(jid));
                });
            }
            if (message.fromMe)
                msg.fromMe = message.fromMe;
            if (message.id)
                msg.id = message.id;
            return msg;
        });
    }
    /**
     * * Refatora uma mensagem de midia
     * @param message
     */
    refactoryMediaMessage(message) {
        return __awaiter(this, void 0, void 0, function* () {
            this.message.caption = this.message.text;
            delete this.message.text;
            if (message instanceof ImageMessage_1.default) {
                this.message.image = yield message.getImage();
            }
            if (message instanceof VideoMessage_1.default) {
                this.message.video = yield message.getVideo();
            }
            if (message instanceof AudioMessage_1.default) {
                this.message.audio = yield message.getAudio();
                this.message.mimetype = "audio/mp4";
            }
            if (message instanceof FileMessage_1.default) {
                this.message.document = yield message.getFile();
                this.message.mimetype = "application/octet-stream";
            }
            if (message instanceof StickerMessage_1.default) {
                const sticker = new dist_1.default(yield message.getSticker(), {
                    pack: message.pack,
                    author: message.author,
                    categories: message.categories,
                    id: message.id,
                    type: dist_1.StickerTypes.FULL,
                    quality: 100,
                });
                this.message = Object.assign(Object.assign({}, this.message), (yield sticker.toMessage()));
            }
            if (message.isGIF) {
                this.message.gifPlayback = true;
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
        message.contacts.forEach((user) => {
            const vcard = "BEGIN:VCARD\n" + "VERSION:3.0\n" + `FN:${""}\n` + `ORG:${user.description};\n` + `TEL;type=CELL;type=VOICE;waid=${user.id}: ${(0, ID_1.getID)(user.id)}\n` + "END:VCARD";
            if (message.contacts.length < 2) {
                this.message.contacts.contacts.push({ vcard });
                return;
            }
            this.message.contacts.contacts.push({
                displayName: "",
                vcard,
            });
        });
        delete this.message.text;
    }
    /**
     * * Refatora uma mensagem de botão
     * @param message
     */
    refactoryButtonMessage(message) {
        return __awaiter(this, void 0, void 0, function* () {
            this.message.footer = message.footer;
            this.message.templateButtons = [];
            this.message.text = message.text;
            message.buttons.forEach((button) => {
                const btn = {};
                btn.index = button.index;
                if (button.type == "reply")
                    btn.quickReplyButton = { displayText: button.text, id: button.content };
                if (button.type == "call")
                    btn.callButton = { displayText: button.text, phoneNumber: button.content };
                if (button.type == "reply")
                    btn.urlButton = { displayText: button.text, url: button.content };
                this.message.templateButtons.push(btn);
            });
        });
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
        this.message.sections = [];
        message.list.map((list) => {
            const rows = [];
            list.items.map((item) => {
                rows.push({ title: item.title, description: item.description, rowId: item.id });
            });
            this.message.sections.push({ title: list.title, rows });
        });
    }
}
exports.WhatsAppMessage = WhatsAppMessage;
//# sourceMappingURL=WAMessage.js.map