"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Commands = void 0;
const Bot_1 = require("./Bot");
class Commands {
    constructor(commands, prefix) {
        this.maxCommandLength = 0;
        this.commands = {};
        this.prefix = prefix;
        if (commands) {
            this.setCommands(commands);
        }
        this._bot = new Bot_1.Bot();
    }
    /**
     * * Atualiza os comandos
     */
    update(commands = this.commands) {
        this.setCommands(commands);
    }
    /**
     * * Define um prefixo geral
     * @param prefix
     */
    setPrefix(prefix) {
        this.prefix = prefix;
        this.update();
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
        command.names.forEach((name) => {
            if (name.length > this.maxCommandLength)
                this.maxCommandLength = name.length;
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
    removeCommand(command) {
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
    setCommands(commands) {
        this.commands = {};
        if (Array.isArray(commands)) {
            commands.forEach((command) => {
                this.addCommand(command);
            });
        }
        else {
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
    getCommand(names) {
        if (!Array.isArray(names)) {
            names = [names];
        }
        var cmd;
        for (let name of names) {
            let text = "";
            for (let char of name) {
                if (text.length > this.maxCommandLength)
                    break;
                text += char;
                if (this.commands[text]) {
                    cmd = this.commands[text];
                }
                else if (this.commands[text.toLowerCase().trim()]) {
                    cmd = this.commands[text.toLowerCase().trim()];
                }
            }
        }
        if (cmd)
            cmd.setBot(this._bot);
        return cmd;
    }
}
exports.Commands = Commands;
//# sourceMappingURL=Commands.js.map