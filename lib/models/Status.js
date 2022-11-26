"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Status = void 0;
class Status {
    constructor(status, chat, id) {
        this.status = status;
        this.chat = chat;
        this.id = id;
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
     * * Define o ID da mensagem que está com esse status
     * @param id
     */
    setId(id) {
        this.id = id;
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
     * *  Retorna o ID da mensagem que está com esse status
     * @returns
     */
    getId() {
        return this.id;
    }
}
exports.Status = Status;
//# sourceMappingURL=Status.js.map