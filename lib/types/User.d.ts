import IUser from "@interfaces/IUser";
export declare type Users = {
    [id: string]: IUser;
};
export declare type UserAction = "add" | "remove" | "promote" | "demote";
