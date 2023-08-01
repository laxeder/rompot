import { readdirSync, statSync } from "fs";
import { parse, resolve } from "path";
import { Transform } from "stream";
import https from "https";

import { ROMPOT_VERSION } from "@config/Defaults";

/**
 * * Aguarda um determinado tempo
 * @param timeout
 * @returns
 */
export async function sleep(timeout: number = 1000): Promise<void> {
  const result = timeout - 2147483647;

  if (result > 0) {
    await new Promise((res) => setTimeout(res, 2147483647));

    await sleep(result);
  } else {
    await new Promise((res) => setTimeout(res, timeout));
  }
}

/**
 * * Obtem a imagem de uma url
 * @param uri URL
 * @returns
 */
export async function getImageURL(uri: string): Promise<Buffer> {
  if (!!!uri) return Buffer.from("");

  return new Promise((res, rej) => {
    try {
      https
        .request(uri, (response) => {
          var data = new Transform();

          response.on("data", (chunk) => data.push(chunk));
          response.on("end", () => res(data.read()));
        })
        .end();
    } catch (e) {
      res(Buffer.from(""));
    }
  });
}

/**
 * @param err Erro
 * @returns Retorna um erro
 */
export function getError(err: any): any {
  if (!(err instanceof Error)) {
    err = new Error(`${err}`);
  }

  return err;
}

/**
 * * Remove a Tag do texto
 * @param tag Tag do comando
 * @param text Texto do comando
 * @returns Texto sem a tag
 */
export function replaceCommandTag(tag: string, text: string) {
  const indexOfTag = text.toLowerCase().indexOf(tag.toLowerCase());

  if (indexOfTag == -1) return text;

  return String(`${text}`)
    .slice(indexOfTag + tag.length)
    .trim();
}

export declare type ObjectJSON = { [key: string]: any | ObjectJSON };

/**
 * * Injeta valores de um objeto em outro
 * @param object Objeto com novos valores
 * @param injectableObject Objeto que receberá os novos valores
 * @returns Retorna o objeto com os novos valores
 */
export function injectJSON<T extends ObjectJSON>(objectIn: ObjectJSON, objectOut: T): T {
  Object.keys(objectIn).forEach((keyIn) => {
    const keyOut: keyof T = keyIn;

    if (!objectOut.hasOwnProperty(keyOut)) return;

    if (typeof objectOut[keyOut] == "undefined") {
      objectOut[keyOut] = objectIn[keyIn];
    }

    if (typeof objectOut[keyOut] == typeof objectIn[keyIn]) {
      objectOut[keyOut] = objectIn[keyIn];
    }

    if (typeof objectOut[keyOut] == "string" && typeof objectIn[keyIn] == "number") {
      objectIn[keyIn] = String(objectIn[keyIn]);
    }

    if (typeof objectOut[keyOut] == "number" && typeof objectIn[keyIn] == "string") {
      objectIn[keyIn] = Number(objectIn[keyIn]);
    }
  });

  return objectOut;
}

/** Retorna a versão do Rompot */
export function getRompotVersion(): string {
  return ROMPOT_VERSION;
}

/** Lê um diretório recursivamente */
export async function readRecursiveDir<Callback extends (fileptah: string, filename: string, ext: string) => any>(dir: string, callback: Callback): Promise<ReturnType<Awaited<Callback>>[]> {
  const files: any[] = [];
  const rtn: ReturnType<Awaited<Callback>>[] = [];

  try {
    await Promise.all(
      readdirSync(dir).map(async (filename) => {
        const filepath = resolve(dir, filename);
        const stat = statSync(filepath);
        const isFile = stat.isFile();

        if (!isFile) {
          files.push(...(await readRecursiveDir(filepath, callback)));

          return;
        }

        rtn.push(await callback(filepath, filename, parse(filename).ext));
      })
    );
  } catch (err) {}

  return rtn;
}
