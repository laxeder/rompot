import User from "../modules/User";
export declare type Users = {
    [id: string]: User;
};
export declare type UserAction = "join" | "leave" | "add" | "remove" | "promote" | "demote";
export declare type UserEvent = "add" | "remove" | "promote" | "demote";
