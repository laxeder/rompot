import type { QuickResponsePattern } from "./QuickResponsePattern";

import Message from "../messages/Message";

/** Resposta da resposta rápida */
export type QuickResponseReply = string | Message | CustomQuickResponseReply;

/** Resposta customizada da resposta rápida */
export type CustomQuickResponseReply = (message: Message, pattern: QuickResponsePattern) => any;
