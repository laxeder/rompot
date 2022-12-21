"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Status = void 0;
const Chat_1 = require("./Chat");
class Status {
    constructor(status, chat, message) {
        this.message = message;
        this.status = status;
        this.chat = chat;
    }
    /**
     * * Define a sala de bate-papo que está com o status
     * @param chat
     */
    setChat(chat) {
        if (!(chat instanceof Chat_1.Chat))
            chat = new Chat_1.Chat(`${chat}`);
        this.chat = chat;
    }
}
exports.Status = Status;
//# sourceMappingURL=Status.js.map