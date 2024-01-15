import { Response } from "express";
import axios from "axios";

import { BotServer, BotServerOptions } from "../bot/BotServer";

export namespace ServerRequest {
  export type Request = Express.Request & { botServer: BotServer };
  export type Body<M extends RequestMethod = any, K extends string = string, A extends any = any> = { method: M; key: K; args: A[] };

  export enum RequestMethod {
    EMIT = "emit",
    SET = "set",
    POST = "post",
  }

  export async function ping(url: string) {
    await axios.get(`${url}/ping`);
  }

  export async function send<T extends any>(url: string, body: Body): Promise<ServerResponse.Body<string, T>> {
    if (body.method == ServerRequest.RequestMethod.EMIT) {
      var { data } = await axios.patch(`${url}/emit`, body);
    } else if (body.method == ServerRequest.RequestMethod.SET) {
      var { data } = await axios.patch(`${url}/set`, body);
    } else if (body.method == ServerRequest.RequestMethod.POST) {
      var { data } = await axios.post(`${url}/post`, body);
    } else {
      throw new Error("Invalid request method");
    }

    return data;
  }

  export function generate<M extends RequestMethod = any, K extends string = string, A extends any = any>(method: M, key: K, ...args: A[]): Body<M, K, A> {
    const response: Body<M, K, A> = {
      method,
      key,
      args,
    };

    return response;
  }
}

export namespace ServerResponse {
  export type Body<M extends string = string, D extends any = any> = { status: number; message: M; data: D };

  export function send(response: Response, body: Body, options: BotServerOptions) {
    try {
      return response.status(body.status).send(body);
    } catch (error) {
      try {
        body = ServerResponse.generateError(error);

        return response.status(body.status).send(body);
      } catch (error) {
        options.logger.error(JSON.stringify(ServerResponse.generateError(error), undefined, 2));
      }
    }
  }

  export function generate<M extends string, D extends any>(status: string | number, message: M, data: D): Body<M, D> {
    const response: Body<M, D> = {
      status: Number(status) || 500,
      message,
      data,
    };

    return response;
  }

  export function generateError(err: any, status: number | string = 500, message: string = "Internal error") {
    const error = JSON.stringify(err?.message, undefined, 2);
    const stack = JSON.stringify(err?.stack || "", undefined, 2);

    return generate(status, message, { error, stack });
  }
}
