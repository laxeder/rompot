import { IMessage, PromiseMessage, PromiseMessageConfig, IPromiseMessage } from "rompot-base";

export default class PromiseMessages implements IPromiseMessage {
  public promisses: PromiseMessage = {};

  constructor(promisses: PromiseMessage = {}) {
    this.promisses = promisses;
  }

  public async addPromiseMessage(chatId: string, config: Partial<PromiseMessageConfig>): Promise<IMessage> {
    if (!this.promisses.hasOwnProperty(chatId)) {
      this.promisses[chatId] = [];
    }

    return new Promise((resolve) => {
      this.promisses[chatId].push({
        stopRead: !!config.stopRead,
        ignoreMessageFromMe: !!config.ignoreMessageFromMe,
        ignoreMessages: config.ignoreMessages || [],
        resolve,
      });
    });
  }

  public resolvePromiseMessages(message: IMessage): boolean {
    const chatId: string = message.chat.id!;
    var stop: boolean = false;

    if (!!!chatId || !this.promisses.hasOwnProperty(chatId)) return stop;

    this.promisses[chatId].forEach((prom, index) => {
      if (message.fromMe && prom.ignoreMessageFromMe) return;

      let cont: boolean = true;

      for (const m of prom.ignoreMessages) {
        if (m.id == message.id) {
          cont = false;
          break;
        }
      }

      if (!cont) return;

      prom.resolve(message);

      this.promisses[chatId].splice(index, 1);

      if (prom.stopRead) stop = true;
    });

    return stop;
  }
}
