export declare type Button = {
    /**
     * * Posição o botão
     */
    index: number;
    /**
     * * Tipo do botão
     */
    type: ButtonType;
    /**
     * * Texto do botão
     */
    text: string;
    /**
     * * Conteúdo do botão
     */
    content: string;
};
export declare type ButtonType = "reply" | "call" | "url";
export declare type PollOption = {
    id: string;
    name: string;
};
export declare type PollAction = "create" | "add" | "remove";
export declare type Media = {
    stream: any;
};
