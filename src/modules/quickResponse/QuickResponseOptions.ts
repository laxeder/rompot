import type { QuickResponsePattern } from "./QuickResponsePattern";
import type { QuickResponseReply } from "./QuickResponseReply";

import { isRegExp } from "util/types";

import nonce from "../../utils/nonce";

/** Opções da resposta rápida */
export default class QuickResponseOptions {
  public id: string = "";

  /**
   * * Lista de padrões da mensagem.
   *
   * @example
   *
   * // Normal pattern
   * "buy"
   *
   * // Others pattern
   * ["buy", "get", "search", /\D/g, "hello"]
   *
   * // Regex pattern
   * /search (.?*)?/
   *
   * // Custom pattern
   * (message: Message) => message.text.includes("search")
   *
   * */
  public patterns: QuickResponsePattern[] = [];

  /**
   * * Prioridade da resposta rápida.
   *
   * A prioriddade é definida do maior ao menos (1 = maior, 2 = menor que 1, 3 = menor que 2, ...).
   */
  public priority: number = 1;

  /**
   * * Resposta da resposta rápida.
   *
   * @example
   *
   * // Normal response
   * "Hello World!"
   *
   * // Custom response
   * (message: Message) => {
   *   return `Hello ${message.user.name}!`;
   * }
   *  */
  public reply: QuickResponseReply = "";

  constructor(options?: Partial<QuickResponseOptions>) {
    if (!options?.id) {
      this.id = nonce();
    }

    this.inject(options);
  }

  /**
   * Injeta as opções da resposta rápida.
   * @param options - As opções da resposta rápida.
   */
  public inject(options?: Partial<QuickResponseOptions>): void {
    this.id = options?.id ?? this.id;
    this.patterns = options?.patterns ?? this.patterns;
    this.priority = options?.priority ?? this.priority;
    this.reply = options?.reply ?? this.reply;
  }

  /**
   * Valida se o conteúdo da resposta está correto.
   * @param options - As opções da resposta rápida.
   */
  public static isValid(options: unknown): options is Partial<QuickResponseOptions> {
    return !!options && typeof options === "object" && !Array.isArray(options) && !isRegExp(options);
  }
}
