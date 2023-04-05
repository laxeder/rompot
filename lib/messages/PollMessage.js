"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Message_1 = __importDefault(require("./Message"));
class PollMessage extends Message_1.default {
    constructor(chat, text, options, mention, id, user, fromMe, selected, mentions, timestamp) {
        super(chat, text, mention, id, user, fromMe, selected, mentions, timestamp);
        /** * Opções da enquete */
        this.options = [];
        /** * Chave secreta da enquete */
        this.secretKey = Buffer.from("");
        /** * Last hash votes */
        this.votes = {};
        this.options = options || [];
    }
    /**
     * * Adiciona uma opção a enquete
     * @param name Nome da opção
     * @param id ID da opção
     */
    addOption(name, id = `${Date.now()}`) {
        this.options.push({ name, id });
    }
    /**
     * * Remove uma opção
     * @param option Opção que será removida
     */
    removeOption(option) {
        const options = [];
        for (const opt of this.options) {
            if (opt == option)
                continue;
            options.push(opt);
        }
        this.options = options;
    }
    /**
     * * Obtem os votos de um usuário
     */
    getUserVotes(user) {
        return this.votes[user] || [];
    }
    /**
     * * Salva os votos de um usuário
     */
    setUserVotes(user, hashVotes) {
        this.votes[user] = hashVotes;
    }
    /** * Transforma um objeto em PollMessage */
    static fromJSON(message) {
        var _a;
        const pollMessage = new PollMessage(((_a = message === null || message === void 0 ? void 0 : message.chat) === null || _a === void 0 ? void 0 : _a.id) || "", message.text, message.options, message.mention, message.id, message.user.id, message.fromMe, message.selected, message.mentions, message.timestmap);
        pollMessage.secretKey = Buffer.from((message === null || message === void 0 ? void 0 : message.secretKey) || "");
        pollMessage.votes = (message === null || message === void 0 ? void 0 : message.votes) || [];
        return pollMessage;
    }
}
exports.default = PollMessage;
//# sourceMappingURL=PollMessage.js.map