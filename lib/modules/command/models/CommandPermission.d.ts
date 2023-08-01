import { ICommandPermission, IMessage } from "rompot-base";
export default class CommandPermission implements ICommandPermission {
    id: string;
    isPermited?: boolean;
    constructor(id: string, isPermited?: boolean);
    static check(message: IMessage, cmdPerm: ICommandPermission): Promise<boolean>;
}
