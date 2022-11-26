"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Commands = exports.Command = void 0;
class Command {
    constructor(name, description, permissions, category, executeCallback, replyCallback) {
        this._executeCallback = () => { };
        this._replyCallback = () => { };
        this.permissions = [];
        this.category = [];
        this.allowed = true;
        this.description = description || "";
        this.name = name;
        this.setExecute(executeCallback || function () { });
        this.setReply(replyCallback || function () { });
        this.setPermission(permissions || []);
        this.setCategory(category || []);
    }
    /**
     * * Executa o comando
     */
    execute(...args) {
        return this._executeCallback(...args);
    }
    /**
     * * Executa a resposta do comando
     */
    reply(...args) {
        return this._replyCallback(...args);
    }
    /**
     * * Define a função do comando
     * @param executeCallback
     */
    setExecute(executeCallback) {
        this._executeCallback = executeCallback;
    }
    /**
     * * Define uma resposta ao comando
     * @param replyCallback
     */
    setReply(replyCallback) {
        this._replyCallback = replyCallback;
    }
    /**
     * * Define o nome do comando
     * @param name
     */
    setName(name) {
        this.name = name;
    }
    /**
     * * Define a descrição do comando
     * @param description
     */
    setDescription(description) {
        this.description = description;
    }
    /**
     * * Define se está permitido
     * @param allowed
     */
    setAllowed(allowed) {
        this.allowed = allowed;
    }
    /**
     * * Define a permissão do comando
     * @param permissions
     */
    setPermission(permissions) {
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
    setCategory(category) {
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
    addPermission(permissions) {
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
    addCategory(category) {
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
    getName() {
        return this.name;
    }
    /**
     * * Retorna a descricão do comando
     * @returns
     */
    getDescription() {
        return this.description;
    }
    /**
     * * Retorna a permissão do comando
     * @returns
     */
    getPermission() {
        return this.permissions;
    }
    /**
     * * Retorna a categoria do comando
     * @returns
     */
    getCategory() {
        return this.category;
    }
    /**
     * * Retorna se está permetido
     * @returns
     */
    getAllowed() {
        return this.allowed;
    }
}
exports.Command = Command;
class Commands {
    constructor(commands) {
        this.commands = {};
        if (commands) {
            this.commands = commands;
        }
    }
    /**
     * * Define um comando
     * @param name
     * @param command
     */
    setCommand(name, command) {
        this.commands[name] = command;
    }
    /**
     * * Define os comandos
     * @param commands
     */
    setCommands(commands) {
        this.commands = commands;
    }
    /**
     * * Retorna um comando
     * @param name
     * @param lower
     * @returns
     */
    get(name, lower = true) {
        const nm = lower ? name.toLowerCase() : name;
        const cmd = this.commands[nm.trim()];
        return cmd;
    }
}
exports.Commands = Commands;
//# sourceMappingURL=Commands.js.map