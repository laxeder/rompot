"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReactionMessage = void 0;
const Message_1 = require("./Message");
class ReactionMessage extends Message_1.Message {
    constructor(chat, text, idMessage) {
        super(chat, text);
        if (idMessage instanceof Message_1.Message) {
            this.setId(idMessage.id || "");
        }
        else
            this.setId(idMessage);
    }
}
exports.ReactionMessage = ReactionMessage;
//# sourceMappingURL=ReactionMessage.js.map