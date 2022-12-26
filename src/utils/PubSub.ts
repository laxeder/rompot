export class PubSub {
  private observers: Function[] = [];

  public sub(callback: (...args: any) => {}) {
    this.observers.push(callback);

    if (this.observers.length > 1) return;

    return this.pub();
  }

  public unsub(index: number) {
    this.observers.splice(index, 1);

    if (this.observers.length > 0) this.pub(index + 1);
  }

  public getSub(index: number) {
    return this.observers[index];
  }

  public async pub(...args: any[]) {
    if (this.observers.length <= 0) return;

    const result = await this.observers[0](...args);

    this.unsub(0);

    return result;
  }
}
