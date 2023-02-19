/// <reference types="node" />
import { ConnectionConfig } from "../config/ConnectionConfig";
import UserInterface from "./UserInterface";
import ChatInterface from "./ChatInterface";
import Command from "../modules/Command";
import Emmiter from "../utils/Emmiter";
import { Commands } from "../types/Command";
import { ButtonMessageInterface, ContactMessageInterface, ImageMessageInterface, ListMessageInterface, LocationMessageInterface, MediaMessageInterface, MessageInterface, VideoMessageInterface } from "./MessagesInterfaces";
import Auth from "./Auth";
import { Chats, ChatStatus } from "../types/Chat";
import { BotStatus } from "../types/Bot";
import { Users } from "../types/User";
export default interface BotInterface {
    /** ID do bot */
    id: string;
    status: BotStatus;
    /** Gerenciador de eventos */
    ev: Emmiter;
    /** Configurações do bot */
    config: ConnectionConfig;
    /** Comandos do bot */
    commands: Commands;
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
     * * Marca uma mensagem como visualizada
     * @param message Mensagem que será visualizada
     */
    readMessage(message: MessageInterface): Promise<void>;
    /**
     * * Enviar mensagem
     * @param message Mensagem que será enviada
     */
    send(message: MessageInterface): Promise<MessageInterface>;
    /**
     * * Remover mensagem
     * @param message Mensagem que será removida da sala de bate-papo
     */
    removeMessage(message: MessageInterface): Promise<void>;
    /**
     * * Deletar mensagem
     * @param message Mensagem que será deletada da sala de bate-papos
     */
    deleteMessage(message: MessageInterface): Promise<void>;
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
    setBotProfile(image: Buffer): Promise<void>;
    /**
     * * Adiciona uma sala de bate-papo
     * @param chat Sala de bate-papo
     */
    addChat(chat: ChatInterface): Promise<void>;
    /**
     * * Remove uma sala de bate-papo
     * @param chat Sala de bate-papo
     */
    removeChat(chat: ChatInterface): Promise<void>;
    /**
     * * Adiciona um novo usuário a uma sala de bate-papo
     * @param chat Sala de bate-papo
     * @param user Usuário
     */
    addUserInChat(chat: ChatInterface, user: UserInterface): Promise<void>;
    /**
     * * Adiciona um novo usuário a uma sala de bate-papo
     * @param chat Sala de bate-papo
     * @param user Usuário
     */
    removeUserInChat(chat: ChatInterface, user: UserInterface): Promise<void>;
    /**
     * * Promove há administrador um usuário da sala de bate-papo
     * @param chat Sala de bate-papo
     * @param user Usuário
     */
    promoteUserInChat(chat: ChatInterface, user: UserInterface): Promise<void>;
    /**
     * * Remove a administração um usuário da sala de bate-papo
     * @param chat Sala de bate-papo
     * @param user Usuário
     */
    demoteUserInChat(chat: ChatInterface, user: UserInterface): Promise<void>;
    /**
     * * Altera o status da sala de bate-papo
     * @param chat Sala de bate-papo
     * @param status Status da sala de bate-papo
     */
    changeChatStatus(chat: ChatInterface, status: ChatStatus): Promise<void>;
    /**
     * * Cria uma sala de bate-papo
     * @param chat Sala de bate-papo
     */
    createChat(chat: ChatInterface): Promise<void>;
    /**
     * * Sai de uma sala de bate-papo
     * @param chat Sala de bate-papo
     */
    leaveChat(chat: ChatInterface): Promise<void>;
    /**
     * @param chat Sala de bate-papo
     * @returns Retorna uma sala de bate-papo
     */
    getChat(chat: ChatInterface): Promise<ChatInterface | null>;
    /**
     * * Define uma sala de bate-papo
     * @param chat Sala de bate-papo
     */
    setChat(chat: ChatInterface): Promise<void>;
    /**
     * @param chat Sala de bate-papo
     * @returns Retorna o nome da sala de bate-papo
     */
    getChatName(chat: ChatInterface): Promise<string>;
    /**
     * @param chat Sala de bate-papo
     * @param name Nome da sala de bate-papo
     */
    setChatName(chat: ChatInterface, name: string): Promise<void>;
    /**
     * @param chat Sala de bate-papo
     * @returns Retorna a descrição da sala de bate-papo
     */
    getChatDescription(chat: ChatInterface): Promise<string>;
    /**
     * @param chat Sala de bate-papo
     * @param description Descrição da sala de bate-papo
     */
    setChatDescription(chat: ChatInterface, description: string): Promise<void>;
    /**
     * @param chat Sala de bate-papo
     * @returns Retorna a imagem de perfil da sala de bate-papo
     */
    getChatProfile(chat: ChatInterface): Promise<Buffer>;
    /**
     * @param chat Sala de bate-papo
     * @param profile Imagem de perfil da sala de bate-papo
     */
    setChatProfile(chat: ChatInterface, profile: Buffer): Promise<void>;
    /**
     * @param chat Sala de bate-papo
     * @returns Retorna os administradores de uma sala de bate-papo
     */
    getChatAdmins(chat: ChatInterface): Promise<Users>;
    /**
     * @param chat Sala de bate-papo
     * @returns Retorna o lider da sala de bate-papo
     */
    getChatLeader(chat: ChatInterface): Promise<UserInterface>;
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
     * * Adiciona um novo usuário
     * @param user Usuário
     */
    addUser(user: UserInterface): Promise<void>;
    /**
     * * Remove um usuário
     * @param user Usuário
     */
    removeUser(user: UserInterface): Promise<void>;
    /**
     * @param user Usuário
     * @returns Retorna um usuário
     */
    getUser(user: UserInterface): Promise<UserInterface | null>;
    /**
     * * Define um usuário
     * @param user Usuário
     */
    setUser(user: UserInterface): Promise<void>;
    /**
     * @param user Usuário
     * @returns Retorna o nome do usuário
     */
    getUserName(user: UserInterface): Promise<string>;
    /**
     * @param user Usuário
     * @param name Nome do usuário
     */
    setUserName(user: UserInterface, name: string): Promise<void>;
    /**
     * @param user Usuário
     * @returns Retorna a descrição do usuário
     */
    getUserDescription(user: UserInterface): Promise<string>;
    /**
     * @param user Usuário
     * @param description Descrição do usuário
     */
    setUserDescription(user: UserInterface, description: string): Promise<void>;
    /**
     * @param user Usuário
     * @returns Retorna a foto de perfil do usuário
     */
    getUserProfile(user: UserInterface): Promise<Buffer>;
    /**
     * @param user Usuário
     * @param profile Imagem de perfil do usuário
     */
    setUserProfile(user: UserInterface, profile: Buffer): Promise<void>;
    /**
     * * Desbloqueia um usuário
     * @param user Usuário
     */
    unblockUser(user: UserInterface): Promise<void>;
    /**
     * * Bloqueia um usuário
     * @param user Usuário
     */
    blockUser(user: UserInterface): Promise<void>;
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
     * * Sala de bate-papo
     * @param id Sala de bate-papo
     */
    Chat(id: ChatInterface): ChatInterface;
    /**
     * * Usuário
     * @param user Usuário
     */
    User(id: UserInterface): UserInterface;
    /**
     * * Comando
     */
    Command(): Command;
    /**
     * * Adiciona uma reação na mensagem
     * @param message Mensagem que será reagida
     * @param reaction Reação
     */
    addReaction(message: MessageInterface, reaction: string): Promise<void>;
    /**
     * * Remove a reação da mensagem
     * @param Mensagem que terá sua reação removida
     */
    removeReaction(message: MessageInterface): Promise<void>;
    /**
     * * Mensagem
     * @param chat Sala de bate-papo
     * @param text Texto da mensagem
     */
    Message(chat: ChatInterface, text: string): MessageInterface;
    /**
     * * Mensagem contendo uma mídia
     * @param chat Sala de bate-papo
     * @param text Texto da mensagem
     */
    MediaMessage(chat: ChatInterface, text: string, file: any): MediaMessageInterface;
    /**
     * * Mensagem com imagem
     * @param chat Sala de bate-papo
     * @param text Texto da mensagem
     * @param image Imagem
     */
    ImageMessage(chat: ChatInterface, text: string, image: Buffer): ImageMessageInterface;
    /**
     * * Mensagem com vídeo
     * @param chat Sala de bate-papo
     * @param text Texto da mensagem
     * @param video Video
     */
    VideoMessage(chat: ChatInterface, text: string, video: Buffer): VideoMessageInterface;
    /**
     * * Mensagem com contatos
     * @param chat Sala de bate-papo
     * @param text Texto da mensagem
     * @param contact Contato
     */
    ContactMessage(chat: ChatInterface, text: string, contact: string | string[]): ContactMessageInterface;
    /**
     * * Mensagem com localização
     * @param chat Sala de bate-papo
     * @param longitude Longitude
     * @param latitude Latitude
     */
    LocationMessage(chat: ChatInterface, latitude: number, longitude: number): LocationMessageInterface;
    /**
     * * Mensagem com lista
     * @param chat Sala de bate-papo
     * @param text Texto da mensagem
     */
    ListMessage(chat: ChatInterface, text: string, button: string): ListMessageInterface;
    /**
     * * Mensagem com botões
     * @param chat Sala de bate-papo
     * @param text Texto da mensagem
     */
    ButtonMessage(chat: ChatInterface, text: string): ButtonMessageInterface;
}
