import UserInterface from "@interfaces/UserInterface";

export type Users = { [id: string]: UserInterface };

export type UserAction = "add" | "remove" | "promote" | "demote";
