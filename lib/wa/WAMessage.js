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
exports.WhatsAppMessage = void 0;
const LocationMessage_1 = require("../messages/LocationMessage");
const ReactionMessage_1 = require("../messages/ReactionMessage");
const ContactMessage_1 = require("../messages/ContactMessage");
const baileys_1 = require("@adiwajshing/baileys");
const ButtonMessage_1 = require("../messages/ButtonMessage");
const MediaMessage_1 = require("../messages/MediaMessage");
const ListMessage_1 = require("../messages/ListMessage");
const ID_1 = require("./ID");
class WhatsAppMessage {
    constructor(wa, message) {
        this.chat = "";
        this.message = {};
        this.context = {};
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
                const original = message.getOriginalMention();
                const ctx = {};
                this.context.quoted =
                    original ||
                        message.mention.getOriginalMessage() ||
                        (yield (0, baileys_1.generateWAMessage)(this.chat, this.message, Object.assign({ userJid: this._wa.id, logger: this._wa.config.logger }, ctx)));
            }
            if (message instanceof ButtonMessage_1.ButtonMessage)
                yield this.refactoryButtonMessage(message);
            if (message instanceof MediaMessage_1.MediaMessage)
                yield this.refactoryMediaMessage(message);
            if (message instanceof LocationMessage_1.LocationMessage)
                this.refactoryLocationMessage(message);
            if (message instanceof ContactMessage_1.ContactMessage)
                this.refactoryContactMessage(message);
            if (message instanceof ListMessage_1.ListMessage)
                this.refactoryListMessage(message);
            if (message instanceof ReactionMessage_1.ReactionMessage)
                this.refactoryReactionMessage(message);
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
            if (message.mentions)
                msg.mentions = message.mentions;
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
            const image = yield message.getImage();
            if (image) {
                this.message.image = image;
            }
            const video = yield message.getVideo();
            if (video) {
                this.message.video = video;
            }
            const audio = yield message.getAudio();
            if (audio) {
                this.message.audio = audio;
                this.message.mimetype = "audio/mp4";
            }
            if (message.isGIF) {
                this.message.gifPlayback = true;
            }
        });
    }
    refactoryLocationMessage(message) {
        this.message.location = { degreesLatitude: message.getLatitude(), degreesLongitude: message.getLongitude() };
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
                `FN:${user.name || ""}\n` +
                // `ORG:${user.description};\n` +
                `TEL;type=CELL;type=VOICE;waid=${user.id}: ${(0, ID_1.getID)(user.id)}\n` +
                "END:VCARD";
            if (message.contacts.length < 2) {
                this.message.contacts.contacts.push({ vcard });
                return;
            }
            this.message.contacts.contacts.push({
                displayName: user.name,
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
                if (button.reply)
                    btn.quickReplyButton = { displayText: button.reply.text, id: button.reply.id };
                if (button.call)
                    btn.callButton = { displayText: button.call.text, phoneNumber: button.call.phone };
                if (button.url)
                    btn.urlButton = { displayText: button.url.text, url: button.url.url };
                this.message.templateButtons.push(btn);
            });
        });
    }
    /**
     * * Refatora uma mensagem de lista
     * @param message
     */
    refactoryListMessage(message) {
        this.message.buttonText = message.buttonText;
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
    /**
     * * Refatora uma mensagem de reação
     * @param message
     */
    refactoryReactionMessage(message) {
        const fromMe = message.fromMe || this._wa.id == message.user.id;
        this.message = {
            react: {
                text: message.text[0],
                key: { remoteJid: (0, ID_1.getID)(message.chat.id), id: message.id, fromMe },
            },
        };
        if (message.chat.id.includes("@g")) {
            this.message.react.key.participant = (0, ID_1.getID)(message.user.id || this._wa.id);
        }
    }
}
exports.WhatsAppMessage = WhatsAppMessage;
//# sourceMappingURL=WAMessage.js.map