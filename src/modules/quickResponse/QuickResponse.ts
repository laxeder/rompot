import type { QuickResponsePattern } from "./QuickResponsePattern";
import type { QuickResponseReply } from "./QuickResponseReply";

import QuickResponseOptions from "./QuickResponseOptions";
import Message from "../../messages/Message";

/**
 * Mensagem rápida.
 * @example
 * const quickResponse1 = new QuickResponse(["comprar", "pedido", "quero"], "Vamos fazer um pedido?");
 *
 * const quickResponse2 = new QuickResponse(/vendem(.*?)\?/, "Vou estar conferindo...", { priority: 1 });
 *
 * const quickResponse3 = new QuickResponse({ patterns: ["hello", "hi", /ola(.*?)\!/], reply: "Hello There!", priority: 2 });
 *
 * const quickResponse4 = new QuickResponse(
 *  async (text, message) => {
 *    await message.addReaction("👋");
 *
 *    return message.chat.type !== ChatType.Group && text.includes("hi");
 *  },
 *  (message) => {
 *    message.reply(`Hello ${message.chat.name}!`);
 *  },
 *  { priority: 1 }
 * );
 */
export default class QuickResponse extends QuickResponseOptions {
  /**
   * @param pattern - O padrão da resposta rápida.
   * @param reply - A resposta da resposta rápida.
   * @param options - As opções da resposta rápida.
   */
  constructor(pattern: QuickResponsePattern, reply: QuickResponseReply, options?: Partial<QuickResponseOptions>);

  /**
   * @param patterns - Lista de padrões da resposta rápida.
   * @param reply - A resposta da resposta rápida.
   * @param options - As opções da resposta rápida.
   */
  constructor(patterns: QuickResponsePattern[], reply: QuickResponseReply, options?: Partial<QuickResponseOptions>);

  /**
   * @param options - As opções da resposta rápida.
   */
  constructor(options: Partial<QuickResponseOptions>);

  /**
   * @param content - O conteúdo da resposta rápida.
   * @param reply - A resposta da resposta rápida.
   * @param options - As opções da mensagem apósida.
   */
  constructor(content: QuickResponsePattern | QuickResponsePattern[] | Partial<QuickResponseOptions>, reply?: QuickResponseReply, options?: Partial<QuickResponseOptions>) {
    super(options);

    if (QuickResponseOptions.isValid(content)) {
      this.inject(content);
    } else {
      if (Array.isArray(content)) {
        this.patterns = content;
      } else {
        this.patterns = [content];
      }

      if (reply) {
        this.reply = reply;
      }
    }
  }

  /**
   * Executa a resposta.
   * @param message - A mensagem de origem.
   * @param pattern - O padrão da mensagem.
   */
  public async execute(message: Message, pattern: QuickResponsePattern): Promise<Message | any> {
    if (typeof this.reply === "function") {
      return await this.reply(message, pattern);
    }

    return await message.reply(this.reply);
  }
}
