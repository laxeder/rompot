import { MessageUpsertType, proto, WAMessage, WAMessageContent } from "@adiwajshing/baileys";
import { ListMessage } from "../models/ListMessage";
import { Message } from "../models/Message";
export declare const convertMessage: (message: WAMessage, type?: MessageUpsertType) => Message;
export declare const convertContentMessage: (messageContent: WAMessageContent, msg: Message, original?: any) => Message;
export declare const convertContextMessage: (context: proto.ContextInfo, msg: Message, original?: any) => Message;
export declare const convertButtonMessage: (content: WAMessageContent, msg: Message) => Message;
export declare const convertListMessage: (content: proto.Message.ListMessage, msg: Message) => Message;
