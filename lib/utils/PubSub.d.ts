export declare class PubSub {
    private ps;
    constructor();
    sub(name: string, callback: (msg: any, data: any) => {}): string;
    unsub(token: string): string | boolean;
    getSub(token: string): any;
    pub(name: string, data?: any): boolean;
}
