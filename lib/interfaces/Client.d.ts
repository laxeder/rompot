/// <reference types="node" />
import { IMessage } from "@interfaces/Messages";
import ICommand from "@interfaces/ICommand";
import { IUser } from "@interfaces/User";
import { IChat } from "@interfaces/Chat";
import Auth from "@interfaces/Auth";
import Message from "@messages/Message";
import User from "@modules/User";
import Chat from "@modules/Chat";
import { ClientEvents } from "@utils/Emmiter";
import { Chats, ChatStatus, IChats } from "../types/Chat";
import { IUsers, Users } from "../types/User";
export interface IClient extends ClientEvents {
    /** * Comandos do cliente */
    commands: ICommand[];
    /** * Configura os eventos do cliente */
    configEvents(): void;
    /**
     * * Define os comandos do bot
     * @param commands Comandos que será injetado
     */
    setCommands(commands: ICommand[]): void;
    /**
     * @returns Retorna os comandos do bot
     */
    getCommands(): ICommand[];
    /**
     * * Adiciona um comando na lista de comandos
     * @param command Comando que será definido
     */
    addCommand(command: ICommand): void;
    /**
     * @param command Comando que será procurado
     * @returns Retorna um comando do bot
     */
    getCommand(command: string): ICommand | null;
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
     * @returns
     */
    awaitMessage(chat: IChat | string, ignoreMessageFromMe: boolean, stopRead: boolean, ...ignoreMessages: IMessage[]): Promise<Message>;
    /**
     * * Automotiza uma mensagem
     * @param message
     * @param timeout
     * @param chats
     * @param id
     * @returns
     */
    addAutomate(message: IMessage, timeout: number, chats?: {
        [key: string]: IChat;
    }, id?: string): Promise<any>;
    /**
     * * Remover mensagem
     * @param message Mensagem que será removida da sala de bate-papo
     */
    removeMessage(message: IMessage): Promise<void>;
    /**
     * * Deletar mensagem
     * @param message Mensagem que será deletada da sala de bate-papos
     */
    deleteMessage(message: IMessage): Promise<void>;
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
    addChat(chat: IChat | string): Promise<void>;
    /**
     * * Remove uma sala de bate-papo
     * @param chat Sala de bate-papo
     */
    removeChat(chat: IChat | string): Promise<void>;
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
    demoteUserInChat(chat: IChat | string, user: IUser | string): Promise<void>;
    /**
     * * Altera o status da sala de bate-papo
     * @param chat Sala de bate-papo
     * @param status Status da sala de bate-papo
     */
    changeChatStatus(chat: IChat | string, status: ChatStatus): Promise<void>;
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
     * @returns Retorna uma sala de bate-papo
     */
    getChat(chat: IChat | string): Promise<Chat | null>;
    /**
     * * Define uma sala de bate-papo
     * @param chat Sala de bate-papo
     */
    setChat(chat: IChat): Promise<void>;
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
     * @param chat Sala de bate-papo
     * @returns Retorna os administradores de uma sala de bate-papo
     */
    getChatAdmins(chat: IChat | string): Promise<Users>;
    /**
     * @param chat Sala de bate-papo
     * @returns Retorna o lider da sala de bate-papo
     */
    getChatLeader(chat: IChat | string): Promise<User>;
    /**
     * @returns Retorna as sala de bate-papo que o bot está
     */
    getChats(): Promise<Chats>;
    /**
     * * Define as salas de bate-papo que o bot está
     * @param chats Salas de bate-papo
     */
    setChats(chats: IChats): Promise<void>;
    /**
     * * Adiciona um novo usuário
     * @param user Usuário
     */
    addUser(user: IUser | string): Promise<void>;
    /**
     * * Remove um usuário
     * @param user Usuário
     */
    removeUser(user: IUser | string): Promise<void>;
    /**
     * @param user Usuário
     * @returns Retorna um usuário
     */
    getUser(user: IUser | string): Promise<User | null>;
    /**
     * * Define um usuário
     * @param user Usuário
     */
    setUser(user: IUser | string): Promise<void>;
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
     * @returns Retorna a lista de usuários do bot
     */
    getUsers(): Promise<Users>;
    /**
     * * Define a lista de usuários do bot
     * @param users Usuários
     */
    setUsers(users: IUsers): Promise<void>;
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
}
