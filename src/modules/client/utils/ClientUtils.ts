import { IClient } from "rompot-base";

import ClientBase from "@modules/client/models/ClientBase";

export default class ClientUtils {
  public static getClients(): Record<string, IClient> {
    if (!global.hasOwnProperty("rompot-clients") || typeof global["rompot-clients"] != "object") {
      global["rompot-clients"] = {};
    }

    return global["rompot-clients"];
  }

  public static setClients(clients: Record<string, IClient>): void {
    global["rompot-clients"] = clients;
  }

  public static getClient(id: string): IClient {
    const clients = ClientUtils.getClients();

    if (clients.hasOwnProperty(id) && typeof clients[id] == "object") {
      return clients[id];
    }

    return new ClientBase();
  }

  public static setClient(client: IClient): void {
    const clients = ClientUtils.getClients();

    clients[client.id] = client;

    ClientUtils.setClients(clients);
  }
}
