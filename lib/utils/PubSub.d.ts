export declare class PubSub {
    private observers;
    sub(callback: (...args: any) => {}): Promise<any> | undefined;
    unsub(index: number): void;
    getSub(index: number): Function;
    pub(...args: any[]): Promise<any>;
}
