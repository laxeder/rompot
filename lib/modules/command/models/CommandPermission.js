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
const rompot_base_1 = require("rompot-base");
class CommandPermission {
    constructor(id, isPermited = false) {
        this.id = id;
        this.isPermited = isPermited;
    }
    static check(message, cmdPerm) {
        return __awaiter(this, void 0, void 0, function* () {
            if (cmdPerm.id == rompot_base_1.CMDPerms.ChatPv) {
                return message.chat.type == "pv";
            }
            if (cmdPerm.id == rompot_base_1.CMDPerms.ChatGroup) {
                return message.chat.type == "group";
            }
            if (cmdPerm.id == rompot_base_1.CMDPerms.BotChatLeader) {
                return yield message.chat.isLeader(message.client.id);
            }
            if (cmdPerm.id == rompot_base_1.CMDPerms.BotChatAdmin) {
                return yield message.chat.isAdmin(message.client.id);
            }
            if (cmdPerm.id == rompot_base_1.CMDPerms.BotChatLeader) {
                return yield message.chat.isLeader(message.client.id);
            }
            if (cmdPerm.id == rompot_base_1.CMDPerms.UserChatAdmin) {
                return yield message.chat.isAdmin(message.user.id);
            }
            if (cmdPerm.id == rompot_base_1.CMDPerms.UserChatLeader) {
                return yield message.chat.isLeader(message.user.id);
            }
            return true;
        });
    }
}
exports.default = CommandPermission;
//# sourceMappingURL=CommandPermission.js.map