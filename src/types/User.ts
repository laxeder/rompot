import User from "@modules/User";

export type Users = { [id: string]: User };

export type UserAction = "join" | "leave" | "add" | "remove" | "promote" | "demote";

export type UserEvent = "add" | "remove" | "promote" | "demote";
