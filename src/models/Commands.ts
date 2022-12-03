import { Message } from "@messages/Message";
import { Bot } from "@controllers/Bot";
import { Chat } from "./Chat";

export class Command {
  private _executeCallback: Function = () => {};
  private _replyCallback: Function = () => {};
  private _send?: Message;
  private _bot?: Bot;

  public permissions: Array<string> = [];
  public category: Array<string> = [];
  public description: string = "";
  public allowed: boolean = true;
  public names: string[] = [];

  constructor(
    name: string | string[],
    description?: string,
    permissions?: Array<string> | string,
    category?: Array<string> | string,
    executeCallback?: Function,
    replyCallback?: Function
  ) {
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
  public getBot(): Bot | undefined {
    return this._bot;
  }

  /**
   * * Executa o comando
   * @param message
   * @param args
   */
  public execute(message: Message, ...args: any): any {
    if (!this._send || !this._bot) {
      return this._executeCallback(message, ...args);
    }

    this._send.chat = message.chat;
    this._bot.send(this._send);
  }

  /**
   * * Executa a resposta do comando
   * @param args
   */
  public reply(...args: any): any {
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

export class Commands {
  private _bot?: Bot;

  public commands: { [key: string]: Command } = {};
  public prefix?: string;

  constructor(commands?: { [key: string]: Command }, bot?: Bot) {
    if (bot) this.setBot(bot);

    if (commands) {
      this.setCommands(commands);
    }
  }

  /**
   * * Define um prefixo geral
   * @param prefix
   */
  public setPrefix(prefix: string) {
    this.prefix = prefix;
  }

  /**
   * * Obter prefixo geral
   * @returns
   */
  public getPrefix(): string | undefined {
    return this.prefix;
  }

  /**
   * * Define o bot que executa os comandos
   * @param bot
   */
  public setBot(bot: Bot) {
    this._bot = bot;
  }

  /**
   * * Retorna o bot que executa os comandos
   * @returns
   */
  public getBot(): Bot | undefined {
    return this._bot;
  }

  /**
   * * Adiciona um comando
   * @param command
   */
  public addCommand(command: Command) {
    if (this._bot) command.setBot(this._bot);

    command.getNames().forEach((name) => {
      this.commands[name] = command;
    });
  }

  /**
   * * Define os comandos
   * @param commands
   */
  public setCommands(commands: { [key: string]: Command }) {
    Object.keys(commands).forEach((key) => {
      this.addCommand(commands[key]);
    });
  }

  /**
   * * Retorna um comando
   * @param names
   * @returns
   */
  public get(names: string | string[]): Command | undefined {
    if (typeof names != "string") {
      names = names.filter((v) => {
        if (!!this.prefix) {
          if (!v.startsWith(this.prefix)) return;
          v = v.replace(this.prefix || "", "");
        }

        return this.commands[v?.trim()];
      });
    } else names = [names];

    const name: string = names[0] || "";

    const cmd = this.commands[name.replace(this.prefix || "", "").trim()];

    return cmd;
  }
}
