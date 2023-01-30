import { ChatTypes, ChatUsers } from "../types/Chat";

export default interface ChatInterface {
  /**
   * * ID da sala de bate-papo
   */
  id: string;

  /**
   * * Nome da sala de bate-papo
   */
  name: string;

  /**
   * * Descrição da sala de bate-papo
   */
  description: string;

  /**
   * * Foto de perfil da sala de bate-papo
   */
  profile: Buffer;

  /**
   * * Tipo da sala de bate-papo
   */
  type: ChatTypes;

  /**
   * * Usuários que estão naquela sala de bate-papo
   */
  users: ChatUsers;
}
