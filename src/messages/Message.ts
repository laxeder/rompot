import { BotModule } from "../types/BotModule";
import { Status } from "@modules/Status";
import BotBase from "@modules/BotBase";
import { Chat } from "@modules/Chat";
import { User } from "@modules/User";

interface MessageInterface {
  chatId: Chat;
  text: string;
}

export class Message {
  private _bot: BotModule = new BotBase();

  public timestamp: number | Long = Date.now();
  public user: User = { id: "" };
  public mentions: string[] = [];
  public chat: Chat;

  public selected?: string;
  public mention?: Message;
  public fromMe?: boolean;
  public isOld?: boolean;
  public text: string;
  public id?: string;

  constructor(chat: Chat, text: string, mention?: Message, id?: string) {
    this.text = text;
    this.chat = chat;

    if (mention) this.mention = mention;
    if (id) this.id = id;
  }

  //! ***** Bot Functions *****

  /**
   * * Define o bot que executa essa mensagem
   * @param bot
   */
  public setBot(bot: Bot) {
    this._bot = bot;
    this.chat?.setBot(this._bot);
    this.user?.setBot(this._bot);
  }

  /**
   * * Retorna o bot que executa essa mensagem
   * @returns
   */
  public getBot(): Bot {
    return this._bot;
  }

  /**
   * * Responde uma mensagem
   * @param message
   * @param mention
   */
  public async reply(message: Message | string, mention: boolean = true) {
    if (!(message instanceof Message)) message = new Message(this.chat, `${message}`);
    if (mention) message.setMention(this);

    message.setChat(this.chat);

    return this._bot.send(message);
  }

  /**
   * * Marca como visualizada a mensagem
   * @returns
   */
  public async read() {
    return this._bot.send(new Status("reading", this.chat, this));
  }

  //! ***************************

  /**
   * * Define a sala de bate-papo
   * @param chat
   */
  public setChat(chat: Chat) {
    this.chat = chat;
  }

  /**
   * * Define o texto da mensagem
   * @param text
   * @returns
   */
  public setText(text: string) {
    this.text = text;
  }

  /**
   * * Menciona uma mensagem
   * @param mention
   * @returns
   */
  public setMention(mention: any) {
    this.mention = mention;
  }

  /**
   * * Define se a mensagem é nova
   * @param isOld
   */
  public setIsOld(isOld: boolean) {
    this.isOld = isOld;
  }

  /**
   * * Define o ID da mensagem
   * @param id
   */
  public setId(id: string) {
    this.id = id;
  }

  /**
   * * Define o usuário
   * @param user
   */
  public setUser(user: User) {
    this.user = user;
  }

  /**
   * * Define se a mensagem foi enviada pelo bot
   * @param fromMe
   */
  public setFromMe(fromMe: boolean) {
    this.fromMe = fromMe;
  }

  /**
   * * Define as menções feitas nas mensagens
   * @param mentions
   */
  public setMentions(mentions: string[]) {
    this.mentions = mentions;
  }

  public setTimestamp(timestamp: number) {
    this.timestamp = timestamp;
  }

  /**
   * * Adiciona um numero a lista de mencionados
   * @param id
   */
  public addMentions(id: string[] | string) {
    if (typeof id == "string") {
      this.mentions.push(id);
      return;
    }

    this.mentions.push(...id);
  }

  /**
   * * Obter a sala de bate-papo da mensagem
   * @returns
   */
  public getChat(): Chat {
    return this.chat;
  }

  /**
   * * Obter o texto da mensagem
   * @returns
   */
  public getText(): string {
    return this.text;
  }

  /**
   * * Obter a menção da mensagem
   * @returns
   */
  public getMention(): Message | undefined {
    return this.mention;
  }

  /**
   * * Retorna se a mensagem é nova
   * @returns
   */
  public getIsOld(): boolean | undefined {
    return this.isOld;
  }

  /**
   * * Retorna o ID da mensagem
   * @returns
   */
  public getId(): string | undefined {
    return this.id;
  }

  /**
   * * Retorna o usuário
   * @returns
   */
  public getUser(): User {
    return this.user;
  }

  /**
   * * retorna se foi enviada pelo próprioI bot
   * @returns
   */
  public getFromMe(): boolean {
    return this.fromMe || false;
  }

  /**
   * * Define uma mensagem não refactorada
   * @param originalMessage
   */
  public setOriginalMessage(originalMessage: any): void {
    this._originalMessage = originalMessage;
  }

  /**
   * * Retorna a mensagem não refatorada
   * @returns
   */
  public getOriginalMessage(): any {
    return this._originalMessage;
  }

  //? O Baileys (WhatsApp) precisa da menção original para mencionar uma mensagem
  /**
   * * Define uma menção não refactorada
   * @param originalMention
   */
  public setOriginalMention(originalMention: any): void {
    this._originalMention = originalMention;
  }

  /**
   * * Retorna a menção não refatorada
   * @returns
   */
  public getOriginalMention(): any {
    return this._originalMention;
  }
}
