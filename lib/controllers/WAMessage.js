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
const LocationMessage_1 = require("../buttons/LocationMessage");
const ContactMessage_1 = require("../buttons/ContactMessage");
const ButtonMessage_1 = require("../buttons/ButtonMessage");
const MediaMessage_1 = require("../buttons/MediaMessage");
const ListMessage_1 = require("../buttons/ListMessage");
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
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            this.chat = message.chat.id;
            this.message = yield this.refactoryMessage(message);
            if (message.mention) {
                const original = message.getOriginalMention();
                if (original)
                    this.context.quoted = original;
                else
                    this.context.quoted = (_a = this._wa.store.messages[message.mention.chat.id]) === null || _a === void 0 ? void 0 : _a.get(message.mention.id);
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
            msg.participant = message.user.id;
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
                // "ORG:${user.description};\n" +
                `TEL;type=CELL;type=VOICE;waid=${user.id.split("@")[0]}: ${user.phone}\n` +
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
}
exports.WhatsAppMessage = WhatsAppMessage;
//# sourceMappingURL=WAMessage.js.map