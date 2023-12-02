import { IBot } from "src/bot";
import { Client } from "src/client";
import { injectJSON } from "src/utils";

/** Tag da mensagem do worker */
export enum WorkerMessageTag {
  Void = "",
  Error = "error",
  Func = "func",
  Result = "result",
  Event = "event",
  Patch = "patch",
}

/** Data da mensagem do worker */
export type WorkerMessageData = { reason: string } | { name: string; arg: any } | { name: keyof Client<IBot>; args: any[] } | { result: any } | { key: keyof Client<IBot>; value: any } | {};

/** Mensagem do worker */
export default class WorkerMessage {
  /** Identificador único da mensagem */
  public uid: string = "";
  /** ID do cliente da mensagem */
  public clientId: string = "";
  /** ID da mensagem */
  public id: string = "";
  /** Tag da mensagem */
  public tag: WorkerMessageTag;
  /** Data da mensagem */
  public data: WorkerMessageData;

  constructor(tag: WorkerMessageTag = WorkerMessageTag.Patch, data: WorkerMessageData = {}) {
    this.tag = tag;
    this.data = data;
  }

  public getData() {
    const data: any = this.data || {};

    if (this.tag == WorkerMessageTag.Error) {
      return { reason: data.reason || "" };
    }

    if (this.tag == WorkerMessageTag.Result) {
      return { result: data.result };
    }

    if (this.tag == WorkerMessageTag.Event) {
      return { name: data.name || "", arg: data.arg };
    }

    if (this.tag == WorkerMessageTag.Func) {
      return { name: data.name || "", args: data.args || [] };
    }

    if (this.tag == WorkerMessageTag.Patch) {
      return { key: data.key || "", value: data.value };
    }

    return {};
  }

  public clone(data: Partial<WorkerMessage> = {}): WorkerMessage {
    return WorkerMessage.fromJSON({ ...this.toJSON(), ...data });
  }

  public apply(data: Partial<WorkerMessage>): WorkerMessage {
    if (typeof data != "object") return;

    for (const key of Object.keys(data)) {
      this[key] = data[key];
    }

    return this;
  }

  public toJSON() {
    return JSON.parse(JSON.stringify(this));
  }

  public static fromJSON(data: any): WorkerMessage {
    return injectJSON(data, new WorkerMessage());
  }
}
