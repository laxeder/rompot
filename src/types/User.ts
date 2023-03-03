import IUser from "@interfaces/User";

export type Users = { [id: string]: IUser };

export type UserAction = "add" | "remove" | "promote" | "demote";
