import { injectJSON } from "../utils/Generic";
import IClient from "../client/IClient";
import IBot from "./IBot";

export enum BotServerResponseAction {
  Void = "",
  Set = "set",
  Event = "event",
  Result = "result",
}

/** Data da mensagem do worker */
export type WorkerMessageData = { reason: string } | { name: string; arg: any } | { name: keyof IClient<IBot>; args: any[] } | { result: any } | { key: keyof IClient<IBot>; value: any } | {};

/** Mensagem de solicitação do BotServer */
export default class BotServerResponse {
  /** Ação da requisição */
  public action: BotServerResponseAction;
  /** Nome da requisição */
  public name: string;
  /** Dados da requisição */
  public data: any;

  constructor(action: BotServerResponseAction, name: string, data: any) {
    this.action = action;
    this.name = name;
    this.data = data;
  }

  public getData() {
    if (this.name == BotServerResponseAction.Result) {
      if (Array.isArray(this.data)) {
        return [this.data];
      }

      return this.data;
    }

    return this.data;
  }

  public clone(data: Partial<BotServerResponse> = {}): BotServerResponse {
    return BotServerResponse.fromJSON({ ...this.toJSON(), ...data });
  }

  public apply(data: Partial<BotServerResponse>): BotServerResponse {
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

  public static fromJSON(data: any): BotServerResponse {
    return injectJSON(
      JSON.parse(JSON.stringify(data), (_, value) => {
        if (typeof value === "object" && !!value && (value.buffer === true || value.type === "Buffer")) {
          return Buffer.from(value.data || value.value || []);
        }

        return value;
      }),
      new BotServerResponse(BotServerResponseAction.Void, "", "")
    );
  }
}
