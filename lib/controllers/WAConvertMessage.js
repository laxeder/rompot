"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WhatsAppConvertMessage = void 0;
const baileys_1 = require("@adiwajshing/baileys");
const ButtonMessage_1 = require("../models/ButtonMessage");
const ImageMessage_1 = require("../models/ImageMessage");
const ListMessage_1 = require("../models/ListMessage");
const Message_1 = require("../models/Message");
const Chat_1 = require("../models/Chat");
const User_1 = require("../models/User");
class WhatsAppConvertMessage {
    constructor(message, type) {
        this._message = {};
        this._convertedMessage = new Message_1.Message(new Chat_1.Chat(""), "");
        this._user = new User_1.User("");
        this._chat = new Chat_1.Chat("");
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
        this.convertMessage(this._message, this._type);
        if (this._mention)
            this._convertedMessage.setMention(this._mention);
        this._convertedMessage.setChat(this._chat);
        this._convertedMessage.setUser(this._user);
        return this._convertedMessage;
    }
    /**
     * * Converte a mensagem
     * @param message
     * @param type
     */
    convertMessage(message, type) {
        if (message.key.remoteJid)
            this._chat.setId(message.key.remoteJid);
        if (message.pushName)
            this._chat.name = message.pushName;
        this._user = new User_1.User(message.key.participant || message.participant || message.key.remoteJid || "", message.pushName);
        this.convertContentMessage(message.message);
        if (message.key.fromMe)
            this._convertedMessage.fromMe = message.key.fromMe;
        if (message.key.id)
            this._convertedMessage.id = message.key.id;
        if (type)
            this._convertedMessage.isOld = type !== "notify";
        this._convertedMessage.setOriginalMessage(message);
    }
    /**
     * * Converte o conteudo da mensagem
     * @param messageContent
     * @returns
     */
    convertContentMessage(messageContent) {
        var _a, _b;
        if (!!!messageContent)
            return;
        if (Object.keys(messageContent).includes("senderKeyDistributionMessage")) {
            this._chat.setIsOld(true);
        }
        const contentType = (0, baileys_1.getContentType)(messageContent);
        if (!contentType)
            return;
        let content = contentType === "conversation" ? { text: messageContent[contentType] } : messageContent[contentType];
        if (content.message) {
            this.convertContentMessage(content.message);
            return;
        }
        if (contentType == "imageMessage") {
            this._convertedMessage = new ImageMessage_1.ImageMessage(this._chat, this._convertedMessage.text, content.url);
        }
        if (contentType === "buttonsMessage" || contentType === "templateMessage") {
            this.convertButtonMessage(messageContent);
        }
        if (contentType === "listMessage") {
            this.convertListMessage(messageContent);
        }
        if (!!!this._convertedMessage.text) {
            this._convertedMessage.setText(content.text ||
                content.caption ||
                content.buttonText ||
                content.contentText ||
                ((_a = content.hydratedTemplate) === null || _a === void 0 ? void 0 : _a.hydratedContentText) ||
                "");
        }
        if (content.contextInfo) {
            this.convertContextMessage(content.contextInfo);
        }
        if ((_b = content.singleSelectReply) === null || _b === void 0 ? void 0 : _b.selectedRowId) {
            this._convertedMessage.selected = content.singleSelectReply.selectedRowId;
        }
        if (content.selectedId) {
            this._convertedMessage.selected = content.selectedId;
        }
    }
    /**
     * * Converte o contexto da mensagem
     * @param context
     * @returns
     */
    convertContextMessage(context) {
        if (context.mentionedJid)
            this._convertedMessage.setMentions(context.mentionedJid);
        if (context.quotedMessage) {
            const message = {
                key: {
                    remoteJid: this._chat.id,
                    participant: context.participant,
                    id: context.stanzaId,
                },
                message: context.quotedMessage,
            };
            const wa = new WhatsAppConvertMessage(message);
            this._mention = wa.get();
            this._convertedMessage.setOriginalMention(message);
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
        const buttonMSG = new ButtonMessage_1.ButtonMessage(this._chat, "");
        if (buttonMessage.hydratedTemplate)
            buttonMessage = buttonMessage.hydratedTemplate;
        buttonMSG.setText(buttonMessage.contentText || buttonMessage.hydratedContentText || "");
        buttonMSG.setFooter(buttonMessage.footerText || buttonMessage.hydratedFooterText || "");
        buttonMSG.setType(buttonMessage.headerType || buttonMessage.hydratedHeaderType || 1);
        (_a = buttonMessage.buttons) === null || _a === void 0 ? void 0 : _a.map((button) => {
            var _a;
            buttonMSG.addReply(((_a = button === null || button === void 0 ? void 0 : button.buttonText) === null || _a === void 0 ? void 0 : _a.displayText) || "", button.buttonId || buttonMSG.generateID());
        });
        (_b = buttonMessage.hydratedButtons) === null || _b === void 0 ? void 0 : _b.map((button) => {
            if (button.callButton)
                buttonMSG.addCall(button.callButton.displayText || "", button.callButton.phoneNumber || buttonMSG.buttons.length);
            if (button.urlButton)
                buttonMSG.addCall(button.urlButton.displayText || "", button.urlButton.url || "");
            if (button.quickReplyButton)
                buttonMSG.addCall(button.quickReplyButton.displayText || "", button.quickReplyButton.id);
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
        const listMSG = new ListMessage_1.ListMessage(this._chat, "", "", "", "");
        listMSG.setText(listMessage.description || "");
        listMSG.title = listMessage.title || "";
        listMSG.footer = listMessage.footerText || "";
        listMSG.buttonText = listMessage.buttonText || "";
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