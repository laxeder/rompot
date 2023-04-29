export default class WaitCallBack {
  private observers: Function[] = [];
  private emitError: Function;

  constructor(emitError: Function) {
    this.emitError = emitError;
  }

  /**
   * * Inscreve um onservador
   * @param callback
   * @returns
   */
  public sub(callback: (...args: any) => {}) {
    this.observers.push(callback);

    if (this.observers.length > 1) return;

    return this.pub();
  }

  /**
   * * Desinscreve um observador
   * @param index
   */
  public unsub(index: number) {
    this.observers.splice(index, 1);

    if (this.observers.length > 0) this.pub(index + 1);
  }

  /**
   * @param index Posição em que está escrito
   * @returns Retorna um observador
   */
  public getSub(index: number) {
    return this.observers[index];
  }

  /**
   * * Publica aos observadores
   * @param args
   * @returns
   */
  public async pub(...args: any[]) {
    if (this.observers.length <= 0) return;

    const result = await this.observers[0](...args);

    this.unsub(0);

    return result;
  }

  /**
   * * Aguarda os processos anteriores terminarem para iniciar uma nova
   * @param fn
   * @returns
   */
  public waitCall<T extends () => any>(fn: T): Promise<Awaited<ReturnType<T>> | null> {
    return new Promise<Awaited<ReturnType<T>> | null>((resolve, reject) => {
      this.sub(async () => {
        try {
          const result = await fn();

          resolve(result || null);
        } catch (err) {
          resolve(null);

          this.emitError(err);
        }
      });
    });
  }
}
