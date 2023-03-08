import { IUser } from "@interfaces/User";
import User from "@modules/User";
export declare type IUsers = {
    [id: string]: IUser;
};
export declare type Users = {
    [id: string]: User;
};
export declare type UserAction = "add" | "remove" | "promote" | "demote";
