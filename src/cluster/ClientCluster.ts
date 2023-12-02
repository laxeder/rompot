import cluster, { Worker } from "cluster";

import WorkerMessage, { WorkerMessageTag } from "./WorkerMessage";

/** ID dos dados globais do cluster gerenciado pelo Rompot */
export enum GlobalRompotClusterId {
  Clients = "rompot-client-cluster-ids",
  Workes = "rompot-client-cluster-works",
}

export function configCluster(): void {
  if (cluster.isPrimary) {
    global[GlobalRompotClusterId.Clients] = {};
    global[GlobalRompotClusterId.Workes] = {};

    cluster.on("message", (worker, message) => {
      const workerMessage = WorkerMessage.fromJSON(message);

      try {
        if (workerMessage.uid != "rompot") return;

        if (workerMessage.tag == WorkerMessageTag.Patch && workerMessage.isMain) {
          if (workerMessage.id == "save-client") {
            global[GlobalRompotClusterId.Clients][workerMessage.clientId] = `${worker.id}`;

            worker.send(workerMessage.clone({ tag: WorkerMessageTag.Result, data: { result: undefined } }));

            return;
          }
        }

        for (const clientId of Object.keys(global[GlobalRompotClusterId.Clients])) {
          try {
            if (clientId != workerMessage.clientId) continue;

            const workerId = global[GlobalRompotClusterId.Clients][clientId];

            const workerReceive = global[GlobalRompotClusterId.Workes][workerId] as Worker;

            if (!workerReceive) continue;

            workerReceive.send(workerMessage);
          } catch (error) {
            worker.send(workerMessage.clone({ tag: WorkerMessageTag.Error, data: { reason: "Error in send message from worker" } }));
          }
        }
      } catch (error) {
        worker.send(workerMessage.clone({ tag: WorkerMessageTag.Error, data: { reason: "Error in receive message from worker" } }));
      }
    });
  }
}

export function saveWorker(worker: Worker): void {
  global[GlobalRompotClusterId.Workes][`${worker.id}`] = worker;
}
