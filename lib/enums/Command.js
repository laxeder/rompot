"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CMDRunType = exports.CMDKeyType = exports.CMDPerms = void 0;
/** Permissões do comando */
var CMDPerms;
(function (CMDPerms) {
    CMDPerms["ChatPv"] = "chat-pv";
    CMDPerms["ChatGroup"] = "chat-group";
    CMDPerms["UserChatAdmin"] = "chat-admin";
    CMDPerms["UserChatLeader"] = "chat-leader";
    CMDPerms["BotChatAdmin"] = "bot-chat-admin";
    CMDPerms["BotChatLeader"] = "bot-chat-admin";
})(CMDPerms = exports.CMDPerms || (exports.CMDPerms = {}));
/** Tipo da chave do comando */
var CMDKeyType;
(function (CMDKeyType) {
    CMDKeyType["Sample"] = "sample";
    CMDKeyType["Exact"] = "exact";
})(CMDKeyType = exports.CMDKeyType || (exports.CMDKeyType = {}));
/** Tipo da execução do comando */
var CMDRunType;
(function (CMDRunType) {
    CMDRunType["Exec"] = "exec";
    CMDRunType["Reply"] = "reply";
})(CMDRunType = exports.CMDRunType || (exports.CMDRunType = {}));
//# sourceMappingURL=Command.js.map