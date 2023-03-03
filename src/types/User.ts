import IUser from "@interfaces/IUser";

export type Users = { [id: string]: IUser };

export type UserAction = "add" | "remove" | "promote" | "demote";
