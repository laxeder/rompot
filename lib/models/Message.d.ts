import { MessageInterface } from "../types/Message";
import { Chat } from "./Chat";
import { User } from "./User";
import { Bot } from "../controllers/Bot";
export declare class Message implements MessageInterface {
    private _originalMention;
    private _originalMessage;
    private bot?;
    user: User;
    mentions: string[];
    chat: Chat;
    selected?: string;
    mention?: Message;
    fromMe?: boolean;
    isOld?: boolean;
    text: string;
    id?: string;
    constructor(chat: Chat, text: string, mention?: Message, id?: string);
    /**
     * * Define o bot que executa essa mensagem
     * @param bot
     */
    setBot(bot: Bot): void;
    /**
     * * Retorna o bot que executa essa mensagem
     * @returns
     */
    getBot(): Bot | undefined;
    /**
     * * Responde uma mensagem
     * @param message
     * @param mention
     */
    reply(message: Message | string, mention?: boolean): void;
    /**
     * * Marca como visualizada a mensagem
     * @returns
     */
    read(): Promise<any> | undefined;
    /**
     * * Define a sala de bate-papo
     * @param chat
     */
    setChat(chat: Chat): void;
    /**
     * * Define o texto da mensagem
     * @param text
     * @returns
     */
    setText(text: string): void;
    /**
     * * Menciona uma mensagem
     * @param mention
     * @returns
     */
    setMention(mention: any): void;
    /**
     * * Define se a mensagem é nova
     * @param isOld
     */
    setIsOld(isOld: boolean): void;
    /**
     * * Define o ID da mensagem
     * @param id
     */
    setId(id: string): void;
    /**
     * * Define o usuário
     * @param user
     */
    setUser(user: User): void;
    /**
     * * Define se a mensagem foi enviada pelo bot
     * @param fromMe
     */
    setFromMe(fromMe: boolean): void;
    /**
     * * Define as menções feitas nas mensagens
     * @param mentions
     */
    setMentions(mentions: string[]): void;
    /**
     * * Adiciona um numero a lista de mencionados
     * @param id
     */
    addMentions(id: string[] | string): void;
    /**
     * * Obter a sala de bate-papo da mensagem
     * @returns
     */
    getChat(): Chat;
    /**
     * * Obter o texto da mensagem
     * @returns
     */
    getText(): string;
    /**
     * * Obter a menção da mensagem
     * @returns
     */
    getMention(): Message | undefined;
    /**
     * * Retorna se a mensagem é nova
     * @returns
     */
    getIsOld(): boolean | undefined;
    /**
     * * Retorna o ID da mensagem
     * @returns
     */
    getId(): string | undefined;
    /**
     * * Retorna o usuário
     * @returns
     */
    getUser(): User;
    /**
     * * retorna se foi enviada pelo próprioI bot
     * @returns
     */
    getFromMe(): boolean;
    /**
     * * Define uma mensagem não refactorada
     * @param originalMessage
     */
    setOriginalMessage(originalMessage: any): void;
    /**
     * * Retorna a mensagem não refatorada
     * @returns
     */
    getOriginalMessage(): any;
    /**
     * * Define uma menção não refactorada
     * @param originalMention
     */
    setOriginalMention(originalMention: any): void;
    /**
     * * Retorna a menção não refatorada
     * @returns
     */
    getOriginalMention(): any;
}
