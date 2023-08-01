import WhatsAppBot from "./WhatsAppBot";
export default class ConfigWAEvents {
    wa: WhatsAppBot;
    constructor(wa: WhatsAppBot);
    configureAll(): void;
    configCBNotifications(): void;
    configCBNotificationRemove(): void;
    configCBNotificationAdd(): void;
    configCBNotificationPromote(): void;
    configCBNotificationDemote(): void;
    configMessagesUpsert(): void;
    configConnectionUpdate(): void;
    configHistorySet(): void;
    configContactsUpdate(): void;
    configChatsUpsert(): void;
    configGroupsUpdate(): void;
    configChatsDelete(): void;
}
