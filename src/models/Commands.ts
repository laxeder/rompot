import { Command } from "@models/Command";
import { Bot } from "@models/Bot";

export class Commands {
  private _bot: Bot;
  private prefix?: string;
  private maxCommandLength: number = 0;
  private commands: { [key: string]: Command } = {};

  constructor(commands?: { [key: string]: Command }, prefix?: string) {
    if (commands) {
      this.setCommands(commands);
    }

    this._bot = new Bot();
    this.prefix = prefix;
  }

  /**
   * * Atualiza os comandos
   */
  public update(commands = this.commands) {
    this.setCommands(commands);
  }

  /**
   * * Define um prefixo geral
   * @param prefix
   */
  public setPrefix(prefix: string) {
    this.prefix = prefix;

    this.update();
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
  public getBot(): Bot {
    return this._bot;
  }

  /**
   * * Adiciona um comando
   * @param command
   */
  public addCommand(command: Command) {
    if (this._bot) command.setBot(this._bot);

    command.names.forEach((name) => {
      if (name.length > this.maxCommandLength) this.maxCommandLength = name.length;

      command.setUpdate(() => this.update());

      const prefix = command.prefix || this.prefix || "";

      this.commands[`${prefix}${name}`] = command;
      this.commands[`${prefix}${name}`.toLowerCase().trim()] = command;
    });
  }

  /**
   * * remove um comando
   * @param command
   */
  public removeCommand(command: Command) {
    command.names.forEach((name) => {
      const prefix = command.prefix || this.prefix || "";

      delete this.commands[`${prefix}${name}`];
      delete this.commands[`${prefix}${name}`.toLowerCase().trim()];
    });

    this.update();
  }

  /**
   * * Define os comandos
   * @param commands
   */
  public setCommands(commands: { [key: string]: Command } | Command[]) {
    this.commands = {};

    if (Array.isArray(commands)) {
      commands.forEach((command) => {
        this.addCommand(command);
      });
    } else {
      Object.keys(commands).forEach((key) => {
        this.addCommand(commands[key]);
      });
    }
  }

  /**
   * * Retorna um comando
   * @param names
   * @returns
   */
  public getCommand(names: string | string[]): Command | undefined {
    if (!Array.isArray(names)) {
      names = [names];
    }

    var cmd: Command | undefined;

    for (let name of names) {
      let text = "";
      for (let char of name) {
        if (text.length > this.maxCommandLength) break;

        text += char;

        if (this.commands[text]) {
          cmd = this.commands[text];
        } else if (this.commands[text.toLowerCase().trim()]) {
          cmd = this.commands[text.toLowerCase().trim()];
        }
      }
    }

    if (cmd) cmd.setBot(this._bot);

    return cmd;
  }
}
