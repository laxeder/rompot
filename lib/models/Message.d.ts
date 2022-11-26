import { MessageInterface } from "../types/Message";
import { Chat } from "./Chat";
import { User } from "./User";
export declare class Message implements MessageInterface {
    private _originalMention;
    _originalMessage: any;
    user: User;
    mentions: string[];
    selected?: string;
    mention?: Message;
    fromMe?: boolean;
    isOld?: boolean;
    member?: string;
    text: string;
    id?: string;
    chat: Chat;
    constructor(chat: Chat, text: string, mention?: Message, id?: string);
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
     * * Define se a mensagem é antiga
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
    setfromMe(fromMe: boolean): void;
    /**
     * * Define um membro da mensagem
     * @param member
     */
    setMember(member: string): void;
    /**
     * * Define as menções feitas nas mensagens
     * @param mentions
     */
    setMentions(mentions: string[]): void;
    /**
     * * Adiciona um numero a lista de mencionados
     * @param mentionedId
     */
    addMentioned(mentionedId: string): void;
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
     * * retorna se a mensagem é antiga
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
     * * retorna se
     * @returns
     */
    getFromMe(): boolean;
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
