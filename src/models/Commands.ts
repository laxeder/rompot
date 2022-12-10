import { Bot } from "@models/Bot";
import { Command } from "@models/Command";

export class Commands {
  private _bot: Bot;

  public commands: { [key: string]: Command } = {};
  public prefix?: string;

  constructor(commands?: { [key: string]: Command }, bot?: Bot) {
    if (bot) this._bot = bot;
    else this._bot = new Bot();

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
  public getBot(): Bot {
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

    if (cmd) cmd.setBot(this._bot);

    return cmd;
  }
}
