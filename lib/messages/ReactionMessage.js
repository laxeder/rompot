"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Message_1 = require("../enums/Message");
const index_1 = require("./index");
const Generic_1 = require("../utils/Generic");
class ReactionMessage extends index_1.Message {
    constructor(chat, reaction, receive, others = {}) {
        super(chat, reaction);
        this.type = Message_1.MessageType.Reaction;
        if (typeof receive === "string") {
            this.id = receive;
        }
        else {
            this.id = receive.id;
        }
        (0, Generic_1.injectJSON)(others, this);
    }
}
exports.default = ReactionMessage;
//# sourceMappingURL=ReactionMessage.js.map