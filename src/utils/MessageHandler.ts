import Message from '../messages/Message';

/**
 * Mensagem a ser tratada
 */
export type MessageHandlerConfig = {
  stopRead: boolean;
  patterns: Array<(message: Message) => boolean>;
  resolve(message: Message): void;
};

/**
 * Representa um objeto que lida com mensagens e seus tratamentos personalizados.
 */
export default class MessageHandler {
  /**
   * Um registro de mensagens e seus tratamentos associados, organizados por chat ID.
   */
  public messages: Record<string, Array<MessageHandlerConfig>> = {};

  /**
   * Cria uma nova instância de MessageHandler.
   * @param messages - Um registro de mensagens e tratamentos personalizados (opcional).
   */
  constructor(messages: Record<string, Array<MessageHandlerConfig>> = {}) {
    this.messages = messages;
  }

  /**
   * Adiciona uma mensagem e seu tratamento personalizado associado a um chat ID.
   * @param chatId - O ID do chat ao qual a mensagem está associada.
   * @param config - As configurações do tratamento personalizado.
   * @returns Uma promessa que resolve com a mensagem.
   */
  public async addMessage(
    chatId: string,
    config: Partial<MessageHandlerConfig>,
  ): Promise<Message> {
    if (!(chatId in this.messages)) {
      this.messages[chatId] = [];
    }

    return new Promise((resolve) => {
      this.messages[chatId].push({
        stopRead: !!config.stopRead,
        patterns: config.patterns || [],
        resolve,
      });
    });
  }

  /**
   * Resolve uma mensagem e seus tratamentos personalizados associados a um chat ID.
   * @param message - A mensagem a ser resolvida.
   * @returns Verdadeiro se a resolução deve interromper a leitura adicional de mensagens, caso contrário, falso.
   */
  public resolveMessage(message: Message): boolean {
    const chatId: string = message.chat.id!;

    if (!chatId || !(chatId in this.messages)) return false;

    let stopRead: boolean = false;

    for (const msg of this.messages[chatId]) {
      if (msg.patterns.some((ptn) => ptn(message))) return false;

      msg.resolve(message);

      this.messages[chatId] = this.messages[chatId].filter((m) => msg != m);

      stopRead = stopRead || msg.stopRead;
    }

    return stopRead;
  }

  /**
   * Ignora mensagens provenientes do próprio usuário.
   * @param message - A mensagem a ser verificada.
   * @returns Verdadeiro se a mensagem deve ser ignorada, caso contrário, falso.
   */
  public static ignoreMessageFromMe(message: Message): boolean {
    return !!message?.fromMe;
  }

  /**
   * Ignora mensagens não oficiais.
   * @param message - A mensagem a ser verificada.
   * @returns Verdadeiro se a mensagem deve ser ignorada, caso contrário, falso.
   */
  public static ignoreUnofficialMessage(message: Message): boolean {
    return !!message?.isUnofficial;
  }

  /**
   * Ignora um conjunto específico de mensagens.
   * @param messages - Um conjunto de mensagens a serem ignoradas.
   * @returns Uma função que verifica se uma mensagem deve ser ignorada.
   */
  public static ignoreMessages(
    ...messages: Message[]
  ): (message: Message) => boolean {
    return (message) => messages.some((msg) => msg.id == message.id);
  }
}
