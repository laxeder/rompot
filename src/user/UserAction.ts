import { UserEvent } from "./UserEvent";

/**
 * Ação relacionada aos usuários.
 */
export type UserAction = "join" | "leave" | UserEvent;
