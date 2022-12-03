export interface Button {
    index: number;
    reply?: {
        text: string;
        id: string | number;
    };
    call?: {
        text: string;
        phone: number;
    };
    url?: {
        text: string;
        url: string;
    };
}
