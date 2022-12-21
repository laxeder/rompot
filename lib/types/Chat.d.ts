interface Chats {
    community: string;
    chanel: string;
    group: string;
    chat: string;
    pv: string;
}
export declare type ChatTypes = keyof Chats;
declare var Action: "add" | "remove";
export declare type ChatAction = typeof Action;
export {};
