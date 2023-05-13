import { IMessage } from "@interfaces/IMessage";

export type PromiseMessage = {
  [chatId: string]: {
    stopRead: boolean;
    ignoreMessageFromMe: boolean;
    ignoreMessages: IMessage[];
    resolve(message: IMessage): void;
  }[];
};

export default class PromiseMessages {
  public promisses: PromiseMessage = {};

  constructor(promisses: PromiseMessage = {}) {
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
  public addPromiseMessage(chatId: string, ignoreMessageFromMe: boolean = true, stopRead: boolean = true, ...ignoreMessages: IMessage[]): Promise<IMessage> {
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
