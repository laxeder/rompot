/// <reference types="node" />
export declare type WAChats = {
    [id: string]: WAChat;
};
import { WAUsers } from "@wa/WAUser";
import Chat from "@modules/Chat";
import { ChatStatus, ChatType } from "../types/Chat";
export default class WAChat extends Chat {
    name: string;
    description: string;
    profile: Buffer;
    users: WAUsers;
    constructor(id: string, type?: ChatType, name?: string, description?: string, profile?: Buffer, users?: WAUsers, status?: ChatStatus);
}
