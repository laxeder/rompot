import Message, { MessageType } from "./Message";
import { injectJSON } from "../utils/Generic";
import Chat from "../chat/Chat";

/** Lista */
export type List = {
  /** Titulo da lista */
  title: string;
  /** Itens da lista */
  items: ListItem[];
};

/** Item da lista */
export type ListItem = {
  /** Titulo do item */
  title: string;
  /** Descrição do item */
  description: string;
  /** Identificador do item */
  id: string;
};

/**
 * Representa uma mensagem de lista.
 */
export default class ListMessage extends Message {
  /** O tipo da mensagem é sempre MessageType.List. */
  public readonly type = MessageType.List;
  /** Lista de categorias e itens. */
  public list: List[] = [];
  /** Texto do botão associado à lista. */
  public button: string;
  /** Texto do rodapé da lista. */
  public footer: string;
  /** Título da lista. */
  public title: string;

  /**
   * Cria uma nova instância de ListMessage.
   * @param chat - O chat associado à mensagem de lista (opcional).
   * @param text - O texto da mensagem (opcional).
   * @param button - Texto do botão (padrão é uma string vazia).
   * @param footer - Texto do rodapé (padrão é uma string vazia).
   * @param title - Título da lista (padrão é uma string vazia).
   * @param others - Outras propriedades da mensagem de lista (opcional).
   */
  constructor(chat?: Chat | string, text?: string, button: string = "", footer: string = "", title: string = "", others: Partial<ListMessage> = {}) {
    super(chat, text);

    this.button = button;
    this.footer = footer;
    this.title = title;

    injectJSON(others, this);
  }

  /**
   * Adiciona uma seção à lista.
   * @param title - Título da categoria.
   * @param items - Itens da categoria (padrão é uma lista vazia).
   * @returns O índice da categoria criada.
   */
  public addCategory(title: string, items: ListItem[] = []): number {
    const index = this.list.length;

    this.list.push({ title, items });

    return index;
  }

  /**
   * Adiciona um item a uma categoria existente na lista.
   * @param index - Índice da categoria em que o item será adicionado.
   * @param title - Título do item.
   * @param description - Descrição do item (padrão é uma string vazia).
   * @param id - ID do item (padrão é um timestamp em forma de string).
   */
  public addItem(index: number, title: string, description: string = "", id: string = String(Date.now())) {
    return this.list[index].items.push({ title, description, id });
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
   * Desserializa um objeto JSON em uma instância de ListMessage.
   * @param data - O objeto JSON a ser desserializado.
   * @returns Uma instância de ListMessage.
   */
  public static fromJSON(data: any): ListMessage {
    return !data || typeof data != "object" ? new ListMessage() : injectJSON(data, new ListMessage());
  }

  /**
   * Verifica se um objeto é uma instância válida de ListMessage.
   * @param message - O objeto a ser verificado como uma instância de ListMessage.
   * @returns Verdadeiro se o objeto for uma instância válida de ListMessage, caso contrário, falso.
   */
  public static isValid(message: any): message is ListMessage {
    return Message.isValid(message) && message?.type == MessageType.List;
  }
}
