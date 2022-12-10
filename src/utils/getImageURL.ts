import { Transform } from "stream";
import https from "https";

export default (uri: string) => {
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
      rej(e);
    }
  });
};
