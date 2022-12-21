var ConnTypes: "qr" | "open" | "close" | "connecting" | "closed" | "reconnecting";
var ConnStatus: "online" | "offline";

export type ConnectionTypes = typeof ConnTypes;
export type ConnectionStatus = typeof ConnStatus;
