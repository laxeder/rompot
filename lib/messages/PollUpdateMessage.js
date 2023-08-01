"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const rompot_base_1 = require("rompot-base");
const index_1 = require("./index");
const Generic_1 = require("../utils/Generic");
class PollUpdateMessage extends index_1.PollMessage {
    constructor(chat, text, options, others = {}) {
        super(chat, text, options);
        this.type = rompot_base_1.MessageType.PollUpdate;
        this.action = "add";
        (0, Generic_1.injectJSON)(others, this);
    }
}
exports.default = PollUpdateMessage;
//# sourceMappingURL=PollUpdateMessage.js.map