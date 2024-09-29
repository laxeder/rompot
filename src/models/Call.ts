import { Chat } from "../modules/chat";
import { User } from "../modules/user";
import { ClientUtils } from "../utils";
import { injectJSON } from "../utils/Generic";

export enum CallStatus {
  Offer = "offer",
  Ringing = "ringing",
  Reject = "reject",
  Accept = "accept",
  Timeout = "timeout",
}

export default class Call {
  /** ID do bot associado */
  public botId: string;
  /** ID do cliente associado */
  public clientId: string;
  /** Chat em que a chamada foi feita */
  public chat: Chat;
  /** Usuário que fez a chamada */
  public user: User;
  /** Identificador da chamada */
  public id: string;
  /** Timestamp da chamada */
  public date: Date;
  /** Status da chamada */
  public status: string;
  /** E uma chamada de video */
  public isVideo: boolean = false;
  /** Foi chamada enquanto estava offline */
  public offline: boolean = false;
  /** Latencia da chamada */
  public latencyMs: number = 0;

  public constructor(
    id: string = "",
    chat: Chat | string = "",
    user: User | string = "",
    status: CallStatus = CallStatus.Ringing,
    options?: Partial<Call>
  ) {
    this.id = id;
    this.status = status;

    this.chat = Chat.apply(chat || "");
    this.user = User.apply(user || "");

    if (options) {
      this.inject(options);
    }
  }

  /**
   * Injeta dados para o objeto atual.
   * @param options - Os dados que serão injetados.
   */
  public inject(data: Partial<Call>) {
    if (data.chat) this.chat = Chat.apply(data.chat);
    if (data.user) this.user = User.apply(data.user);

    if (data.clientId) {
      this.clientId = data.clientId;
      this.chat.clientId = data.clientId;
      this.user.clientId = data.clientId;
    }

    if (data.botId) {
      this.botId = data.botId;
      this.chat.botId = data.botId;
      this.user.botId = data.botId;
    }

    if (data.id) this.id = data.id;
    if (data.date) this.date = data.date;
    if (data.status) this.status = data.status;
    if (data.isVideo) this.isVideo = data.isVideo;
    if (data.offline) this.offline = data.offline;
    if (data.latencyMs) this.latencyMs = data.latencyMs;
  }

  public async reject() {
    if (this.status !== CallStatus.Offer) return;

    ClientUtils.getClient(this.clientId)?.rejectCall(this);
  }

  /**
   * Converte o objeto atual para uma representação em formato JSON.
   * @returns Um objeto JSON que representa o estado atual do objeto.
   */
  public toJSON() {
    const data: Record<string, any> = {};

    for (const key of Object.keys(this)) {
      if (key == "toJSON") continue;

      data[key] = this[key];
    }

    return JSON.parse(JSON.stringify(data));
  }

  /**
   * Cria uma instância de `Call` a partir de uma representação em formato JSON.
   * @param data - Os dados JSON a serem usados para criar a instância.
   * @returns Uma instância de `Call` criada a partir dos dados JSON.
   */
  public static fromJSON(data: any): Call {
    return Call.fix(
      !data || typeof data != "object"
        ? new Call()
        : injectJSON(data, new Call(), false, true)
    );
  }

  /**
   * Corrige o objeto atual para uma representação em formato JSON.
   * @param call - O objeto a ser corrigido.
   * @returns O objeto passado corrigido.
   */
  public static fix<T extends Call>(call: T): T {
    call.chat = Chat.fromJSON(call.chat);
    call.user = User.fromJSON(call.user);

    return call;
  }

  /**
   * Obtém uma instância de `Call` com base em um ID e/ou dados passados.
   * @param call - O ID da mensagem ou uma instância existente de Call.
   * @param data - Dados que serão aplicados na mensagem,.
   * @returns Uma instância de Call com os dados passados.
   */
  public static apply(call: Call | string, data?: Partial<Call>) {
    if (!call || typeof call != "object") {
      call = new Call("", `${call}`);
    }

    call.inject(data || {});

    return call;
  }

  /**
   * Verifica se um objeto é uma instância válida de `Call`.
   * @param call - O objeto a ser verificado.
   * @returns Verdadeiro se o objeto for uma instância válida de `Call`, caso contrário, falso.
   */
  public static isValid(call: any): call is Call {
    return (
      typeof call === "object" &&
      !Object.keys(new Call()).some((key) => !call?.hasOwnProperty(key))
    );
  }
}
