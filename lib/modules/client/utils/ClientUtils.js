"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ClientBase_1 = __importDefault(require("../../client/models/ClientBase"));
class ClientUtils {
    static getClients() {
        if (!global.hasOwnProperty("rompot-clients") || typeof global["rompot-clients"] != "object") {
            global["rompot-clients"] = {};
        }
        return global["rompot-clients"];
    }
    static setClients(clients) {
        global["rompot-clients"] = clients;
    }
    static getClient(id) {
        const clients = ClientUtils.getClients();
        if (clients.hasOwnProperty(id) && typeof clients[id] == "object") {
            return clients[id];
        }
        return (0, ClientBase_1.default)();
    }
    static setClient(client) {
        const clients = ClientUtils.getClients();
        clients[client.id] = client;
        ClientUtils.setClients(clients);
    }
}
exports.default = ClientUtils;
//# sourceMappingURL=ClientUtils.js.map