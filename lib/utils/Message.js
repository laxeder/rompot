"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isEmptyMessage = exports.isReactionMessage = exports.isPollUpdateMessage = exports.isPollMessage = exports.isLocationMessage = exports.isListMessage = exports.isContactMessage = exports.isButtonTemplateMessage = exports.isButtonMessage = exports.isTextMessage = exports.isAudioMessage = exports.isStickerMessage = exports.isVideoMessage = exports.isImageMessage = exports.isFileMessage = exports.isMediaMessage = exports.isMessage = void 0;
const Message_1 = require("../enums/Message");
function isMessage(message) {
    return typeof message == "object" && message.hasOwnProperty("text") && message.hasOwnProperty("chat") && message.hasOwnProperty("type");
}
exports.isMessage = isMessage;
function isMediaMessage(message) {
    return (isMessage(message) &&
        (message.type == Message_1.MessageType.Media ||
            message.type == Message_1.MessageType.File ||
            message.type == Message_1.MessageType.Image ||
            message.type == Message_1.MessageType.Video ||
            message.type == Message_1.MessageType.Sticker ||
            message.type == Message_1.MessageType.Audio));
}
exports.isMediaMessage = isMediaMessage;
function isFileMessage(message) {
    return isMediaMessage(message) && message.type == Message_1.MessageType.File;
}
exports.isFileMessage = isFileMessage;
function isImageMessage(message) {
    return isMediaMessage(message) && message.type == Message_1.MessageType.Image;
}
exports.isImageMessage = isImageMessage;
function isVideoMessage(message) {
    return isMediaMessage(message) && message.type == Message_1.MessageType.Video;
}
exports.isVideoMessage = isVideoMessage;
function isStickerMessage(message) {
    return isMediaMessage(message) && message.type == Message_1.MessageType.Sticker;
}
exports.isStickerMessage = isStickerMessage;
function isAudioMessage(message) {
    return isMediaMessage(message) && message.type == Message_1.MessageType.Audio;
}
exports.isAudioMessage = isAudioMessage;
function isTextMessage(message) {
    return isMessage(message) && message.type == Message_1.MessageType.Text;
}
exports.isTextMessage = isTextMessage;
function isButtonMessage(message) {
    return (isMessage(message) && message.type == Message_1.MessageType.Button) || message.type == Message_1.MessageType.TemplateButton;
}
exports.isButtonMessage = isButtonMessage;
function isButtonTemplateMessage(message) {
    return isMessage(message) && message.type == Message_1.MessageType.TemplateButton;
}
exports.isButtonTemplateMessage = isButtonTemplateMessage;
function isContactMessage(message) {
    return isMessage(message) && message.type == Message_1.MessageType.Contact;
}
exports.isContactMessage = isContactMessage;
function isListMessage(message) {
    return isMessage(message) && message.type == Message_1.MessageType.List;
}
exports.isListMessage = isListMessage;
function isLocationMessage(message) {
    return isMessage(message) && message.type == Message_1.MessageType.Location;
}
exports.isLocationMessage = isLocationMessage;
function isPollMessage(message) {
    return isMessage(message) && (message.type == Message_1.MessageType.Poll || message.type == Message_1.MessageType.PollUpdate);
}
exports.isPollMessage = isPollMessage;
function isPollUpdateMessage(message) {
    return isMessage(message) && message.type == Message_1.MessageType.PollUpdate;
}
exports.isPollUpdateMessage = isPollUpdateMessage;
function isReactionMessage(message) {
    return isMessage(message) && message.type == Message_1.MessageType.Reaction;
}
exports.isReactionMessage = isReactionMessage;
function isEmptyMessage(message) {
    return isMessage(message) && message.type == Message_1.MessageType.Empty;
}
exports.isEmptyMessage = isEmptyMessage;
//# sourceMappingURL=Message.js.map