import { ConnectionConfig, DefaultConnectionConfig } from "@config/ConnectionConfig";
import { DefaultCommandConfig } from "@config/CommandConfig";

import { IClient } from "@interfaces/IClient";
import ICommand from "@interfaces/ICommand";
import IAuth from "@interfaces/IAuth";
import IBot from "@interfaces/IBot";

import ReactionMessage from "@messages/ReactionMessage";
import LocationMessage from "@messages/LocationMessage";
import ContactMessage from "@messages/ContactMessage";
import StickerMessage from "@messages/StickerMessage";
import ButtonMessage from "@messages/ButtonMessage";
import ImageMessage from "@messages/ImageMessage";
import VideoMessage from "@messages/VideoMessage";
import MediaMessage from "@messages/MediaMessage";
import ListMessage from "@messages/ListMessage";
import FileMessage from "@messages/FileMessage";
import PollMessage from "@messages/PollMessage";
import Message from "@messages/Message";

import { ClientBase, BotBase } from "@modules/Base";
import Command from "@modules/Command";
import Client from "@modules/Client";
import Chat from "@modules/Chat";
import User from "@modules/User";

import PromiseMessages, { PromiseMessage } from "@utils/PromiseMessages";
import { ClientEvents, BotEvents } from "@utils/Emmiter";
import WaitCallBack from "@utils/WaitCallBack";

import { MultiFileAuthState } from "@wa/Auth";
import WhatsAppBot from "@wa/WhatsAppBot";

export { ConnectionConfig };

export { IAuth, IBot, ICommand, IClient };

export { ButtonMessage, ContactMessage, ImageMessage, VideoMessage, MediaMessage, Message, ListMessage, LocationMessage, StickerMessage, FileMessage, ReactionMessage, PollMessage };

export { BotBase, Command, Client, Chat, User, ClientBase };

export { ClientEvents, BotEvents, PromiseMessages, PromiseMessage, WaitCallBack };

export * from "@utils/Generic";

export * from "./types/Connection";
export * from "./types/Message";
export * from "./types/Client";
export * from "./types/Chat";
export * from "./types/User";
export * from "./types/Bot";

export * from "./wa/WAModule";

export { DefaultCommandConfig, DefaultConnectionConfig };

export { MultiFileAuthState, WhatsAppBot };

export default Client;
