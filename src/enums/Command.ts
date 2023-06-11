/** Permissões do comando */
export enum CMDPerms {
  ChatPv = "chat-pv",
  ChatGroup = "chat-group",
  UserChatAdmin = "chat-admin",
  UserChatLeader = "chat-leader",
  BotChatAdmin = "bot-chat-admin",
  BotChatLeader = "bot-chat-admin",
}

/** Tipo da chave do comando */
export enum CMDKeyType {
  Sample = "sample",
  Exact = "exact",
}

/** Tipo da execução do comando */
export enum CMDRunType {
  Exec = "exec",
  Reply = "reply",
}
