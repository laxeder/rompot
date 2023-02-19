"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class PromiseMessages {
    constructor(promisses = {}) {
        this.promisses = {};
        this.promisses = promisses;
    }
    /**
     * * Adiciona uma nova promessa de mensagem
     * @param chatId Sala de bate-papo que irá receber a mensagem
     * @param ignoreMessageFromMe Ignora a mensagem se quem enviou foi o próprio bot
     * @param stopRead Para de ler a mensagem no evento
     * @param ignoreMessages Não resolve a promessa se a mensagem recebida é a mesma escolhida
     * @returns
     */
    addPromiseMessage(chatId, ignoreMessageFromMe = true, stopRead = true, ...ignoreMessages) {
        if (!this.promisses.hasOwnProperty(chatId)) {
            this.promisses[chatId] = [];
        }
        return new Promise((resolve) => {
            this.promisses[chatId].push({
                stopRead,
                ignoreMessageFromMe,
                ignoreMessages,
                resolve,
            });
        });
    }
    /**
     * * Resolve promessas de mensagens que estão esperando ser recebidas
     * @param message
     * @returns Retorna se é para continuar a leitura da mensagem na sala de bate-papo ou não
     */
    resolvePromiseMessages(message) {
        const chatId = message.chat.id;
        var stop = false;
        if (!!!chatId || !this.promisses.hasOwnProperty(chatId))
            return stop;
        this.promisses[chatId].forEach((prom, index) => {
            if (message.fromMe && prom.ignoreMessageFromMe)
                return;
            let cont = true;
            for (const m of prom.ignoreMessages) {
                if (m.id == message.id) {
                    cont = false;
                    break;
                }
            }
            if (!cont)
                return;
            prom.resolve(message);
            this.promisses[chatId].splice(index, 1);
            if (prom.stopRead)
                stop = true;
        });
        return stop;
    }
}
exports.default = PromiseMessages;
//# sourceMappingURL=PromiseMessages.js.map