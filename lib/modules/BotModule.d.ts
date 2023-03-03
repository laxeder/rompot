/// <reference types="node" />
import { ConnectionConfig } from "@config/ConnectionConfig";
import { IMessage } from "@interfaces/IMessage";
import ICommand from "@interfaces/ICommand";
import IChat from "@interfaces/IChat";
import IUser from "@interfaces/IUser";
import IBot from "@interfaces/IBot";
import Auth from "@interfaces/Auth";
import LocationMessage from "@messages/LocationMessage";
import ContactMessage from "@messages/ContactMessage";
import ButtonMessage from "@messages/ButtonMessage";
import MediaMessage from "@messages/MediaMessage";
import VideoMessage from "@messages/VideoMessage";
import ImageMessage from "@messages/ImageMessage";
import ListMessage from "@messages/ListMessage";
import Message from "@messages/Message";
import UserModule from "@modules/User";
import Chat from "@modules/Chat";
import User from "@modules/User";
import Emmiter from "@utils/Emmiter";
import { Chats, ChatStatus } from "../types/Chat";
import { Users } from "../types/User";
import AudioMessage from "@messages/AudioMessage";
export default class BotModule<Bot extends IBot, Command extends ICommand> extends Emmiter {
    #private;
    commands: Command[];
    bot: Bot;
    config: ConnectionConfig;
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
    addReaction(message: IMessage, reaction: string): Promise<void>;
    /**
     * * Remove a reação da mensagem
     * @param message Mensagem que terá sua reação removida
     */
    removeReaction(message: IMessage): Promise<void>;
    /**
     * * Deletar mensagem
     * @param message Mensagem que será deletada da sala de bate-papos
     */
    deleteMessage(message: IMessage): Promise<void>;
    /**
     * * Remover mensagem
     * @param message Mensagem que será removida da sala de bate-papo
     */
    removeMessage(message: IMessage): Promise<void>;
    /**
     * * Marca uma mensagem como visualizada
     * @param message Mensagem que será visualizada
     */
    readMessage(message: IMessage): Promise<void>;
    /**
     * * Envia um conteúdo
     * @param content
     * @returns Retorna o conteudo enviado
     */
    send(message: IMessage): Promise<Message>;
    /**
     * * Aguarda uma mensagem ser recebida em uma sala de bate-papo
     * @param chatId Sala de bate-papo que irá receber a mensagem
     * @param ignoreMessageFromMe Ignora a mensagem se quem enviou foi o próprio bot
     * @param stopRead Para de ler a mensagem no evento
     * @param ignoreMessages Não resolve a promessa se a mensagem recebida é a mesma escolhida
     */
    awaitMessage(chat: IChat | string, ignoreMessageFromMe?: boolean, stopRead?: boolean, ...ignoreMessages: Message[]): Promise<Message>;
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
    setCommands(commands: Command[]): void;
    /**
     * @returns Retorna os comandos do bot
     */
    getCommands(): Command[];
    /**
     * * Adiciona um comando na lista de comandos
     * @param command Comando que será adicionado
     */
    addCommand(command: Command): void;
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
    getChat(chat: IChat | string): Promise<Chat | null>;
    /**
     * * Define uma sala de bate-papo
     * @param chat Sala de bate-papo
     */
    setChat(chat: IChat): Promise<void>;
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
    addChat(chat: string | IChat): Promise<void>;
    /**
     * * Remove uma sala de bate-papo
     * @param chat Sala de bate-papo
     */
    removeChat(chat: string | IChat): Promise<void>;
    /**
     * @param chat Sala de bate-papo
     * @returns Retorna o nome da sala de bate-papo
     */
    getChatName(chat: IChat | string): Promise<string>;
    /**
     * @param chat Sala de bate-papo
     * @param name Nome da sala de bate-papo
     */
    setChatName(chat: IChat | string, name: string): Promise<void>;
    /**
     * @param chat Sala de bate-papo
     * @returns Retorna a descrição da sala de bate-papo
     */
    getChatDescription(chat: IChat | string): Promise<string>;
    /**
     * @param chat Sala de bate-papo
     * @param description Descrição da sala de bate-papo
     */
    setChatDescription(chat: IChat | string, description: string): Promise<void>;
    /**
     * @param chat Sala de bate-papo
     * @returns Retorna a imagem de perfil da sala de bate-papo
     */
    getChatProfile(chat: IChat | string): Promise<Buffer>;
    /**
     * @param chat Sala de bate-papo
     * @param profile Imagem de perfil da sala de bate-papo
     */
    setChatProfile(chat: IChat | string, profile: Buffer): Promise<void>;
    /**
     * * Altera o status da sala de bate-papo
     * @param chat Sala de bate-papo
     * @param status Status da sala de bate-papo
     */
    changeChatStatus(chat: string | IChat, status: ChatStatus): Promise<void>;
    /**
     * * Adiciona um novo usuário a uma sala de bate-papo
     * @param chat Sala de bate-papo
     * @param user Usuário
     */
    addUserInChat(chat: IChat | string, user: IUser | string): Promise<void>;
    /**
     * * Adiciona um novo usuário a uma sala de bate-papo
     * @param chat Sala de bate-papo
     * @param user Usuário
     */
    removeUserInChat(chat: IChat | string, user: IUser | string): Promise<void>;
    /**
     * * Promove há administrador um usuário da sala de bate-papo
     * @param chat Sala de bate-papo
     * @param user Usuário
     */
    promoteUserInChat(chat: IChat | string, user: IUser | string): Promise<void>;
    /**
     * * Remove a administração um usuário da sala de bate-papo
     * @param chat Sala de bate-papo
     * @param user Usuário
     */
    demoteUserInChat(chat: IChat | string, user: IUser): Promise<void>;
    /**
     * * Cria uma sala de bate-papo
     * @param chat Sala de bate-papo
     */
    createChat(chat: IChat): Promise<void>;
    /**
     * * Sai de uma sala de bate-papo
     * @param chat Sala de bate-papo
     */
    leaveChat(chat: IChat | string): Promise<void>;
    /**
     * @param chat Sala de bate-papo
     * @returns Retorna os administradores de uma sala de bate-papo
     */
    getChatAdmins(chat: IChat | string): Promise<Users>;
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
    setUser(user: string | IUser): Promise<void>;
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
    addUser(user: string | IUser): Promise<void>;
    /**
     * * Remove um usuário
     * @param user Usuário
     */
    removeUser(user: IUser | string): Promise<void>;
    /**
     * @param user Usuário
     * @returns Retorna o nome do usuário
     */
    getUserName(user: IUser | string): Promise<string>;
    /**
     * @param user Usuário
     * @param name Nome do usuário
     */
    setUserName(user: IUser | string, name: string): Promise<void>;
    /**
     * @param user Usuário
     * @returns Retorna a descrição do usuário
     */
    getUserDescription(user: IUser | string): Promise<string>;
    /**
     * @param user Usuário
     * @param description Descrição do usuário
     */
    setUserDescription(user: IUser | string, description: string): Promise<void>;
    /**
     * @param user Usuário
     * @returns Retorna a foto de perfil do usuário
     */
    getUserProfile(user: IUser | string): Promise<Buffer>;
    /**
     * @param user Usuário
     * @param profile Imagem de perfil do usuário
     */
    setUserProfile(user: IUser | string, profile: Buffer): Promise<void>;
    /**
     * * Desbloqueia um usuário
     * @param user Usuário
     */
    unblockUser(user: IUser | string): Promise<void>;
    /**
     * * Bloqueia um usuário
     * @param user Usuário
     */
    blockUser(user: IUser | string): Promise<void>;
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
    User(user: IUser | string): User;
    /**
     * * Mensagem
     * @param chat Sala de bate-papo
     * @param text Texto da mensagem
     */
    Message(chat: IChat | string, text: string): Message;
    /**
     * * Mensagem contendo uma mídia
     * @param chat Sala de bate-papo
     * @param text Texto da mensagem
     */
    MediaMessage(chat: IChat | string, text: string, file: any): MediaMessage;
    /**
     * * Mensagem com imagem
     * @param chat Sala de bate-papo
     * @param text Texto da mensagem
     * @param image Imagem
     */
    ImageMessage(chat: IChat | string, text: string, image: Buffer): ImageMessage;
    /**
     * * Mensagem com vídeo
     * @param chat Sala de bate-papo
     * @param text Texto da mensagem
     * @param video Video
     */
    VideoMessage(chat: IChat | string, text: string, video: Buffer): VideoMessage;
    /**
     * * Mensagem com audio
     * @param chat Sala de bate-papo
     * @param audio Audio
     */
    AudioMessage(chat: IChat | string, audio: Buffer): AudioMessage;
    /**
     * * Mensagem com contatos
     * @param chat Sala de bate-papo
     * @param text Texto da mensagem
     * @param contact Contato
     */
    ContactMessage(chat: IChat | string, text: string, contact: string | string[]): ContactMessage;
    /**
     * * Mensagem com localização
     * @param chat Sala de bate-papo
     * @param longitude Longitude
     * @param latitude Latitude
     */
    LocationMessage(chat: IChat | string, latitude: number, longitude: number): LocationMessage;
    /**
     * * Mensagem com lista
     * @param chat Sala de bate-papo
     * @param text Texto da mensagem
     */
    ListMessage(chat: IChat | string, text: string, button: string): ListMessage;
    /**
     * * Mensagem com botões
     * @param chat Sala de bate-papo
     * @param text Texto da mensagem
     */
    ButtonMessage(chat: IChat | string, text: string): ButtonMessage;
}
export declare function BuildBot<Bot extends IBot, Command extends ICommand>(bot: Bot, config?: ConnectionConfig): BotModule<Bot, Command>;
