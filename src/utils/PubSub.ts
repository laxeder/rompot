export class PubSub {
  private ps = require("pubsub-js");

  constructor() {}

  sub(name: string, callback: (msg: any, data: any) => {}): string {
    return this.ps.subscribe(name, callback);
  }

  unsub(token: string): string | boolean {
    return this.ps.unsubscribe(token);
  }

  getSub(token: string) {
    return this.ps.getSubscriptions(token);
  }

  pub(name: string, data: any = {}): boolean {
    return this.ps.publish(name, data);
  }
}
