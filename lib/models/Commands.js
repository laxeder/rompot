"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Commands = void 0;
const Bot_1 = require("./Bot");
class Commands {
    constructor(commands, bot) {
        this.commands = {};
        if (bot)
            this._bot = bot;
        else
            this._bot = new Bot_1.Bot();
        if (commands) {
            this.setCommands(commands);
        }
    }
    /**
     * * Define um prefixo geral
     * @param prefix
     */
    setPrefix(prefix) {
        this.prefix = prefix;
    }
    /**
     * * Obter prefixo geral
     * @returns
     */
    getPrefix() {
        return this.prefix;
    }
    /**
     * * Define o bot que executa os comandos
     * @param bot
     */
    setBot(bot) {
        this._bot = bot;
    }
    /**
     * * Retorna o bot que executa os comandos
     * @returns
     */
    getBot() {
        return this._bot;
    }
    /**
     * * Adiciona um comando
     * @param command
     */
    addCommand(command) {
        if (this._bot)
            command.setBot(this._bot);
        command.getNames().forEach((name) => {
            this.commands[name] = command;
        });
    }
    /**
     * * Define os comandos
     * @param commands
     */
    setCommands(commands) {
        Object.keys(commands).forEach((key) => {
            this.addCommand(commands[key]);
        });
    }
    /**
     * * Retorna um comando
     * @param names
     * @returns
     */
    get(names) {
        if (typeof names != "string") {
            names = names.filter((v) => {
                if (!!this.prefix) {
                    if (!v.startsWith(this.prefix))
                        return;
                    v = v.replace(this.prefix || "", "");
                }
                return this.commands[v === null || v === void 0 ? void 0 : v.trim()];
            });
        }
        else
            names = [names];
        const name = names[0] || "";
        const cmd = this.commands[name.replace(this.prefix || "", "").trim()];
        if (cmd)
            cmd.setBot(this._bot);
        return cmd;
    }
}
exports.Commands = Commands;
//# sourceMappingURL=Commands.js.map