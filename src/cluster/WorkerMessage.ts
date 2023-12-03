import { injectJSON } from "src/utils";
import { Client } from "src/client";
import { IBot } from "src/bot";

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
  /** É de um cliente principal */
  public isMain: boolean = false;
  /** É uma mensagem para o processo principal */
  public isPrimary: boolean = false;
  /** ID da mensagem */
  public id: string = "";
  /** Tag da mensagem */
  public tag: WorkerMessageTag;
  /** Data da mensagem */
  public data: WorkerMessageData;
  /** Auto cancela a mensagem acaso demore */
  public autoCancel: boolean;

  constructor(tag: WorkerMessageTag = WorkerMessageTag.Void, data: WorkerMessageData = {}, autoCancel: boolean = true) {
    this.tag = tag;
    this.data = data;
    this.autoCancel = autoCancel;
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
    const data: Record<string, any> = {};

    for (const key of Object.keys(this)) {
      if (key == "toJSON") continue;

      data[key] = this[key];
    }

    return JSON.parse(JSON.stringify(data));
  }

  public static fromJSON(data: any): WorkerMessage {
    return injectJSON(
      JSON.parse(JSON.stringify(data), (_, value) => {
        if (typeof value === "object" && !!value && (value.buffer === true || value.type === "Buffer")) {
          return Buffer.from(value.data || value.value || []);
        }

        return value;
      }),
      new WorkerMessage()
    );
  }
}
