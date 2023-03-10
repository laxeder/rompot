import { ConnectionConfig, DefaultConnectionConfig } from "@config/ConnectionConfig";
import { DefaultCommandConfig } from "@config/CommandConfig";

import { IUser } from "@interfaces/User";
import { IChat } from "@interfaces/Chat";
import IBot from "@interfaces/IBot";

import LocationMessage from "@messages/LocationMessage";
import ContactMessage from "@messages/ContactMessage";
import ButtonMessage from "@messages/ButtonMessage";
import ImageMessage from "@messages/ImageMessage";
import VideoMessage from "@messages/VideoMessage";
import MediaMessage from "@messages/MediaMessage";
import ListMessage from "@messages/ListMessage";
import Message from "@messages/Message";

import Client, { ClientType } from "@modules/Client";
import Command from "@modules/Command";
import Chat from "@modules/Chat";
import User from "@modules/User";

import PromiseMessages, { PromiseMessage } from "@utils/PromiseMessages";
import { ClientEvents, BotEvents } from "@utils/Emmiter";
import WaitCallBack from "@utils/WaitCallBack";

import { ClientBase, BotBase } from "@modules/Base";
import WhatsAppBot from "@wa/WhatsAppBot";

export { ConnectionConfig };

export { IUser, IChat, IBot };

export * from "@interfaces/Messages";

export { ButtonMessage, ContactMessage, ImageMessage, VideoMessage, MediaMessage, Message, ListMessage, LocationMessage };

export { Client, ClientType, Chat, User };

export { ClientEvents, BotEvents, PromiseMessages, PromiseMessage, WaitCallBack };

export * from "@utils/Generic";

export * from "./types/Connection";
export * from "./types/Message";
export * from "./types/Chat";
export * from "./types/User";
export * from "./types/Bot";

export * from "./wa/WAModule";

export { DefaultCommandConfig, DefaultConnectionConfig };

export { Command };

export { ClientBase, BotBase, WhatsAppBot };

export default Client;
