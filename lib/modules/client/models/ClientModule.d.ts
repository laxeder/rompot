import { IClient, IClientModule } from "rompot-base";
export default class ClientModule implements IClientModule {
    #private;
    constructor(client?: IClient | string);
    set client(client: IClient | string);
    get client(): IClient;
    set clientId(clientId: string);
    get clientId(): string;
}
