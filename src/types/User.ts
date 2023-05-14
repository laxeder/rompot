import { IUser } from "@interfaces/IUser";

export type IUsers = { [id: string]: IUser };

export type UserAction = "join" | "leave" | "add" | "remove" | "promote" | "demote";

export type UserEvent = "add" | "remove" | "promote" | "demote";
