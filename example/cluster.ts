import cluster from "cluster";
import { cpus } from "os";

import { ClientCluster, EmptyMessage, Message, WhatsAppBot } from "../src/index";

async function start() {
  if (cluster.isPrimary) {
    ClientCluster.configCluster(cluster);

    for (let i = 0; i < cpus().length; i++) {
      cluster.fork();
    }
  } else {
    const worker = cluster.worker;

    if (!worker) return;

    const id = `${worker.id > 2 ? worker.id - 2 : worker.id}`;

    const config = {
      disableAutoCommand: false,
      disableAutoTyping: false,
      disableAutoRead: false,
    };

    if (worker.id < 3) {
      ClientCluster.createMain(id, worker, new WhatsAppBot({ printQRInTerminal: false }), `./example/auth-${id}`, config);
    } else {
      const clientChild = new ClientCluster(id, worker, config);

      clientChild.on("conn", (update) => {
        console.info("Connection update:", update);
      });

      clientChild.on("message", async (message: Message) => {
        if (EmptyMessage.isValid(message)) return;
        if (message.isOld) return;

        console.info(`RECEIVE MESSAGE [${message.chat.id}]`, message.id);
      });

      clientChild.on("error", (err: any) => {
        console.info("Um erro ocorreu:", err);
      });

      await clientChild.connect();
    }
  }
}

start();
