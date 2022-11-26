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

  /**
   * * Executa o comando
   */
  public execute(...args: any): any {
    return this._executeCallback(...args);
  }

  /**
   * * Executa a resposta do comando
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

  /**
   * * Define o nome do comando
   * @param name
   */
  public setName(name: string) {
    this.name = name;
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
   * * Retorna o nome do comando
   * @returns
   */
  public getName(): string {
    return this.name;
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
   * @param lower
   * @returns
   */
  public get(name: string, lower: boolean = true): Command | undefined {
    const nm = lower ? name.toLowerCase() : name;

    const cmd = this.commands[nm.trim()];

    return cmd;
  }
}
