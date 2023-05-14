import { IUser } from "../interfaces/IUser";
export declare type IUsers = {
    [id: string]: IUser;
};
export declare type UserAction = "join" | "leave" | "add" | "remove" | "promote" | "demote";
export declare type UserEvent = "add" | "remove" | "promote" | "demote";
