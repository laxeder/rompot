import type { Media } from "../types/Message";

import { MessageType } from "@enums/Message";

import { IClient } from "@interfaces/IClient";

import User from "@modules/User";
import Chat from "@modules/Chat";

export interface IMessage {
  get client(): IClient;

  set client(client: IClient);

  /** * Tipo da mensagem */
  type: MessageType;
  /** * Sala de bate-papo que foi enviada a mensagem */
  chat: Chat;
  /** * Usuário que mandou a mensagem */
  user: User;
  /** * Texto da mensagem */
  text: string;
  /** * Mensagem mencionada na mensagem */
  mention?: IMessage | undefined;
  /** * ID da mensagem */
  id: string;
  /** * Mensagem enviada pelo bot */
  fromMe: boolean;
  /** * Mensagem enviada pela api */
  apiSend: boolean;
  /** * Mensagem foi deletada */
  isDeleted: boolean;
  /** * Opção selecionada */
  selected: string;
  /** * Usuários mencionados na mensagem */
  mentions: string[];
  /** * Tempo em que a mensagem foi enviada */
  timestamp: Number | Long;

  /**
   * * Adiciona uma reação a mensagem
   * @param reaction Reação
   */
  addReaction(reaction: string): Promise<void>;

  /**
   * * Remove a reação da mensagem
   */
  removeReaction(): Promise<void>;

  /**
   * * Adiciona animações na reação da mensagem
   * @param reactions Reações em sequência
   * @param interval Intervalo entre cada reação
   * @param maxTimeout Maximo de tempo reagindo
   */
  addAnimatedReaction(reactions: string[], interval?: number, maxTimeout?: number): (reactionStop?: string) => Promise<void>;

  /**
   * * Envia uma mensagem mencionando a mensagem atual
   * @param message Mensagem que terá enviada
   * @param mention Se verdadeiro a mensagem é mencionada
   */
  reply(message: IMessage | string, mention: boolean): Promise<IMessage>;
  /**
   * * Marca mensagem como visualizada
   */
  read(): Promise<void>;
}

export interface IMediaMessage extends IMessage {
  /** * Arquivo da mensagem */
  file: Media | Buffer | string;
  /** * O arquivo é um GIF */
  isGIF: boolean;
  /** * MimeType */
  mimetype: string;
  /** * Nome do arquivo */
  name: string;

  /**
   * @returns Obter arquivo
   */
  getStream(): Promise<Buffer>;
}
