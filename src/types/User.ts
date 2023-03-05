import { IUser } from "@interfaces/User";

import { UserModule } from "@modules/User";

export type IUsers = { [id: string]: IUser };

export type Users = { [id: string]: UserModule };

export type UserAction = "add" | "remove" | "promote" | "demote";
