export class Command {
  private _executeCallback: Function = () => {};
  private _replyCallback: Function = () => {};

  public permissions: Array<string> = [];
  public category: Array<string> = [];
  public allowed: boolean = true;
  public description: string;
  public name: string;

  constructor(
    name: string,
    description?: string,
    permissions?: Array<string> | string,
    category?: Array<string> | string,
    executeCallback?: Function,
    replyCallback?: Function
  ) {
    this.description = description || "";
    this.name = name;

    this.setExecute(executeCallback || function () {});
    this.setReply(replyCallback || function () {});
    this.setPermission(permissions || []);
    this.setCategory(category || []);
  }

  public execute(...args: any): any {
    return this._executeCallback(...args);
  }

  public reply(...args: any): any {
    return this._replyCallback(...args);
  }

  public setExecute(executeCallback: Function) {
    this._executeCallback = executeCallback;
  }

  public setReply(replyCallback: Function) {
    this._replyCallback = replyCallback;
  }

  public setName(name: string) {
    this.name = name;
  }

  public setDescription(description: string) {
    this.description = description;
  }

  public setAllowed(allowed: boolean) {
    this.allowed = allowed;
  }

  public setPermission(permissions: Array<string> | string) {
    if (typeof permissions === "string") {
      this.permissions = [permissions];
    }

    if (Array.isArray(permissions)) {
      this.permissions = permissions;
    }
  }

  public setCategory(category: Array<string> | string) {
    if (typeof category === "string") {
      this.category = [category];
    }

    if (Array.isArray(category)) {
      this.category = category;
    }
  }

  public addPermission(permissions: Array<string> | string) {
    if (typeof permissions === "string") {
      this.permissions.push(permissions);
    }

    if (Array.isArray(permissions)) {
      this.permissions.push(...permissions);
    }
  }

  public addCategory(category: Array<string> | string) {
    if (typeof category === "string") {
      this.category.push(category);
    }

    if (Array.isArray(category)) {
      this.category.push(...category);
    }
  }

  public getName(): string {
    return this.name;
  }

  public getDescription(): string {
    return this.description;
  }

  public getPermission(): Array<string> {
    return this.permissions;
  }

  public getCategory(): Array<string> {
    return this.category;
  }

  public getAllowed(): boolean {
    return this.allowed;
  }
}

export class Commands {
  public commands: { [key: string]: Command } = {};

  constructor(commands?: { [key: string]: Command }) {
    if (commands) {
      this.commands = commands;
    }
  }

  /**
   * * Define um comando
   * @param name
   * @param command
   */
  public setCommand(name: string, command: Command) {
    this.commands[name] = command;
  }

  /**
   * * Define os comandos
   * @param commands
   */
  public setCommands(commands: { [key: string]: Command }) {
    this.commands = commands;
  }

  /**
   * * Retorna um comando
   * @param name
   * @returns
   */
  public get(name: string, lower: boolean = true): Command | undefined {
    const nm = lower ? name.toLowerCase() : name;

    const cmd = this.commands[nm.trim()];

    return cmd;
  }
}
