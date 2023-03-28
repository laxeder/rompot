import User from "@modules/User";

export type Users = { [id: string]: User };

export type UserAction = "add" | "remove" | "promote" | "demote";
