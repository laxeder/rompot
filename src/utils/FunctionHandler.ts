export default class FunctionHandler<T extends string> {
  constructor(public functions: Record<T, Function[]>) {}

  public async exec<F extends (...args: any[]) => any>(row: T, func: F, ...args: Parameters<F>): Promise<Awaited<ReturnType<F>>> {
    try {
      await this.await(row);

      return func(...args);
    } catch (err) {
      throw new Error(err);
    }
  }

  public async await(row: T) {
    try {
      await new Promise((resolve) => this.add(row, resolve));
    } catch (err) {
      throw new Error(err);
    }
  }

  public add(row: T, func: Function) {
    try {
      this.functions[row].push(func);

      if (this.functions[row].length == 1) {
        this.resolve(row);
      }
    } catch (err) {
      throw new Error(err);
    }
  }

  public async resolve(row: T) {
    if (this.functions[row].length <= 0) return;

    const func = this.functions[row][0];

    if (func) {
      try {
        await func();
      } catch (err) {
        throw new Error(err);
      }
    }

    this.functions[row].shift();

    this.resolve(row);
  }
}
