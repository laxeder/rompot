export interface StatusOptions {
    recording: string;
    reading: string;
    offline: string;
    typing: string;
    online: string;
}
export declare type StatusTypes = keyof StatusOptions;
