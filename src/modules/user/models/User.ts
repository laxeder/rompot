import { IUser } from "rompot-base";

import UserController from "@modules/user/controllers/UserController";

export default class User extends UserController implements IUser {
  public name: string = "";
  public id: string = "";

  constructor(id: string, name?: string) {
    super();

    this.id = id || "";
    this.name = name || "";

    this.user = this;
  }
}
