export default class FunctionHandler<T extends string> {
  constructor(public functions: Record<T, Function[]>) {}

  public async exec<F extends (...args: any[]) => any>(row: T, func: F, ...args: Parameters<F>): Promise<Awaited<ReturnType<F>>> {
    await this.await(row);

    return func(...args);
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
    if (this.functions[row].length <= 0) return;

    const func = this.functions[row][0];

    if (func) {
      await func();
    }

    this.functions[row].shift();

    this.resolve(row);
  }
}
