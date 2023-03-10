import { Transform } from "stream";
import https from "https";

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
