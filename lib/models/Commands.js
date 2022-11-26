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
    execute(...args) {
        return this._executeCallback(...args);
    }
    reply(...args) {
        return this._replyCallback(...args);
    }
    setExecute(executeCallback) {
        this._executeCallback = executeCallback;
    }
    setReply(replyCallback) {
        this._replyCallback = replyCallback;
    }
    setName(name) {
        this.name = name;
    }
    setDescription(description) {
        this.description = description;
    }
    setAllowed(allowed) {
        this.allowed = allowed;
    }
    setPermission(permissions) {
        if (typeof permissions === "string") {
            this.permissions = [permissions];
        }
        if (Array.isArray(permissions)) {
            this.permissions = permissions;
        }
    }
    setCategory(category) {
        if (typeof category === "string") {
            this.category = [category];
        }
        if (Array.isArray(category)) {
            this.category = category;
        }
    }
    addPermission(permissions) {
        if (typeof permissions === "string") {
            this.permissions.push(permissions);
        }
        if (Array.isArray(permissions)) {
            this.permissions.push(...permissions);
        }
    }
    addCategory(category) {
        if (typeof category === "string") {
            this.category.push(category);
        }
        if (Array.isArray(category)) {
            this.category.push(...category);
        }
    }
    getName() {
        return this.name;
    }
    getDescription() {
        return this.description;
    }
    getPermission() {
        return this.permissions;
    }
    getCategory() {
        return this.category;
    }
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