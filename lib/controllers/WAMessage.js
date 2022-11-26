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
const baileys_1 = require("@adiwajshing/baileys");
const ButtonMessage_1 = require("../models/ButtonMessage");
const ImageMessage_1 = require("../models/ImageMessage");
const ListMessage_1 = require("../models/ListMessage");
const logger_1 = require("../config/logger");
class WhatsAppMessage {
    constructor(wa, message) {
        this.chat = "";
        this.message = {};
        this.context = {};
        this.relay = false;
        this._wa = wa;
        this._message = message;
    }
    /**
     * * Refatora a mensagem
     * @param message
     */
    refactory(message = this._message, wa) {
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
                this.refactoryButtonMessage(message);
            if (message instanceof ListMessage_1.ListMessage)
                this.refactoryListMessage(message);
            if (message instanceof ImageMessage_1.ImageMessage)
                yield this.refactoryImageMessage(message, wa);
        });
    }
    refactoryMessage(message) {
        return __awaiter(this, void 0, void 0, function* () {
            const msg = {};
            msg.text = message.text;
            if (message.member)
                msg.participant = message.member;
            if (message.fromMe)
                msg.fromMe = message.fromMe;
            if (message.id)
                msg.id = message.id;
            if (message.mentions)
                msg.mentions = message.mentions;
            return msg;
        });
    }
    refactoryImageMessage(message, wa) {
        return __awaiter(this, void 0, void 0, function* () {
            this.message.caption = this.message.text;
            delete this.message.text;
            let imageUrl = message.getImage();
            if (typeof imageUrl == "string") {
                imageUrl = yield (0, baileys_1.downloadMediaMessage)(message._originalMessage, "buffer", {}, {
                    logger: logger_1.logger,
                    reuploadRequest: wa.updateMediaMessage,
                });
            }
            this.message.image = imageUrl;
        });
    }
    /**
     * * Refatora uma mensagem de botão
     * @param message
     */
    refactoryButtonMessage(message) {
        this.relay = true;
        const hydratedTemplate = {
            hydratedContentText: message.text,
            hydratedFooterText: message.footer,
            hydratedButtons: [],
        };
        message.buttons.map((button) => {
            const btn = {};
            btn.index = button.index;
            if (button.reply)
                btn.quickReplyButton = { displayText: button.reply.text, id: button.reply.id };
            if (button.call)
                btn.callButton = { displayText: button.call.text, phoneNumber: button.call.phone };
            if (button.url)
                btn.urlButton = { displayText: button.url.text, phoneNumber: button.url.url };
            hydratedTemplate.hydratedButtons.push(btn);
        });
        //? A API do WhatsApp está com problemas na mensagem de template
        //! TODO: Arrumar sistema de mensagem template
        this.message = {
            viewOnceMessage: {
                message: {
                    templateMessage: {
                        hydratedTemplate,
                    },
                },
            },
        };
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