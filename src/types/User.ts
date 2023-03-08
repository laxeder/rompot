import { IUser } from "@interfaces/User";

import User from "@modules/User";

export type IUsers = { [id: string]: IUser };

export type Users = { [id: string]: User };

export type UserAction = "add" | "remove" | "promote" | "demote";
