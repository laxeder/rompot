import Message from "../messages/Message";
export declare type PromiseMessage = {
    [chatId: string]: {
        stopRead: boolean;
        ignoreMessageFromMe: boolean;
        ignoreMessages: Message[];
        resolve(message: Message): void;
    }[];
};
export default class PromiseMessages {
    promisses: PromiseMessage;
    constructor(promisses?: PromiseMessage);
    /**
     * * Adiciona uma nova promessa de mensagem
     * @param chatId Sala de bate-papo que irá receber a mensagem
     * @param ignoreMessageFromMe Ignora a mensagem se quem enviou foi o próprio bot
     * @param stopRead Para de ler a mensagem no evento
     * @param ignoreMessages Não resolve a promessa se a mensagem recebida é a mesma escolhida
     * @returns
     */
    addPromiseMessage(chatId: string, ignoreMessageFromMe?: boolean, stopRead?: boolean, ...ignoreMessages: Message[]): Promise<Message>;
    /**
     * * Resolve promessas de mensagens que estão esperando ser recebidas
     * @param message
     * @returns Retorna se é para continuar a leitura da mensagem na sala de bate-papo ou não
     */
    resolvePromiseMessages(message: Message): boolean;
}
