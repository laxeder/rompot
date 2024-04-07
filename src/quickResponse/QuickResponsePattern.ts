import type QuickResponseController from "./QuickResponseController";

import type Message from "../messages/Message";

export type QuickResponsePattern = string | RegExp | CustomQuickResponsePattern;

export type CustomQuickResponsePattern = (text: string, message: Message, quickResponseController: QuickResponseController) => Promise<boolean> | boolean;
