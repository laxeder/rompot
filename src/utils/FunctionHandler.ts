export default class FunctionHandler<D extends any, T extends string> {
  public patterns: Array<() => Promise<void> | void> = [];

  constructor(public data: D, public functions: Record<T, Function[]>) {}

  public async exec<F extends (...args: any[]) => any>(row: T, funcName: keyof D, ...args: Parameters<F>): Promise<Awaited<ReturnType<F>>> {
    return new Promise<Awaited<ReturnType<F>>>(async (resolve) => {
      try {
        await this.await(row);

        if (!this.data || typeof this.data[funcName] != "function") {
          throw new Error(`Invalid execution "${String(funcName)}"`);
        }

        resolve(await (this.data[funcName] as Function)(...args));

        this.functions[row].shift();

        this.resolve(row);
      } catch (err) {
        this.functions[row].shift();

        this.resolve(row);

        throw err;
      }
    });
  }

  public async await(row: T) {
    await new Promise((resolve) => this.add(row, resolve));
  }

  public add(row: T, func: Function) {
    this.functions[row].push(func);

    if (this.functions[row].length == 1) {
      this.resolve(row);
    }
  }

  public async resolve(row: T) {
    await Promise.all(
      this.patterns.map(async (pattern) => {
        try {
          return await pattern();
        } catch (err) {}
      })
    );

    if (this.functions[row].length <= 0) return;

    const func = this.functions[row][0];

    if (func) {
      await func();
    }
  }
}
