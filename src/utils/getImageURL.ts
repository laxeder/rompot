import { Transform } from "stream";
import https from "https";

export default async (uri: string): Promise<Buffer> => {
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
};
