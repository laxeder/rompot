import type UserEvent from "./UserEvent";

/** Ação relacionada aos usuários. */
type UserAction = "join" | "leave" | UserEvent;

export default UserAction;
