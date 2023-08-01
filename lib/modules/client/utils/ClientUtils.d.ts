import { IClient } from "rompot-base";
export default class ClientUtils {
    static getClients(): Record<string, IClient>;
    static setClients(clients: Record<string, IClient>): void;
    static getClient(id: string): IClient;
    static setClient(client: IClient): void;
}
