import type { QuickResponsePattern } from "./QuickResponsePattern";
import type QuickResponse from "./QuickResponse";
import type Message from "../messages/Message";

import { isRegExp } from "util/types";

/** Controlador das respostas rápidas */
export default class QuickResponseController {
  /** Lista de respostas rápidas separadas por prioridade */
  public quickResponseByPriority: Record<number, QuickResponse[]> = {};

  /** Usar letras minúsculas na busca */
  public useLowerCase: boolean = true;

  /**
   * @param quickResponses - As respostas rápidas.
   * @param options - As opções do controlador.
   */
  constructor(quickResponses: QuickResponse[], options?: Partial<QuickResponseController>);

  /**
   * @param options - As opções do controlador.
   * @param quickResponses - As mensagens mínpidas.
   */
  constructor(options?: Partial<QuickResponseController>, quickResponses?: QuickResponse[]);

  constructor(arg1?: Partial<QuickResponseController> | QuickResponse[], arg2?: Partial<QuickResponseController> | QuickResponse[]) {
    if (arg1) {
      if (!Array.isArray(arg1)) this.inject(arg1);
      else this.add(...arg1);
    }

    if (arg2) {
      if (!Array.isArray(arg2)) this.inject(arg2);
      else this.add(...arg2);
    }
  }

  /**
   * Injeta os dados no controlador.
   * @param options - Dados a serem injetados.
   */
  public inject(options: Partial<QuickResponseController>): void {
    this.useLowerCase = options?.useLowerCase ?? this.useLowerCase;
  }

  /**
   * Adiciona uma ou mais respostas rápidas.
   * @param quickResponses - As respostas rápidas.
   */
  public add(...quickResponses: QuickResponse[]): void {
    for (const quickResponse of quickResponses) {
      if (!this.quickResponseByPriority[quickResponse.priority]) {
        this.quickResponseByPriority[quickResponse.priority] = [quickResponse];
      } else {
        this.quickResponseByPriority[quickResponse.priority].push(quickResponse);
      }
    }
  }

  /**
   * Remove uma ou mais mensagens específicas.
   * @param quickResponses - As respostas rápidas a serem removidas.
   */
  public remove(...quickResponses: Array<QuickResponse | string>): void {
    for (const quickResponse of quickResponses) {
      if (typeof quickResponse === "string") {
        for (const priority of Object.keys(this.quickResponseByPriority)) {
          this.quickResponseByPriority[priority] = this.quickResponseByPriority[priority].filter((q) => q.id !== quickResponse);
        }
      } else {
        this.quickResponseByPriority[quickResponse.priority] = this.quickResponseByPriority[quickResponse.priority].filter((q) => q.id === quickResponse.id);
      }
    }
  }

  /**
   * @returns As respostas rápidas.
   */
  public getAll(): QuickResponse[] {
    return Object.values(this.quickResponseByPriority).flat();
  }

  public async searchAndExecute(message: Message): Promise<Message | null | unknown> {
    const res = await this.search(message);

    if (!res) return null;

    return await res.quickResponse.execute(message, res.pattern);
  }

  /**
   * Pesquisa por uma resposta rápida.
   * @param message - A mensagem de referencia.
   */
  public async search(message: Message): Promise<{ quickResponse: QuickResponse; pattern: QuickResponsePattern } | null> {
    const text = this.useLowerCase ? message.text.toLowerCase() : message.text;

    const priorities = Object.keys(this.quickResponseByPriority).sort((a, b) => +a - +b);

    for (const priority of priorities) {
      for (const quickResponse of this.quickResponseByPriority[priority]) {
        const pattern = await this.searchInPatterns(text, message, ...quickResponse.patterns);

        if (pattern !== null) {
          return { quickResponse, pattern };
        }
      }
    }

    return null;
  }

  /**
   * Pesquisa por um padrão na mensagem.
   * @param text - O texto a ser pesquisado.
   * @param message - A mensagem de referencia.
   * @param patterns - Os padrões da resposta rápida.
   */
  public async searchInPatterns(text: string, message: Message, ...patterns: QuickResponsePattern[]): Promise<QuickResponsePattern | null> {
    const resultInPromsie: Array<{ pattern: QuickResponsePattern; result: Promise<boolean> }> = [];

    for (const pattern of patterns) {
      if (typeof pattern === "string") {
        if (text.includes(this.useLowerCase ? pattern.toLowerCase() : pattern)) return pattern;
      } else if (isRegExp(pattern)) {
        if (pattern.test(text)) return pattern;
      } else if (typeof pattern === "function") {
        const result = pattern(text, message, this);

        if (!result) continue;

        if (typeof result === "boolean") return pattern;

        resultInPromsie.push({ pattern, result });
      }
    }

    for (const { pattern, result } of resultInPromsie) {
      if (await result) return pattern;
    }

    return null;
  }
}
