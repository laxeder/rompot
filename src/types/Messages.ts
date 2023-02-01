import { MessageInterface } from "@interfaces/MessagesInterfaces";

import Chat from "@modules/Chat";
import User from "@modules/User";

import { BotModule } from "./BotModule";

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

export type MessageModule = MessageInterface & {
  chat: Chat;

  user: User;

  mention?: MessageModule;

  /**
   * * Bot que irá executar os métodos
   */
  bot: BotModule;

  /**
   * * Adiciona uma reação a mensagem
   * @param reaction Reação
   */
  addReaction(reaction: string): Promise<void>;

  /**
   * * Envia uma mensagem na sala de bate-papo que a mensagem foi enviada
   * @param message Mensagem que será enviada
   */
  send(message: MessageInterface | string): Promise<MessageModule>;

  /**
   * * Envia uma mensagem mencionando a mensagem atual
   * @param message Mensagem que terá enviada
   */
  reply(message: MessageInterface | string, mention: boolean): Promise<MessageModule>;

  /**
   * * Marca mensagem como visualizada
   */
  read(): Promise<void>;

  /**
   * * Injeta a interface no modulo
   * @param bot Bot que irá executar os métodos
   * @param message Interface da mensagem
   */
  inject(bot: BotModule, message: MessageInterface): void;
};

export interface MediaMessageModule extends MessageModule {}

export interface ImageMessageModule extends MediaMessageModule {}

export interface VideoMessageModule extends MediaMessageModule {}

export interface ContactMessageModule extends MessageModule {}

export interface LocationMessageModule extends MessageModule {
  /**
   * * Define a latitude e longitude da localização
   * @param latitude
   * @param longitude
   */
  setLocation(latitude: number, longitude: number): void;
}

export interface ListMessageModule extends MessageModule {
  /**
   * * Adiciona uma seção
   * @param title Titulo da lista
   * @param items Items da lista
   * @returns Categoria criada
   */
  addCategory(title: string, items: ListItem[]): number;

  /**
   * * Adiciona um item a lista
   * @param index Categoria do item
   * @param title Titulo do item
   * @param description Descrição do item
   * @param id ID do item
   */
  addItem(index: number, title: string, description: string, id: string): void;
}

export interface ButtonMessageModule extends MessageModule {
  /**
   * * Adiciona um botão com uma url
   * @param text Texto da botão
   * @param url Url do botão
   * @param index Posição do botão
   */
  addUrl(text: string, url: string, index: number): void;

  /**
   * * Adiciona um botão com um telefone
   * @param text Texto do botão
   * @param phone Tefefone do botão
   * @param index Posição do botão
   */
  addCall(text: string, phone: string, index: number): void;

  /**
   * * Adiciona um botão respondivel
   * @param text Texto do botão
   * @param id ID do botão
   * @param index Posição do botão
   */
  addReply(text: string, id: string, index: number): void;

  /**
   * * Remove um botão
   * @param index Posição do botão
   */
  remove(index: number): void;
}
