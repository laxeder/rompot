import WhatsAppBot from "./WhatsAppBot";
export default class ConfigWAEvents {
    wa: WhatsAppBot;
    connectionResolve: (...args: any[]) => any;
    constructor(wa: WhatsAppBot);
    configure(): void;
    configCBNotifications(): void;
    configCBNotificationRemove(): void;
    configCBNotificationAdd(): void;
    configCBNotificationPromote(): void;
    configCBNotificationDemote(): void;
    configMessagesUpsert(): void;
    configConnectionUpdate(): void;
    configContactsUpdate(): void;
    configChatsUpsert(): void;
    configGroupsUpdate(): void;
    configChatsDelete(): void;
}
