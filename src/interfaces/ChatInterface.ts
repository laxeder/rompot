import { ChatStatus, ChatType } from "../types/Chat";
import { UserInterfaces } from "../types/User";

export default interface ChatInterface {
  /**
   * * ID da sala de bate-papo
   */
  id: string;

  /**
   * * Tipo da sala de bate-papo
   */
  type: ChatType;

  /**
   * * Status da sala de bate-papo
   */
  status: ChatStatus;

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
   * * Usuários que estão naquela sala de bate-papo
   */
  users: UserInterfaces;
}
