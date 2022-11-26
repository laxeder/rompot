export class User {
  public id: string;
  public name?: string;

  constructor(id: string, name?: string) {
    this.id = id;

    if (name) this.name = name;
  }

  /**
   * * Define o ID do usuário
   * @param id
   */
  public setId(id: string) {
    this.id = id;
  }

  /**
   * * Define o nome do usuário
   * @param name
   */
  public setName(name: string) {
    this.name = name;
  }

  /**
   * * Retorna o ID do usuário
   * @returns
   */
  public getId(): string {
    return this.id;
  }

  /**
   * * Retorna o nome do usuário
   * @returns
   */
  public getName(): string | undefined {
    return this.name;
  }

  /**
   * * verifica se o usuário tem permissão
   * @param userPermissions
   * @param commandPermissions
   * @param ignore
   * @returns
   */
  public checkPermissions(userPermissions: string[], commandPermissions: string[], ignore: string[] = []): boolean {
    if (commandPermissions.length <= 0) return true;

    commandPermissions = commandPermissions.filter((p: string) => {
      if (ignore.includes(p)) return true;
      return userPermissions.indexOf(p) > -1;
    });

    return commandPermissions.length <= 0;
  }
}
