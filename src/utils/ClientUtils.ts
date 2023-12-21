import IClient from "../client/IClient";
import IBot from "../bot/IBot";

export namespace ClientUtils {
  /** Gera um id único */
  export function generateId(): string {
    return `${process.pid}-${Date.now()}-${Object.keys(ClientUtils.getClients()).length}`;
  }

  /**
   * Retorna a lista de clientes diponíveis.
   * @returns Clientes ordenados pelo ID.
   */
  export function getClients(): Record<string, IClient<IBot>> {
    if (!global.hasOwnProperty("rompot-clients") || typeof global["rompot-clients"] != "object") {
      global["rompot-clients"] = {};
    }

    return global["rompot-clients"];
  }

  /**
   * Define todos os clientes diponíveis.
   * @param clients - Clientes que serão definidios.
   */
  export function saveClients(clients: Record<string, IClient<IBot>>): void {
    global["rompot-clients"] = clients;
  }

  /**
   * Retorna o cliente pelo seu respectivo ID.
   * @param id - ID do cliente.
   * @returns O cliente associado ao ID.
   */
  export function getClient(id: string): IClient<IBot> {
    const clients = ClientUtils.getClients();

    if (clients.hasOwnProperty(id) && typeof clients[id] == "object") {
      return clients[id];
    }

    if (global["default-rompot-worker"] || global["rompot-cluster-save"]?.worker) {
      return ClientUtils.getClient(id);
    }

    throw new Error(`Client "${id}" not exists`);
  }

  /**
   * Define um cliente disponível
   * @param client - Cliente que será definido
   */
  export function saveClient(client: IClient<IBot>): void {
    if (!global.hasOwnProperty("rompot-clients") || typeof global["rompot-clients"] != "object") {
      global["rompot-clients"] = {};
    }

    global["rompot-clients"][client.id] = client;
  }
}
