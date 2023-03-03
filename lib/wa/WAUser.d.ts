/// <reference types="node" />
import User from "@modules/User";
export declare type WAUsers = {
    [id: string]: WAUser;
};
export default class WAUser extends User {
    /** * Nome do usuário */
    name: string;
    /** * Descrição do usuário */
    description: string;
    /** * É admin da sala de bate-papo*/
    isAdmin: boolean;
    /** * É líder da sala de bate-papo */
    isLeader: boolean;
    constructor(id: string, name?: string, description?: string, profile?: Buffer);
}
