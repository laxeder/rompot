import { getContentType, MessageUpsertType, proto, WAMessage, WAMessageContent } from "@adiwajshing/baileys";

import { ButtonMessage } from "@models/ButtonMessage";
import { ImageMessage } from "@models/ImageMessage";
import { ListMessage } from "@models/ListMessage";
import { Message } from "@models/Message";
import { Chat } from "@models/Chat";
import { User } from "@models/User";

export const convertMessage = (message: WAMessage, type?: MessageUpsertType): Message => {
  let msg = new Message(new Chat(""), "");

  if (type) msg.isOld = type !== "notify";

  if (!message.message) return msg;
  if (!message.key.remoteJid) return msg;

  if (message.key.participant) msg.setMember(message.key.participant);
  if (message.key.remoteJid) msg.chat.setId(message.key.remoteJid);
  if (message.key.fromMe) msg.fromMe = message.key.fromMe;
  if (message.pushName) msg.chat.name = message.pushName;
  if (message.key.id) msg.id = message.key.id;

  msg = convertContentMessage(message.message, msg, message);

  msg.setUser(
    new User(message.key.participant || message.participant || message.key.remoteJid, message.pushName as string)
  );

  msg._originalMessage = message;

  return msg;
};

export const convertContentMessage = (messageContent: WAMessageContent, msg: Message, original?: any): Message => {
  if (Object.keys(messageContent).includes("senderKeyDistributionMessage")) msg.chat.setIsNew(true);

  const contentType = getContentType(messageContent);
  if (!contentType) return msg;

  let content: any =
    contentType === "conversation" ? { text: messageContent[contentType] } : messageContent[contentType];

  if (content.message) return convertContentMessage(content.message, msg);

  if (contentType == "imageMessage") msg = new ImageMessage(msg.chat, msg.text, content.url);
  if (contentType === "buttonsMessage" || contentType === "templateMessage")
    msg = convertButtonMessage(messageContent, msg);
  if (!!!msg.text)
    msg.setText(
      content.text ||
        content.caption ||
        content.buttonText ||
        content.contentText ||
        content.hydratedTemplate?.hydratedContentText ||
        ""
    );

  if (content.contextInfo) msg = convertContextMessage(content.contextInfo, msg, original);

  if (content.singleSelectReply?.selectedRowId) msg.selected = content.singleSelectReply.selectedRowId;
  if (content.selectedId) msg.selected = content.selectedId;

  return msg;
};

export const convertContextMessage = (context: proto.ContextInfo, msg: Message, original?: any): Message => {
  if (context.mentionedJid) msg.setMentions(context.mentionedJid);

  if (context.quotedMessage) {
    const message = {
      key: {
        remoteJid: msg.chat.id,
        participant: context.participant,
        id: context.stanzaId,
      },
      message: context.quotedMessage,
    };

    msg.setMention(convertMessage(message));
    msg.setOriginalMention(message);
  }

  return msg;
};

export const convertButtonMessage = (content: WAMessageContent, msg: Message): Message => {
  let buttonMessage: any = content.buttonsMessage || content.templateMessage;
  const buttonMSG = new ButtonMessage(msg.chat, "");

  if (buttonMessage.hydratedTemplate) buttonMessage = buttonMessage.hydratedTemplate;

  buttonMSG.setText(buttonMessage.contentText || buttonMessage.hydratedContentText || "");
  buttonMSG.setFooter(buttonMessage.footerText || buttonMessage.hydratedFooterText || "");
  buttonMSG.setType(buttonMessage.headerType || buttonMessage.hydratedHeaderType || 1);

  buttonMessage.buttons?.map((button: proto.Message.ButtonsMessage.IButton) => {
    buttonMSG.addReply(button?.buttonText?.displayText || "", button.buttonId || buttonMSG.generateID());
  });

  buttonMessage.hydratedButtons?.map((button: any) => {
    if (button.callButton)
      buttonMSG.addCall(button.callButton.displayText || "", button.callButton.phoneNumber || buttonMSG.buttons.length);
    if (button.urlButton) buttonMSG.addCall(button.urlButton.displayText || "", button.urlButton.url || "");
    if (button.quickReplyButton)
      buttonMSG.addCall(button.quickReplyButton.displayText || "", button.quickReplyButton.id);
  });

  return buttonMSG;
};

export const convertListMessage = (content: proto.Message.ListMessage, msg: Message): Message => {
  const listMSG = new ListMessage(msg.chat, "", "", "", "");

  listMSG.setText(content.description);
  listMSG.title = content.title;
  listMSG.footer = content.footerText;
  listMSG.buttonText = content.buttonText;

  content.sections.map((list) => {
    const index = listMSG.list.length;
    listMSG.addCategory(list.title || "");

    list.rows?.map((item) => {
      listMSG.addItem(index, item.title || "", item.description || "", item.rowId || "");
    });
  });

  return listMSG;
};
