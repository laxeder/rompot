import type QuickResponseController from "./QuickResponseController";
import type Message from "../../messages/Message";

/**
 * Padrões da resposta rápida.
 *
 * @example
 *
 * // Normal pattern
 * "buy"
 *
 * // Regex pattern
 * /search (.?*)\?/
 *
 * // Custom pattern
 * (message: Message) => message.text.includes("search")
 */
export type QuickResponsePattern = string | RegExp | CustomQuickResponsePattern;

/**
 * Padrão customizada da resposta rápida.
 *
 * @example
 *
 * // Custom pattern
 * (text: string, message: Message, quickResponseController: QuickResponseController) => {
 *   return text.includes("search");
 * }
 */
export type CustomQuickResponsePattern = (text: string, message: Message, quickResponseController: QuickResponseController) => Promise<boolean> | boolean;
