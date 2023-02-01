import UserInterface from "@interfaces/UserInterface";

import { Message } from "@messages/Message";

import Chat from "@modules/Chat";
import User from "@modules/User";

import { Button, List } from "../types/Message";

export interface MessageInterface {
  /**
   * * ID da mensagem
   */
  id: string;

  /**
   * * Sala de bate-papo que foi enviada a mensagem
   */
  chat: Chat;

  /**
   * * Usuário que mandou a mensagem
   */
  user: User;

  /**
   * * Texto da mensagem
   */
  text: string;

  /**
   * * Mensagem enviada por mim
   */
  fromMe: boolean;

  /**
   * * Usuários que foram mencionados na mensagem
   */
  mentions: string[];

  /**
   * * Mensagem mencionada na mensagem
   */
  mention: Message;

  /**
   * * Tempo em que a mensagem foi enviada
   */
  timestamp: Number | Long;
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
  getStream(stream: any): Buffer;
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

export interface LocationMessageInterface extends MessageInterface {
  /**
   * * Longitude da localização
   */
  latitude: number;

  /**
   * * Latitude da localização
   */
  longitude: number;
}

export interface ContactMessageInterface extends MessageInterface {
  /**
   * * Contatos da mensagem
   */
  contacts: UserInterface[];
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
}
