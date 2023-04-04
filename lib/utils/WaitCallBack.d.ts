export default class WaitCallBack {
    private observers;
    private emitError;
    constructor(emitError: Function);
    /**
     * * Inscreve um onservador
     * @param callback
     * @returns
     */
    sub(callback: (...args: any) => {}): Promise<any>;
    /**
     * * Desinscreve um observador
     * @param index
     */
    unsub(index: number): void;
    /**
     * @param index Posição em que está escrito
     * @returns Retorna um observador
     */
    getSub(index: number): Function;
    /**
     * * Publica aos observadores
     * @param args
     * @returns
     */
    pub(...args: any[]): Promise<any>;
    /**
     * * Aguarda os processos anteriores terminarem para iniciar uma nova
     * @param fn
     * @returns
     */
    waitCall<T extends () => any>(fn: T): Promise<ReturnType<T> | null>;
}
