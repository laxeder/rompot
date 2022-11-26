export class Chat {
  public id: string;
  public name?: string;
  public isNew?: boolean;

  constructor(id: string, name?: string, isNew?: boolean) {
    this.id = id;

    if (name) this.name = name;
    if (isNew) this.isNew = isNew;
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
   * @param isNew
   */
  public setIsNew(isNew: boolean) {
    this.isNew = isNew;
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
  public getIsNew(): boolean {
    return this.isNew || false;
  }
}
