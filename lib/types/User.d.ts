import User from "../modules/User";
export declare type Users = {
    [id: string]: User;
};
export declare type UserAction = "add" | "remove" | "promote" | "demote";
