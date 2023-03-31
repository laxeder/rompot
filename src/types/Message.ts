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
   * * Tipo do botão
   */
  type: ButtonType;

  /**
   * * Texto do botão
   */
  text: string;

  /**
   * * Conteúdo do botão
   */
  content: string;
};

export type ButtonType = "reply" | "call" | "url";

export type PollOption = { id: string; name: string };

export type Media = { stream: any };
