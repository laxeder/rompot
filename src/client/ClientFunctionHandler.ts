import IBot from "../bot/IBot";
import Client from "./Client";

export default class ClientFunctionHandler<B extends IBot, T extends string> {
  /** Todas funções */
  public awaiting: Function[] = [];

  constructor(public client: Client<B>, public functions: Record<T, Function[]>) {}

  public async exec<F extends (...args: any[]) => any>(row: T, func: F, ...args: Parameters<F>): Promise<Awaited<ReturnType<F>>> {
    await this.await(row);

    const getResult = async (count: number = 0, error: unknown = undefined): Promise<[Awaited<ReturnType<F>> | undefined, unknown]> => {
      try {
        if (count >= this.client.config.maxRequests) return [undefined, error];

        await this.client.awaitConnectionOpen();

        return [await func.bind(this.client.bot)(...args), undefined];
      } catch (error) {
        await new Promise((res) => setTimeout(res, this.client.config.requestsDelay));

        return await getResult(count + 1, error);
      }
    };

    const [result, error] = await getResult();

    this.functions[row].shift();

    this.resolve(row);

    if (error) {
      throw error;
    }

    return result;
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
