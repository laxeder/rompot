"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PubSub = void 0;
class PubSub {
    constructor() {
        this.ps = require("pubsub-js");
    }
    sub(name, callback) {
        return this.ps.subscribe(name, callback);
    }
    unsub(token) {
        return this.ps.unsubscribe(token);
    }
    getSub(token) {
        return this.ps.getSubscriptions(token);
    }
    pub(name, data = {}) {
        return this.ps.publish(name, data);
    }
}
exports.PubSub = PubSub;
//# sourceMappingURL=PubSub.js.map