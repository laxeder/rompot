import cluster from "cluster";
import { cpus } from "os";

import { BotBase, ClientChild, EmptyMessage, Message, WhatsAppBot, configCluster, saveWorker } from "../src/index";

async function start() {
  if (cluster.isPrimary) {
    configCluster();

    for (let i = 0; i < cpus().length; i++) {
      saveWorker(cluster.fork());
    }
  } else {
    const worker = cluster.worker;

    if (!worker) return;

    const clientMain = new ClientChild(
      ClientChild.generateId(),
      worker,
      new WhatsAppBot({ printQRInTerminal: false }),
      {
        disableAutoCommand: false,
        disableAutoTyping: false,
        disableAutoRead: false,
      },
      `./example/auth-${worker.id}`,
      true
    );

    const clientChild = new ClientChild(clientMain.id, worker, new BotBase(), clientMain.config);

    clientChild.on("open", () => {
      console.info("Cliente conectado!");
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

start();
