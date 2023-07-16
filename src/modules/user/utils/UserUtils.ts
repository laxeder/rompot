import { IUser, IClient } from "rompot-base";

import User from "@modules/user/models/User";

export default class UserUtils {
  /**
   * @param user Usuário que será obtido
   * @returns Retorna o usuário
   */
  public static get<USER extends IUser>(user: USER | string): USER | IUser {
    if (typeof user == "string") {
      return new User(user);
    }

    return user;
  }

  /**
   * @param user Usuário
   * @returns Retorna o ID do usuário
   */
  public static getId(user: IUser | string) {
    if (typeof user == "string") {
      return String(user || "");
    }

    if (typeof user == "object" && !Array.isArray(user) && user?.id) {
      return String(user.id);
    }

    return String(user || "");
  }

  /**
   * * Cria um usuário com cliente instanciado
   * @param client Cliente
   * @param user Usuário
   * @returns
   */
  public static applyClient<USER extends IUser>(client: IClient, user: USER | string): USER | IUser {
    if (typeof user == "string") return this.applyClient(client, new User(user));

    user.client = client;

    return user;
  }
}
