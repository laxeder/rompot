import { IClient, IClientModule } from "rompot-base";

import ClientUtils from "@modules/client/utils/ClientUtils";

export default class ClientModule implements IClientModule {
  #clientId: string = "";

  constructor(client: IClient | string = "") {
    if (typeof client === "string") {
      this.#clientId = client;
    }

    if (typeof client === "object") {
      this.#clientId = client?.id || "";
    }
  }

  set client(client: IClient | string) {
    if (typeof client === "string") {
      this.#clientId = client;
    }

    if (typeof client === "object") {
      this.#clientId = client?.id || "";
    }
  }

  get client(): IClient {
    return ClientUtils.getClient(this.#clientId);
  }

  set clientId(clientId: string) {
    this.clientId = clientId;
  }

  get clientId(): string {
    return this.#clientId;
  }
}
