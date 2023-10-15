import Message, { MessageType } from "./Message";
import { injectJSON } from "../utils/Generic";
import Chat from "../chat/Chat";

/**
 * Representa um botão em uma mensagem.
 */
export type Button = {
  /** Posição do botão na lista. */
  index: number;
  /** Tipo do botão. */
  type: ButtonType;
  /** Texto exibido no botão. */
  text: string;
  /** Conteúdo associado ao botão (pode ser uma URL, telefone ou ID de resposta). */
  content: string;
};

/**
 * Tipo de botão disponível.
 */
export enum ButtonType {
  /** Botão de resposta. */
  Reply = "reply",
  /** Botão para fazer uma ligação. */
  Call = "call",
  /** Botão para abrir uma URL. */
  Url = "url",
}

/**
 * Representa uma mensagem com botões interativos.
 */
export default class ButtonMessage extends Message {
  /** O tipo da mensagem é MessageType.Button ou MessageType.TemplateButton. */
  public type: MessageType.Button | MessageType.TemplateButton = MessageType.TemplateButton;

  /** Texto exibido no rodapé da mensagem. */
  public footer: string;

  /** Lista de botões associados à mensagem. */
  public buttons: Button[] = [];

  /**
   * Cria uma nova instância de ButtonMessage.
   * @param chat - O chat associado à mensagem de botões (opcional).
   * @param text - O texto da mensagem (opcional).
   * @param footer - Texto exibido no rodapé da mensagem (padrão é uma string vazia).
   * @param others - Outras propriedades da mensagem de botões (opcional).
   */
  constructor(chat?: Chat | string, text?: string, footer: string = "", others: Partial<ButtonMessage> = {}) {
    super(chat, text);

    this.footer = footer;

    injectJSON(others, this);
  }

  /**
   * Adiciona um botão de URL à mensagem.
   * @param text - Texto exibido no botão.
   * @param url - URL associada ao botão.
   * @param index - Posição do botão na lista (padrão é a próxima posição disponível).
   */
  public addUrl(text: string, url: string, index: number = this.buttons.length + 1) {
    this.buttons.push({ index, type: ButtonType.Url, text, content: url });
  }

  /**
   * Adiciona um botão de chamada telefônica à mensagem.
   * @param text - Texto exibido no botão.
   * @param phone - Número de telefone associado ao botão.
   * @param index - Posição do botão na lista (padrão é a próxima posição disponível).
   */
  public addCall(text: string, phone: string, index: number = this.buttons.length + 1) {
    this.buttons.push({ index, type: ButtonType.Call, text, content: phone });
  }

  /**
   * Adiciona um botão de resposta interativa à mensagem.
   * @param text - Texto exibido no botão.
   * @param id - ID de resposta associado ao botão.
   * @param index - Posição do botão na lista (padrão é a próxima posição disponível).
   */
  public addReply(text: string, id: string = String(this.buttons.length + 1), index: number = this.buttons.length + 1) {
    this.buttons.push({ index, type: ButtonType.Reply, text, content: id });
  }

  /**
   * Remove um botão da lista com base na posição.
   * @param index - Posição do botão a ser removido.
   */
  public remove(index: number) {
    this.buttons.splice(index, 1);
  }

  /**
   * Converte o objeto atual para uma representação em formato JSON.
   * @returns Um objeto JSON que representa o estado atual do objeto.
   */
  public toJSON(): any {
    const data: Record<string, any> = {};

    for (const key of Object.keys(this)) {
      if (key == "toJSON") continue;

      data[key] = this[key];
    }

    return JSON.parse(JSON.stringify(data));
  }

  /**
   * Desserializa um objeto JSON em uma instância de ButtonMessage.
   * @param data - O objeto JSON a ser desserializado.
   * @returns Uma instância de ButtonMessage.
   */
  public static fromJSON(data: any): ButtonMessage {
    return !data || typeof data != "object" ? new ButtonMessage() : injectJSON(data, new ButtonMessage());
  }

  /**
   * Verifica se um objeto é uma instância válida de ButtonMessage.
   * @param message - O objeto a ser verificado como uma instância de ButtonMessage.
   * @returns Verdadeiro se o objeto for uma instância válida de ButtonMessage, caso contrário, falso.
   */
  public static isValid(message: any): message is ButtonMessage {
    return typeof message === "object" && Object.keys(new ButtonMessage()).every((key) => message?.hasOwnProperty(key));
  }
}
