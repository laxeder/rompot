import UserInterface from "../interfaces/UserInterface";
export declare type Users = {
    [id: string]: UserInterface;
};
export declare type UserAction = "add" | "remove" | "promote" | "demote";
