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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const rompot_base_1 = require("rompot-base");
const CommandControllerEvent_1 = __importDefault(require("../../command/controllers/CommandControllerEvent"));
const defaults_1 = require("../../command/utils/defaults");
class CommandController extends CommandControllerEvent_1.default {
    constructor(config = {}) {
        super();
        this.commands = [];
        this.config = Object.assign(Object.assign({}, defaults_1.DEFAULT_COMMAND_CONTROLLER_CONFIG), config);
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
    runCommand(command, message, type = rompot_base_1.CMDRunType.Exec) {
        return __awaiter(this, void 0, void 0, function* () {
            const permission = yield command.checkPerms(message);
            if (permission != null && !permission.isPermited) {
                this.emit("no-allowed", { message, command, permission });
                return;
            }
            if (type == rompot_base_1.CMDRunType.Reply) {
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
exports.default = CommandController;
//# sourceMappingURL=CommandController.js.map