import cluster from "cluster";
import { cpus } from "os";

/** Opções para o cluster do cliente */
export type ClientClusterOptions = {
  /** Número de CPU a ser usado */
  cpus: number;
};

export default function ClientCluster(options: Partial<ClientClusterOptions> = {}) {
  if (cluster.isPrimary) {
    return ClientMain(options);
  } else {
    return ClientChild();
  }
}

export function ClientMain(options: Partial<ClientClusterOptions> = {}) {
  if (!cluster.isPrimary) {
    return ClientChild();
  }

  if (global["rompót-cluster-main"]) {
    return global["rompót-cluster-main"];
  }

  const opts: ClientClusterOptions = {
    cpus: options.cpus || cpus().length,
  };

  const infos: Record<string | number, Array<string>> = {};

  for (let i = 0; i < opts.cpus; i++) {
    infos[i] = [`ID:${i}:N-1`, `ID:${i}:N-2`, `ID:${i}:N-3`];

    let worker = cluster.fork();

    worker.on("exit", () => {
      const oldId = worker.id;

      worker = cluster.fork();

      infos[worker.id] = infos[oldId];

      delete infos[oldId];
    });
  }

  cluster.on("message", (worker, message) => {
    if (!message || typeof message != "object") return;
    if (!message.id || !message.tag || !message.data || !message.uid || message.uid != "rompot") return;

    if (message.tag == "get") {
      if (message.data.value == "info") {
        worker.send!({ uid: "rompot", id: message.id, tag: message.tag, workerId: worker.id, data: infos[worker.id] });
      } else {
        worker.send!({ uid: "rompot", id: message.id, tag: "error", data: { message: "Invalid get value" } });
      }
    } else if (message.tag == "res") {
      worker.send!({ uid: "rompot", id: message.id, tag: message.tag, data: message.data });
    } else {
      worker.send!({ uid: "rompot", id: message.id, tag: "error", data: { message: "Invalid tag" } });
    }
  });
}

export function ClientChild() {
  if (cluster.isPrimary) {
    return ClientMain();
  }

  const worker = cluster.worker;

  if (!worker) {
    throw new Error("Worker not found");
  }

  try {
    const awaiting: Record<string, (data: Record<any, any>) => any> = {};

    const send = (tag: string, data: Record<any, any>, callback: (data: Record<any, any>) => any) => {
      const id = `${tag}-${Date.now()}${worker.process.pid}${worker.id}${Object.keys(awaiting).length}`;

      awaiting[id] = (message: Record<any, any>) => {
        if (!message || typeof message != "object") return;
        if (!message.id || !message.tag || !message.data || !message.uid || message.uid != "rompot") return;

        delete awaiting[id];

        if (message.tag == "error") {
          throw new Error(message.data.message);
        }

        callback(message);
      };

      process.send!({ uid: "rompot", id, tag, data: { ...(data || {}) } });

      setTimeout(() => {
        if (awaiting.hasOwnProperty(id)) {
          awaiting[id]({ uid: "rompot", id, tag: "error", data: { message: "Timeout" } });
        }
      }, 5000);
    };

    worker.on("message", (message) => {
      if (!message || typeof message != "object") return;
      if (!message.id || !message.uid || message.uid != "rompot") return;

      if (!awaiting.hasOwnProperty(message.id)) return;

      awaiting[message.id](message);
    });

    send("get", { value: "info" }, (res) => {
      console.log("INFO:", res);
    });

    if (worker.id == 3) {
      send("error", { chat: 12345, name: "Hello" }, (res) => {
        console.log("M-M:", res);
      });
    }

    setTimeout(() => {
      send("res", { chat: 12345, name: "Hello" }, (res) => {
        console.log("M-M:", res);
      });
    }, 5000);
  } catch (err) {
    console.error(err);

    worker.destroy();
  }
}
