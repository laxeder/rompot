export interface List {
  /**
   * * Titulo da lista
   */
  title: string;

  /**
   * * Items da lista
   */
  items: ListItem[];
}

export interface ListItem {
  /**
   * * Titulo do item
   */
  title: string;

  /**
   * * Descrição do item
   */
  description: string;

  /**
   * * ID do item
   */
  id: string;
}

export type Button = {
  /**
   * * Posição o botão
   */
  index: number;

  /**
   * * Texto do botão
   */
  text: string;

  /**
   * * ID do botão
   */
  id: string;
};
