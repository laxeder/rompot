import Message from "@messages/Message";
import Chat from "@modules/Chat";
import Bot from "@modules/Bot";

export class Command {
  private _bot: Bot = new Bot();

  private _executeCallback: Function = () => {};
  private _replyCallback: Function = () => {};
  private _update: Function = () => {};
  private _send?: Message;

  public permissions: Array<string> = [];
  public category: Array<string> = [];
  public description: string = "";
  public allowed: boolean = true;
  public names: string[] = [];
  public prefix?: string;

  constructor(name: string | string[], description?: string, permissions?: Array<string> | string, category?: Array<string> | string, executeCallback?: Function, replyCallback?: Function) {
    this.setName(name);
    this.setDescription(description || "");

    this.setExecute(executeCallback || function () {});
    this.setReply(replyCallback || function () {});
    this.setPermission(permissions || []);
    this.setCategory(category || []);
  }

  /**
   * * Define o bot que executa o comando
   * @param bot
   */
  public setBot(bot: Bot) {
    this._bot = bot;
  }

  /**
   * * Retorna o bot que executa o comando
   * @returns
   */
  public getBot(): Bot {
    return this._bot;
  }

  /**
   * * Define uma função que lê atualizações do comando
   * @param update funcão que receberá a atualização
   */
  public setUpdate(update: Function) {
    this._update = update;
  }

  /**
   * * Executa o comando
   * @param message
   * @param args
   */
  public async execute(message: Message, ...args: any[]) {
    if (!this._send || !this._bot) {
      return this._executeCallback(message, ...args);
    }

    this._send.chat = message.chat;
    return this._bot.send(this._send);
  }

  /**
   * * Executa a resposta do comando
   * @param args
   */
  public async reply(...args: any[]) {
    return this._replyCallback(...args);
  }

  /**
   * * Define a função do comando
   * @param executeCallback
   */
  public setExecute(executeCallback: Function) {
    this._executeCallback = executeCallback;
  }

  /**
   * * Define uma resposta ao comando
   * @param replyCallback
   */
  public setReply(replyCallback: Function) {
    this._replyCallback = replyCallback;
  }

  public setSend(message: string | Message) {
    if (typeof message == "string") return (this._send = new Message(new Chat(""), message));
    this._send = message;
  }

  /**
   * * Define um prefixo geral
   * @param prefix
   */
  public setPrefix(prefix: string) {
    this.prefix = prefix;

    this._update();
  }

  /**
   * * Define o nome do comando
   * @param name
   */
  public setName(name: string[] | string) {
    if (typeof name == "string") return this.names.push(name);
    this.names = name;
  }

  /**
   * * Define a descrição do comando
   * @param description
   */
  public setDescription(description: string) {
    this.description = description;
  }

  /**
   * * Define se está permitido
   * @param allowed
   */
  public setAllowed(allowed: boolean) {
    this.allowed = allowed;
  }

  /**
   * * Define a permissão do comando
   * @param permissions
   */
  public setPermission(permissions: Array<string> | string) {
    if (typeof permissions === "string") {
      this.permissions = [permissions];
    }

    if (Array.isArray(permissions)) {
      this.permissions = permissions;
    }
  }

  /**
   * * Define a categoria do comando
   * @param category
   */
  public setCategory(category: Array<string> | string) {
    if (typeof category === "string") {
      this.category = [category];
    }

    if (Array.isArray(category)) {
      this.category = category;
    }
  }

  public addName(name: string | string[]) {
    if (typeof name === "string") return this.names.push(name);
    this.names.push(...name);
  }

  /**
   * * Adiciona  uma permissão ao comando
   * @param permissions
   */
  public addPermission(permissions: Array<string> | string) {
    if (typeof permissions === "string") {
      this.permissions.push(permissions);
    }

    if (Array.isArray(permissions)) {
      this.permissions.push(...permissions);
    }
  }

  /**
   * * Adiciona uma categoria ao comando
   * @param category
   */
  public addCategory(category: Array<string> | string) {
    if (typeof category === "string") {
      this.category.push(category);
    }

    if (Array.isArray(category)) {
      this.category.push(...category);
    }
  }

  /**
   * * Retorna os nomes do comando
   * @returns
   */
  public getNames(): string[] {
    return this.names;
  }

  /**
   * * Retorna os nome do comando
   * @returns
   */
  public getName(): string {
    return this.names[0];
  }

  /**
   * * Retorna a descricão do comando
   * @returns
   */
  public getDescription(): string {
    return this.description;
  }

  /**
   * * Retorna a permissão do comando
   * @returns
   */
  public getPermission(): Array<string> {
    return this.permissions;
  }

  /**
   * * Retorna a categoria do comando
   * @returns
   */
  public getCategory(): Array<string> {
    return this.category;
  }

  /**
   * * Retorna se está permetido
   * @returns
   */
  public getAllowed(): boolean {
    return this.allowed;
  }
}
