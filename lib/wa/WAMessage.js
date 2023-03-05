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
exports.WhatsAppMessage = void 0;
const baileys_1 = require("@adiwajshing/baileys");
const LocationMessage_1 = __importDefault(require("@messages/LocationMessage"));
const ContactMessage_1 = __importDefault(require("@messages/ContactMessage"));
const ButtonMessage_1 = __importDefault(require("@messages/ButtonMessage"));
const ImageMessage_1 = __importDefault(require("@messages/ImageMessage"));
const MediaMessage_1 = __importDefault(require("@messages/MediaMessage"));
const VideoMessage_1 = __importDefault(require("@messages/VideoMessage"));
const AudioMessage_1 = __importDefault(require("@messages/AudioMessage"));
const ListMessage_1 = __importDefault(require("@messages/ListMessage"));
const ID_1 = require("@wa/ID");
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
                const ctx = {};
                this.options.quoted = yield (0, baileys_1.generateWAMessage)(this.chat, waMSG.message, Object.assign({ userJid: (0, ID_1.getID)(this._wa.id) }, ctx));
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
                this.message.image = message.getImage();
            }
            if (message instanceof VideoMessage_1.default) {
                this.message.video = message.getVideo();
            }
            if (message instanceof AudioMessage_1.default) {
                this.message.audio = message.getAudio();
                this.message.mimetype = "audio/mp4";
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
            const vcard = "BEGIN:VCARD\n" +
                "VERSION:3.0\n" +
                `FN:${""}\n` +
                // `ORG:${user.description};\n` +
                `TEL;type=CELL;type=VOICE;waid=${user}: ${(0, ID_1.getID)(user)}\n` +
                "END:VCARD";
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