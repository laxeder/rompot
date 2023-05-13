import { IUser } from "@interfaces/IUser";

export type Users = { [id: string]: IUser };

export type UserAction = "join" | "leave" | "add" | "remove" | "promote" | "demote";

export type UserEvent = "add" | "remove" | "promote" | "demote";
