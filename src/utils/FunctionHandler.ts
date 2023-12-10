import { isPromise } from "util/types";

export default class FunctionHandler<D extends any, T extends string> {
  /** Patterns */
  public patterns: Array<() => Promise<void> | void> = [];
  /** Todas funções */
  public awaiting: Function[] = [];

  constructor(public data: D, public functions: Record<T, Function[]>) {}

  public async exec<F extends (...args: any[]) => any>(row: T, funcName: keyof D, ...args: Parameters<F>): Promise<Awaited<ReturnType<F>>> {
    try {
      return await new Promise<Awaited<ReturnType<F>>>(async (resolve, reject) => {
        try {
          await this.await(row);

          if (!this.data || typeof this.data[funcName] != "function") {
            throw new Error(`Invalid execution "${String(funcName)}"`);
          }

          const res = (this.data[funcName] as Function)(...args);

          if (isPromise(res)) {
            res
              .then((value: any) => {
                resolve(value);

                this.functions[row].shift();

                this.resolve(row);
              })
              .catch((error) => {
                this.functions[row].shift();

                this.resolve(row);

                reject(error);
              });
          } else {
            resolve(res);

            this.functions[row].shift();

            this.resolve(row);
          }
        } catch (err) {
          this.functions[row].shift();

          this.resolve(row);

          reject(err);
        }
      });
    } catch (err) {
      throw err;
    }
  }

  public async await(row: T) {
    await new Promise((resolve) => this.addAwaiting(resolve));
    await new Promise((resolve) => this.add(row, resolve));
  }

  public add(row: T, func: Function) {
    this.functions[row].push(func);

    if (this.functions[row].length == 1) {
      this.resolve(row);
    }
  }

  public addAwaiting(func: Function) {
    this.awaiting.push(func);

    if (this.awaiting.length == 1) {
      this.resolveAwaiting();
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

  public async resolveAwaiting() {
    if (this.awaiting.length <= 0) return;

    const func = this.awaiting[0];

    if (func) {
      await func();
    }

    this.awaiting.shift();

    if (this.awaiting.length > 0) {
      this.resolveAwaiting();
    }
  }
}
