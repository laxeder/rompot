import { IMessage, PromiseMessage, PromiseMessageConfig, IPromiseMessage } from "rompot-base";
export default class PromiseMessages implements IPromiseMessage {
    promisses: PromiseMessage;
    constructor(promisses?: PromiseMessage);
    addPromiseMessage(chatId: string, config: Partial<PromiseMessageConfig>): Promise<IMessage>;
    resolvePromiseMessages(message: IMessage): boolean;
}
