import { injectJSON } from "../utils/Generic";
import IClient from "../client/IClient";
import IBot from "../bot/IBot";

export enum BotServerRequestAction {
  Void = "",
  Event = "event",
  Function = "function",
  Variable = "variable",
}

/** Data da mensagem do worker */
export type WorkerMessageData = { reason: string } | { name: string; arg: any } | { name: keyof IClient<IBot>; args: any[] } | { result: any } | { key: keyof IClient<IBot>; value: any } | {};

/** Mensagem de solicitação do BotServer */
export default class BotServerRequest {
  /** Ação da requisição */
  public action: BotServerRequestAction;
  /** Nome da requisição */
  public name: string;
  /** Dados da requisição */
  public data: any;

  constructor(action: BotServerRequestAction, name: string, data: any) {
    this.action = action;
    this.name = name;
    this.data = data;
  }

  public getData() {
    if (this.name == BotServerRequestAction.Function) {
      if (Array.isArray(this.data)) {
        throw new Error("Args of function undefined");
      }

      return this.data;
    }

    if (this.name == BotServerRequestAction.Event) {
      return this.data;
    }

    if (this.name == BotServerRequestAction.Variable) {
      return this.data;
    }

    throw new Error("Name not found");
  }

  public clone(data: Partial<BotServerRequest> = {}): BotServerRequest {
    return BotServerRequest.fromJSON({ ...this.toJSON(), ...data });
  }

  public apply(data: Partial<BotServerRequest>): BotServerRequest {
    if (typeof data != "object") return;

    for (const key of Object.keys(data)) {
      this[key] = data[key];
    }

    return this;
  }

  public toJSON() {
    const data: Record<string, any> = {};

    for (const key of Object.keys(this)) {
      if (key == "toJSON") continue;

      data[key] = this[key];
    }

    return JSON.parse(JSON.stringify(data));
  }

  public static fromJSON(data: any): BotServerRequest {
    return injectJSON(
      JSON.parse(JSON.stringify(data), (_, value) => {
        if (typeof value === "object" && !!value && (value.buffer === true || value.type === "Buffer")) {
          return Buffer.from(value.data || value.value || []);
        }

        return value;
      }),
      new BotServerRequest(BotServerRequestAction.Void, "", "")
    );
  }
}
