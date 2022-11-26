"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertListMessage = exports.convertButtonMessage = exports.convertContextMessage = exports.convertContentMessage = exports.convertMessage = void 0;
const baileys_1 = require("@adiwajshing/baileys");
const ButtonMessage_1 = require("../models/ButtonMessage");
const ImageMessage_1 = require("../models/ImageMessage");
const ListMessage_1 = require("../models/ListMessage");
const Message_1 = require("../models/Message");
const Chat_1 = require("../models/Chat");
const User_1 = require("../models/User");
const convertMessage = (message, type) => {
    let msg = new Message_1.Message(new Chat_1.Chat(""), "");
    if (type)
        msg.isOld = type !== "notify";
    if (!message.message)
        return msg;
    if (!message.key.remoteJid)
        return msg;
    if (message.key.participant)
        msg.setMember(message.key.participant);
    if (message.key.remoteJid)
        msg.chat.setId(message.key.remoteJid);
    if (message.key.fromMe)
        msg.fromMe = message.key.fromMe;
    if (message.pushName)
        msg.chat.name = message.pushName;
    if (message.key.id)
        msg.id = message.key.id;
    msg = (0, exports.convertContentMessage)(message.message, msg, message);
    msg.setUser(new User_1.User(message.key.participant || message.participant || message.key.remoteJid, message.pushName));
    msg._originalMessage = message;
    return msg;
};
exports.convertMessage = convertMessage;
const convertContentMessage = (messageContent, msg, original) => {
    var _a, _b;
    if (Object.keys(messageContent).includes("senderKeyDistributionMessage"))
        msg.chat.setIsNew(true);
    const contentType = (0, baileys_1.getContentType)(messageContent);
    if (!contentType)
        return msg;
    let content = contentType === "conversation" ? { text: messageContent[contentType] } : messageContent[contentType];
    if (content.message)
        return (0, exports.convertContentMessage)(content.message, msg);
    if (contentType == "imageMessage")
        msg = new ImageMessage_1.ImageMessage(msg.chat, msg.text, content.url);
    if (contentType === "buttonsMessage" || contentType === "templateMessage")
        msg = (0, exports.convertButtonMessage)(messageContent, msg);
    if (!!!msg.text)
        msg.setText(content.text ||
            content.caption ||
            content.buttonText ||
            content.contentText ||
            ((_a = content.hydratedTemplate) === null || _a === void 0 ? void 0 : _a.hydratedContentText) ||
            "");
    if (content.contextInfo)
        msg = (0, exports.convertContextMessage)(content.contextInfo, msg, original);
    if ((_b = content.singleSelectReply) === null || _b === void 0 ? void 0 : _b.selectedRowId)
        msg.selected = content.singleSelectReply.selectedRowId;
    if (content.selectedId)
        msg.selected = content.selectedId;
    return msg;
};
exports.convertContentMessage = convertContentMessage;
const convertContextMessage = (context, msg, original) => {
    if (context.mentionedJid)
        msg.setMentions(context.mentionedJid);
    if (context.quotedMessage) {
        const message = {
            key: {
                remoteJid: msg.chat.id,
                participant: context.participant,
                id: context.stanzaId,
            },
            message: context.quotedMessage,
        };
        msg.setMention((0, exports.convertMessage)(message));
        msg.setOriginalMention(message);
    }
    return msg;
};
exports.convertContextMessage = convertContextMessage;
const convertButtonMessage = (content, msg) => {
    var _a, _b;
    let buttonMessage = content.buttonsMessage || content.templateMessage;
    const buttonMSG = new ButtonMessage_1.ButtonMessage(msg.chat, "");
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
    return buttonMSG;
};
exports.convertButtonMessage = convertButtonMessage;
const convertListMessage = (content, msg) => {
    const listMSG = new ListMessage_1.ListMessage(msg.chat, "", "", "", "");
    listMSG.setText(content.description);
    listMSG.title = content.title;
    listMSG.footer = content.footerText;
    listMSG.buttonText = content.buttonText;
    content.sections.map((list) => {
        var _a;
        const index = listMSG.list.length;
        listMSG.addCategory(list.title || "");
        (_a = list.rows) === null || _a === void 0 ? void 0 : _a.map((item) => {
            listMSG.addItem(index, item.title || "", item.description || "", item.rowId || "");
        });
    });
    return listMSG;
};
exports.convertListMessage = convertListMessage;
//# sourceMappingURL=WAConvertMessage.js.map