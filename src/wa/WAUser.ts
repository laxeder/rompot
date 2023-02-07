import User from "@modules/User";

export type WAUsers = { [id: string]: WAUser };

export default class WAUser extends User {
  /** * Nome do usuário */
  public name: string = "";

  /** * Descrição do usuário */
  public description: string = "";

  /** * É admin da sala de bate-papo*/
  public isAdmin: boolean = false;

  /** * É líder da sala de bate-papo */
  public isLeader: boolean = false;

  constructor(id: string, name?: string, description?: string) {
    super(id);

    this.name = name || "";
    this.description = description || "";
  }
}
