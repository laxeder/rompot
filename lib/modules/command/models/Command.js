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
const CommandPermission_1 = __importDefault(require("../../command/models/CommandPermission"));
const CommandKey_1 = __importDefault(require("../../command/models/CommandKey"));
const perms_1 = require("../../command/utils/perms");
const client_1 = require("../../client");
const Generic_1 = require("../../../utils/Generic");
const Verify_1 = require("../../../utils/Verify");
class Command extends client_1.ClientModule {
    constructor() {
        super(...arguments);
        this.keys = [];
        this.permissions = [];
    }
    checkPerms(message) {
        return __awaiter(this, void 0, void 0, function* () {
            const permissions = [];
            yield Promise.all(this.permissions.map((permission) => __awaiter(this, void 0, void 0, function* () {
                const perm = (0, perms_1.CMDPerm)(permission);
                if (!(yield CommandPermission_1.default.check(message, perm))) {
                    perm.isPermited = false;
                    permissions.push(perm);
                }
            })));
            if (permissions.length > 0)
                return permissions[0];
            return null;
        });
    }
    onSearch(text, config) {
        return CommandKey_1.default.search(text, config, ...this.keys);
    }
    onRead() { }
    onConfig() { }
    onExec(message) { }
    onReply(message) { }
    static readCommands(dir) {
        return __awaiter(this, void 0, void 0, function* () {
            const commands = [];
            yield (0, Generic_1.readRecursiveDir)(dir, (filepath, filename, ext) => __awaiter(this, void 0, void 0, function* () {
                try {
                    if (ext != ".ts" && ext != ".js")
                        return;
                    const content = require(filepath);
                    if (!!!content)
                        return;
                    if (typeof content != "object")
                        return;
                    const keys = Object.keys(content);
                    yield Promise.all(keys.map((key) => __awaiter(this, void 0, void 0, function* () {
                        try {
                            const data = content[key];
                            if (!!!data)
                                return;
                            if ((0, Verify_1.isCommand)(data)) {
                                yield data.onRead();
                                commands.push(data);
                                return;
                            }
                            //@ts-ignore
                            const cmd = new data();
                            if ((0, Verify_1.isCommand)(cmd)) {
                                yield cmd.onRead();
                                commands.push(cmd);
                            }
                        }
                        catch (err) { }
                    })));
                }
                catch (err) { }
            }));
            return commands;
        });
    }
}
exports.default = Command;
//# sourceMappingURL=Command.js.map