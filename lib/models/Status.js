"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Status = void 0;
class Status {
    constructor(status, chat, message) {
        this.message = message;
        this.status = status;
        this.chat = chat;
    }
    /**
     * * Define o status
     * @param status
     */
    setStatus(status) {
        this.status = status;
    }
    /**
     * * Define a sala de bate-papo que está com o status
     * @param chat
     */
    setChat(chat) {
        this.chat = chat;
    }
    /**
     * * Define a mensagem que está com esse status
     * @param message
     */
    setMessage(message) {
        this.message = message;
    }
    /**
     * * Retorna o status
     * @returns
     */
    getStatus() {
        return this.status;
    }
    /**
     * * retorna a sala de bate-papo que está com o status
     * @returns
     */
    getChat() {
        return this.chat;
    }
    /**
     * *  Retorna a mensagem que está com esse status
     * @returns
     */
    getMessage() {
        return this.message;
    }
}
exports.Status = Status;
//# sourceMappingURL=Status.js.map