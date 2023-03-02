/// <reference types="node" />
import { ConnectionConfig } from "../config/ConnectionConfig";
import { MessageInterface } from "../interfaces/MessagesInterfaces";
import CommandInterface from "../interfaces/CommandInterface";
import ChatInterface from "../interfaces/ChatInterface";
import UserInterface from "../interfaces/UserInterface";
import BotInterface from "../interfaces/BotInterface";
import Auth from "../interfaces/Auth";
import LocationMessage from "../messages/LocationMessage";
import ContactMessage from "../messages/ContactMessage";
import ButtonMessage from "../messages/ButtonMessage";
import MediaMessage from "../messages/MediaMessage";
import VideoMessage from "../messages/VideoMessage";
import ImageMessage from "../messages/ImageMessage";
import ListMessage from "../messages/ListMessage";
import Message from "../messages/Message";
import UserModule from "./User";
import Chat from "./Chat";
import User from "./User";
import Emmiter from "../utils/Emmiter";
import { Chats, ChatStatus } from "../types/Chat";
import { Users } from "../types/User";
import AudioMessage from "../messages/AudioMessage";
export default class BotModule<Bot extends BotInterface, Command extends CommandInterface> extends Emmiter {
    private bot;
    private autoMessages;
    private promiseMessages;
    config: ConnectionConfig;
    commands: {
        [tag: string]: Command;
    };
    get id(): string;
    constructor(bot: Bot, config?: ConnectionConfig);
    /** * Configura os eventos */
    configEvents(): void;
    /**
     * * Conectar bot
     * @param auth Autenticação do bot
     */
    connect(auth: Auth | string): Promise<void>;
    /**
     * * Reconectar bot
     * @param alert Alerta que está reconectando
     */
    reconnect(alert?: boolean): Promise<void>;
    /**
     * * Parar bot
     * @param reason Razão por parar bot
     */
    stop(reason: any): Promise<void>;
    /**
     * * Adiciona uma reação na mensagem
     * @param message Mensagem que será reagida
     * @param reaction Reação
     */
    addReaction(message: MessageInterface, reaction: string): Promise<void>;
    /**
     * * Remove a reação da mensagem
     * @param message Mensagem que terá sua reação removida
     */
    removeReaction(message: MessageInterface): Promise<void>;
    /**
     * * Deletar mensagem
     * @param message Mensagem que será deletada da sala de bate-papos
     */
    deleteMessage(message: MessageInterface): Promise<void>;
    /**
     * * Remover mensagem
     * @param message Mensagem que será removida da sala de bate-papo
     */
    removeMessage(message: MessageInterface): Promise<void>;
    /**
     * * Marca uma mensagem como visualizada
     * @param message Mensagem que será visualizada
     */
    readMessage(message: MessageInterface): Promise<void>;
    /**
     * * Envia um conteúdo
     * @param content
     * @returns Retorna o conteudo enviado
     */
    send(message: MessageInterface): Promise<Message>;
    /**
     * * Aguarda uma mensagem ser recebida em uma sala de bate-papo
     * @param chatId Sala de bate-papo que irá receber a mensagem
     * @param ignoreMessageFromMe Ignora a mensagem se quem enviou foi o próprio bot
     * @param stopRead Para de ler a mensagem no evento
     * @param ignoreMessages Não resolve a promessa se a mensagem recebida é a mesma escolhida
     */
    awaitMessage(chat: ChatInterface | string, ignoreMessageFromMe?: boolean, stopRead?: boolean, ...ignoreMessages: Message[]): Promise<Message>;
    /**
     * * Automotiza uma mensagem
     * @param message
     * @param timeout
     * @param chats
     * @param id
     * @returns
     */
    addAutomate(message: Message, timeout: number, chats?: {
        [key: string]: Chat;
    }, id?: string): Promise<any>;
    /**
     * * Define os comandos do bot
     * @param commands Comandos que será injetado
     */
    setCommands(commands: {
        [k: string]: Command;
    } | Command[]): void;
    /**
     * @returns Retorna os comandos do bot
     */
    getCommands(): {
        [tag: string]: Command;
    };
    /**
     * * Define um comando na lista de comandos
     * @param command Comando que será definido
     */
    setCommand(command: Command): void;
    /**
     * @param command Comando que será procurado
     * @param args Argumentos que serão usados na construção do comando
     * @returns Retorna um comando do bot
     */
    getCommand(command: string): Command | null;
    /**
     * @param chat Sala de bate-papo
     * @returns Retorna uma sala de bate-papo
     */
    getChat(chat: ChatInterface | string): Promise<Chat | null>;
    /**
     * * Define uma sala de bate-papo
     * @param chat Sala de bate-papo
     */
    setChat(chat: ChatInterface): Promise<void>;
    /**
     * @returns Retorna as sala de bate-papo que o bot está
     */
    getChats(): Promise<Chats>;
    /**
     * * Define as salas de bate-papo que o bot está
     * @param chats Salas de bate-papo
     */
    setChats(chats: Chats): Promise<void>;
    /**
     * * Adiciona uma sala de bate-papo
     * @param chat Sala de bate-papo
     */
    addChat(chat: string | ChatInterface): Promise<void>;
    /**
     * * Remove uma sala de bate-papo
     * @param chat Sala de bate-papo
     */
    removeChat(chat: string | ChatInterface): Promise<void>;
    /**
     * @param chat Sala de bate-papo
     * @returns Retorna o nome da sala de bate-papo
     */
    getChatName(chat: ChatInterface | string): Promise<string>;
    /**
     * @param chat Sala de bate-papo
     * @param name Nome da sala de bate-papo
     */
    setChatName(chat: ChatInterface | string, name: string): Promise<void>;
    /**
     * @param chat Sala de bate-papo
     * @returns Retorna a descrição da sala de bate-papo
     */
    getChatDescription(chat: ChatInterface | string): Promise<string>;
    /**
     * @param chat Sala de bate-papo
     * @param description Descrição da sala de bate-papo
     */
    setChatDescription(chat: ChatInterface | string, description: string): Promise<void>;
    /**
     * @param chat Sala de bate-papo
     * @returns Retorna a imagem de perfil da sala de bate-papo
     */
    getChatProfile(chat: ChatInterface | string): Promise<Buffer>;
    /**
     * @param chat Sala de bate-papo
     * @param profile Imagem de perfil da sala de bate-papo
     */
    setChatProfile(chat: ChatInterface | string, profile: Buffer): Promise<void>;
    /**
     * * Altera o status da sala de bate-papo
     * @param chat Sala de bate-papo
     * @param status Status da sala de bate-papo
     */
    changeChatStatus(chat: string | ChatInterface, status: ChatStatus): Promise<void>;
    /**
     * * Adiciona um novo usuário a uma sala de bate-papo
     * @param chat Sala de bate-papo
     * @param user Usuário
     */
    addUserInChat(chat: ChatInterface | string, user: UserInterface | string): Promise<void>;
    /**
     * * Adiciona um novo usuário a uma sala de bate-papo
     * @param chat Sala de bate-papo
     * @param user Usuário
     */
    removeUserInChat(chat: ChatInterface | string, user: UserInterface | string): Promise<void>;
    /**
     * * Promove há administrador um usuário da sala de bate-papo
     * @param chat Sala de bate-papo
     * @param user Usuário
     */
    promoteUserInChat(chat: ChatInterface | string, user: UserInterface | string): Promise<void>;
    /**
     * * Remove a administração um usuário da sala de bate-papo
     * @param chat Sala de bate-papo
     * @param user Usuário
     */
    demoteUserInChat(chat: ChatInterface | string, user: UserInterface): Promise<void>;
    /**
     * * Cria uma sala de bate-papo
     * @param chat Sala de bate-papo
     */
    createChat(chat: ChatInterface): Promise<void>;
    /**
     * * Sai de uma sala de bate-papo
     * @param chat Sala de bate-papo
     */
    leaveChat(chat: ChatInterface | string): Promise<void>;
    /**
     * @param chat Sala de bate-papo
     * @returns Retorna os administradores de uma sala de bate-papo
     */
    getChatAdmins(chat: ChatInterface | string): Promise<Users>;
    /**
     * @param chat Sala de bate-papo
     * @returns Retorna o lider da sala de bate-papo
     */
    getChatLeader(chat: Chat | string): Promise<User>;
    /**
     * @param user Usuário
     * @returns Retorna um usuário
     */
    getUser(user: string): Promise<UserModule | null>;
    /**
     * * Define um usuário
     * @param user Usuário
     */
    setUser(user: string | UserInterface): Promise<void>;
    /**
     * @returns Retorna a lista de usuários do bot
     */
    getUsers(): Promise<Users>;
    /**
     * * Define a lista de usuários do bot
     * @param users Usuários
     */
    setUsers(users: Users): Promise<void>;
    /**
     * * Adiciona um novo usuário
     * @param user Usuário
     */
    addUser(user: string | UserInterface): Promise<void>;
    /**
     * * Remove um usuário
     * @param user Usuário
     */
    removeUser(user: UserInterface | string): Promise<void>;
    /**
     * @param user Usuário
     * @returns Retorna o nome do usuário
     */
    getUserName(user: UserInterface | string): Promise<string>;
    /**
     * @param user Usuário
     * @param name Nome do usuário
     */
    setUserName(user: UserInterface | string, name: string): Promise<void>;
    /**
     * @param user Usuário
     * @returns Retorna a descrição do usuário
     */
    getUserDescription(user: UserInterface | string): Promise<string>;
    /**
     * @param user Usuário
     * @param description Descrição do usuário
     */
    setUserDescription(user: UserInterface | string, description: string): Promise<void>;
    /**
     * @param user Usuário
     * @returns Retorna a foto de perfil do usuário
     */
    getUserProfile(user: UserInterface | string): Promise<Buffer>;
    /**
     * @param user Usuário
     * @param profile Imagem de perfil do usuário
     */
    setUserProfile(user: UserInterface | string, profile: Buffer): Promise<void>;
    /**
     * * Desbloqueia um usuário
     * @param user Usuário
     */
    unblockUser(user: UserInterface | string): Promise<void>;
    /**
     * * Bloqueia um usuário
     * @param user Usuário
     */
    blockUser(user: UserInterface | string): Promise<void>;
    /**
     * @returns Retorna o nome do bot
     */
    getBotName(): Promise<string>;
    /**
     * * Define o nome do bot
     * @param name Nome do bot
     */
    setBotName(name: string): Promise<void>;
    /**
     * @returns Retorna a descrição do bot
     */
    getBotDescription(): Promise<string>;
    /**
     * * Define a descrição do bot
     * @param description Descrição do bot
     */
    setBotDescription(description: string): Promise<void>;
    /**
     * @returns Retorna foto de perfil do bot
     */
    getBotProfile(): Promise<Buffer>;
    /**
     * * Define foto de perfil do bot
     * @param image Foto de perfil do bot
     */
    setBotProfile(profile: Buffer): Promise<void>;
    /**
     * * Sala de bate-papo
     * @param id Sala de bate-papo
     */
    Chat(chat: Chat | string): Chat;
    /**
     * * Usuário
     * @param user Usuário
     */
    User(user: UserInterface | string): User;
    /**
     * * Mensagem
     * @param chat Sala de bate-papo
     * @param text Texto da mensagem
     */
    Message(chat: ChatInterface | string, text: string): Message;
    /**
     * * Mensagem contendo uma mídia
     * @param chat Sala de bate-papo
     * @param text Texto da mensagem
     */
    MediaMessage(chat: ChatInterface | string, text: string, file: any): MediaMessage;
    /**
     * * Mensagem com imagem
     * @param chat Sala de bate-papo
     * @param text Texto da mensagem
     * @param image Imagem
     */
    ImageMessage(chat: ChatInterface | string, text: string, image: Buffer): ImageMessage;
    /**
     * * Mensagem com vídeo
     * @param chat Sala de bate-papo
     * @param text Texto da mensagem
     * @param video Video
     */
    VideoMessage(chat: ChatInterface | string, text: string, video: Buffer): VideoMessage;
    /**
     * * Mensagem com audio
     * @param chat Sala de bate-papo
     * @param audio Audio
     */
    AudioMessage(chat: ChatInterface | string, audio: Buffer): AudioMessage;
    /**
     * * Mensagem com contatos
     * @param chat Sala de bate-papo
     * @param text Texto da mensagem
     * @param contact Contato
     */
    ContactMessage(chat: ChatInterface | string, text: string, contact: string | string[]): ContactMessage;
    /**
     * * Mensagem com localização
     * @param chat Sala de bate-papo
     * @param longitude Longitude
     * @param latitude Latitude
     */
    LocationMessage(chat: ChatInterface | string, latitude: number, longitude: number): LocationMessage;
    /**
     * * Mensagem com lista
     * @param chat Sala de bate-papo
     * @param text Texto da mensagem
     */
    ListMessage(chat: ChatInterface | string, text: string, button: string): ListMessage;
    /**
     * * Mensagem com botões
     * @param chat Sala de bate-papo
     * @param text Texto da mensagem
     */
    ButtonMessage(chat: ChatInterface | string, text: string): ButtonMessage;
}
export declare function BuildBot<Bot extends BotInterface, Command extends CommandInterface>(bot: Bot, config?: ConnectionConfig): BotModule<Bot, Command>;
