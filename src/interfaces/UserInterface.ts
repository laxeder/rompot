export default interface UserInterface {
  /**
   * * ID do usuário
   */
  id: string;

  /**
   * * Nome do usuário
   */
  name: string;

  /**
   * * Descrição do usuário
   */
  description: string;

  /**
   * * Foto de perfil do usuário
   */
  profile: Buffer;
}
