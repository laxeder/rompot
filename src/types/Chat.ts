import ChatInterface from "@interfaces/ChatInterface";
import UserInterface from "@interfaces/UserInterface";

import { BotModule } from "./BotModule";
import { Users } from "./User";

export type ChatType = "community" | "chanel" | "group" | "chat" | "pv";

export type ChatStatus = "recording" | "reading" | "offline" | "typing" | "online";

export type ChatInterfaces = { [id: string]: ChatInterface };

export type Chats = { [id: string]: ChatModule };

export type ChatAction = "add" | "remove";

export type ChatModule = ChatInterface & {
  /**
   * * Bot que será executado os métodos
   */
  bot: BotModule;

  /**
   * @returns Retorna o nome da sala de bate-papo
   */
  getName(): Promise<string>;

  /**
   * * Define o nome da sala de bate-pao
   * @param name Nome da sala de bate-pao
   */
  setName(name: string): Promise<void>;

  /**
   * @returns Retorna a descrição da sala de bate-papo
   */
  getDescription(): Promise<string>;

  /**
   * * Define a descrição da sala de bate-pao
   * @param description Descrição da  sala de bate-pao
   */
  setDescription(description: string): Promise<void>;

  /**
   * @returns Retorna a imagem de perfil da sala de bate-papo
   */
  getProfile(): Promise<Buffer>;

  /**
   * * Define a foto de perfil da sala de bate-papo
   * @param image Foto de perfil da sala de bate-papo
   */
  setProfile(image: Buffer): Promise<void>;

  /**
   * @param user Usuário que será verificado
   * @returns Retorna se o usuário é administrador da sala de bate-papo
   */
  IsAdmin(user: UserInterface | string): Promise<boolean>;

  /**
   * @param user Usuário que será verificado
   * @returns Retorna se o usuário é lider da sala de bate-papo
   */
  IsLeader(user: UserInterface | string): Promise<boolean>;

  /**
   * @returns Retorna os administradores daquela sala de bate-papo
   */
  getAdmins(): Promise<Users>;

  /**
   * * Adiciona um usuário a sala de bate-papo
   * @param user Usuário que será adicionado
   */
  addUser(user: UserInterface | string): Promise<void>;

  /**
   * * Remove um usuário da sala de bate-papo
   * @param user
   */
  removeUser(user: UserInterface | string): Promise<void>;

  /**
   * * Promove a administrador um usuário da sala de bate-papo
   * @param user Usuário que será promovido
   */
  promote(user: UserInterface | string): Promise<void>;

  /**
   * * Remove o administrador de um usuário da sala de bate-papo
   * @param user Usuário que terá sua administração removida
   */
  demote(user: UserInterface | string): Promise<void>;

  /**
   * * Sai da sala de bate-papo
   */
  leave(): Promise<void>;
};
