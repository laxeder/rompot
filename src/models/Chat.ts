export class Chat {
  public id: string;
  public name?: string;
  public isOld?: boolean;

  constructor(id: string, name?: string, isOld?: boolean) {
    this.id = id;

    if (name) this.name = name;
    if (isOld) this.isOld = isOld;
  }

  /**
   * * Define o ID da sala de bate-papo
   * @param id
   */
  public setId(id: string) {
    this.id = id;
  }

  /**
   * * Define o nome da sala de bate-papo
   * @param name
   */
  public setName(name: string) {
    this.name = name;
  }

  /**
   * * Define se é uma nova sala de bate-papo
   * @param isOld
   */
  public setIsOld(isOld: boolean) {
    this.isOld = isOld;
  }

  /**
   * * Retorna o ID da sala de bate-papo
   * @returns
   */
  public getId(): string {
    return this.id;
  }

  /**
   * * Retorna o nome da sala de bate-papo
   * @returns
   */
  public getName(): string | undefined {
    return this.name;
  }

  /**
   * * Retorna se é uma nova sala de bate-papo
   * @returns
   */
  public getIsOld(): boolean {
    return this.isOld || false;
  }
}
