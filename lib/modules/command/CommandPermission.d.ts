import { ICommandPermission } from "../../interfaces/command";
import { IMessage } from "../../interfaces/IMessage";
export declare class CommandPermission implements ICommandPermission {
    id: string;
    isPermited?: boolean;
    constructor(id: string, isPermited?: boolean);
    static check(message: IMessage, cmdPerm: ICommandPermission): Promise<boolean>;
}
export declare function CMDPerm(id: string, isPermited?: boolean): CommandPermission;
