"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_COMMAND_CONTROLLER_CONFIG = exports.CommandController = void 0;
const Command_1 = require("../../enums/Command");
const Command_2 = require("../../utils/Command");
class CommandController extends Command_2.CommandControllerEvent {
    constructor(client, config = {}) {
        super();
        this.config = {};
        this.commands = [];
        this.client = client;
        this.config = Object.assign(Object.assign({}, exports.DEFAULT_COMMAND_CONTROLLER_CONFIG), config);
    }
    setCommands(commands) {
        const cmds = [];
        for (const command of commands) {
            command.client = this.client;
            cmds.push(command);
        }
        this.commands = cmds;
    }
    getCommands() {
        return this.commands;
    }
    addCommand(command) {
        command.client = this.client;
        this.commands.push(command);
    }
    removeCommand(command) {
        const commands = [];
        const commandKeys = command.keys.map((key) => key.values.join("")).join("");
        for (const cmd of this.commands) {
            const keys = cmd.keys.map((key) => key.values.join("")).join("");
            if (keys == commandKeys)
                continue;
            commands.push(cmd);
        }
        if (this.commands.length == commands.length)
            return false;
        this.commands = commands;
        return true;
    }
    searchCommand(text) {
        const commands = [];
        for (const command of this.commands) {
            const key = command.onSearch(`${text}`, this.config);
            if (key != null) {
                commands.push({ key, command });
            }
        }
        let commandResult = null;
        for (const { key, command } of commands) {
            if (commandResult == null) {
                commandResult = { key, command };
                continue;
            }
            if (key.values.join("").length > commandResult.key.values.join("").length) {
                commandResult = { key, command };
            }
        }
        if (commandResult == null)
            return null;
        return commandResult.command;
    }
    runCommand(command, message, type = Command_1.CMDRunType.Exec) {
        return __awaiter(this, void 0, void 0, function* () {
            const permission = yield command.checkPerms(message);
            if (permission != null && !permission.isPermited) {
                this.emit("no-allowed", { message, command, permission });
                return;
            }
            if (type == Command_1.CMDRunType.Reply) {
                return yield this.replyCommand(message, command);
            }
            return this.execCommand(message, command);
        });
    }
    execCommand(message, command) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield command.onExec(message);
        });
    }
    replyCommand(message, command) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield command.onReply(message);
        });
    }
}
exports.CommandController = CommandController;
exports.DEFAULT_COMMAND_CONTROLLER_CONFIG = {};
//# sourceMappingURL=CommandController.js.map