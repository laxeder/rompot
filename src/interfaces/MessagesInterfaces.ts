import UserInterface from "@interfaces/UserInterface";
import ChatInterface from "@interfaces/ChatInterface";

import { Button, List, ListItem } from "../types/Message";
import { BotModule } from "../types/Bot";

export interface MessageInterface {
  /**
   * * ID da mensagem
   */
  id: string;

  /**
   * * Sala de bate-papo que foi enviada a mensagem
   */
  chat: ChatInterface;

  /**
   * * Usuário que mandou a mensagem
   */
  user: UserInterface;

  /**
   * * Texto da mensagem
   */
  text: string;

  /**
   * * Mensagem enviada por mim
   */
  fromMe: boolean;

  /** * Opção selecionada */
  selected: string;

  /**
   * * Usuários que foram mencionados na mensagem
   */
  mentions: string[];

  /**
   * * Mensagem mencionada na mensagem
   */
  mention?: MessageInterface;

  /**
   * * Tempo em que a mensagem foi enviada
   */
  timestamp: Number | Long;

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
   * * Envia uma mensagem mencionando a mensagem atual
   * @param message Mensagem que terá enviada
   * @param mention Se verdadeiro a mensagem é mencionada
   */
  reply(message: MessageInterface | string, mention: boolean): Promise<MessageInterface>;

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
}

export interface MediaMessageInterface extends MessageInterface {
  //TODO: Adicionar mimetype

  /**
   * * Conteúdo da mensagem
   */
  file: any;

  /**
   * * Retorna se o conteúdo é um GIF
   */
  isGIF: boolean;

  /**
   * * Método para obter o conteúdo da mensagem
   * @param stream Conteúdo que será obtido
   * @return Conteúdo da mensagem
   */
  getStream(stream: any): Promise<Buffer>;
}

export interface ImageMessageInterface extends MediaMessageInterface {
  /**
   * @return Retorna a imagem da mensagem
   */
  getImage(): Promise<Buffer>;
}

export interface VideoMessageInterface extends MediaMessageInterface {
  /**
   * @returns Retorna o video da mensagem
   */
  getVideo(): Promise<Buffer>;
}

export interface AudioMessageInterface extends MediaMessageInterface {
  /**
   * @return Retorna o audio da mensagem
   */
  getAudio(): Promise<Buffer>;
}

export interface LocationMessageInterface extends MessageInterface {
  /**
   * * Longitude da localização
   */
  latitude: number;

  /**
   * * Latitude da localização
   */
  longitude: number;

  /**
   * * Define a latitude e longitude da localização
   * @param latitude
   * @param longitude
   */
  setLocation(latitude: number, longitude: number): void;
}

export interface ContactMessageInterface extends MessageInterface {
  /**
   * * Contatos da mensagem
   */
  contacts: string[];
}

export interface ListMessageInterface extends MessageInterface {
  /**
   * * Titulo da mensagem
   */
  title: string;

  /**
   * * Rodapé da mensagem
   */
  footer: string;

  /**
   * * Botão da mensagem
   */
  button: string;

  /**
   * * Lista da mensagem
   */
  list: List[];

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

export interface ButtonMessageInterface extends MessageInterface {
  /**
   * * Botões da mensagem
   */
  buttons: Button[];

  /**
   * * Rodapé da mensagem
   */
  footer: string;

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
