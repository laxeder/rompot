"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Message = void 0;
const User_1 = require("./User");
class Message {
    constructor(chat, text, mention, id) {
        this.user = new User_1.User("");
        this.mentions = [];
        this.text = text;
        this.chat = chat;
        if (mention)
            this.mention = mention;
        if (id)
            this.id = id;
    }
    /**
     * * Define a sala de bate-papo
     * @param chat
     */
    setChat(chat) {
        this.chat = chat;
    }
    /**
     * * Define o texto da mensagem
     * @param text
     * @returns
     */
    setText(text) {
        this.text = text;
    }
    /**
     * * Menciona uma mensagem
     * @param mention
     * @returns
     */
    setMention(mention) {
        this.mention = mention;
    }
    /**
     * * Define se a mensagem é antiga
     * @param isOld
     */
    setIsOld(isOld) {
        this.isOld = isOld;
    }
    /**
     * * Define o ID da mensagem
     * @param id
     */
    setId(id) {
        this.id = id;
    }
    /**
     * * Define o usuário
     * @param user
     */
    setUser(user) {
        this.user = user;
    }
    /**
     * * Define se a mensagem foi enviada pelo bot
     * @param fromMe
     */
    setfromMe(fromMe) {
        this.fromMe = fromMe;
    }
    /**
     * * Define um membro da mensagem
     * @param member
     */
    setMember(member) {
        this.member = member;
    }
    /**
     * * Define as menções feitas nas mensagens
     * @param mentions
     */
    setMentions(mentions) {
        this.mentions = mentions;
    }
    /**
     * * Adiciona um numero a lista de mencionados
     * @param mentionedId
     */
    addMentioned(mentionedId) {
        this.mentions.push(mentionedId);
    }
    /**
     * * Obter a sala de bate-papo da mensagem
     * @returns
     */
    getChat() {
        return this.chat;
    }
    /**
     * * Obter o texto da mensagem
     * @returns
     */
    getText() {
        return this.text;
    }
    /**
     * * Obter a menção da mensagem
     * @returns
     */
    getMention() {
        return this.mention;
    }
    /**
     * * retorna se a mensagem é antiga
     * @returns
     */
    getIsOld() {
        return this.isOld;
    }
    /**
     * * Retorna o ID da mensagem
     * @returns
     */
    getId() {
        return this.id;
    }
    /**
     * * Retorna o usuário
     * @returns
     */
    getUser() {
        return this.user;
    }
    /**
     * * retorna se
     * @returns
     */
    getFromMe() {
        return this.fromMe || false;
    }
    //? O Baileys (WhatsApp) precisa da menção original para mencionar uma mensagem
    /**
     * * Define uma menção não refactorada
     * @param originalMention
     */
    setOriginalMention(originalMention) {
        this._originalMention = originalMention;
    }
    /**
     * * Retorna a menção não refatorada
     * @returns
     */
    getOriginalMention() {
        return this._originalMention;
    }
}
exports.Message = Message;
//# sourceMappingURL=Message.js.map