/// <reference types="node" />
import ChatInterface from "./ChatInterface";
import { BotModule } from "../types/Bot";
export default interface UserInterface {
    /**
     * * ID do usuário
     */
    id: string;
    /**
     * * Nome do usuário
     */
    name: string;
    /**
     * * Descrição do usuário
     */
    description: string;
    /**
     * * Foto de perfil do usuário
     */
    profile: Buffer;
    /**
     * * Bot que irá executar os métodos
     */
    bot: BotModule;
    /**
     * * Bloqueia o usuário
     */
    blockUser(): Promise<void>;
    /**
     * * Desbloqueia o usuário
     */
    unblockUser(): Promise<void>;
    /**
     * @returns Retorna o nome do usuário
     */
    getName(): Promise<string>;
    /**
     * * Define o nome do usuário
     * @param name Nome do usuáro
     */
    setName(name: string): Promise<void>;
    /**
     * @returns Retorna a descrição do usuário
     */
    getDescription(): Promise<string>;
    /**
     * * Define a descrição do usuário
     * @param description Descrição do usuário
     */
    setDescription(description: string): Promise<void>;
    /**
     * @returns Retorna a imagem de perfil do usuário
     */
    getProfile(): Promise<Buffer>;
    /**
     * * Define a foto de perfil do usuário
     * @param image Foto de perfil do usuário
     */
    setProfile(image: Buffer): Promise<void>;
    /**
     * @param chat Sala de bate-papo que está o usuário
     * @returns Retorna se o usuário é administrador daquela sala de bate-papo
     */
    IsAdmin(chat: ChatInterface | string): Promise<boolean>;
    /**
     * @param chat Sala de bate-papo que está o usuário
     * @returns Retorna se o usuário é lider daquela sala de bate-papo
     */
    IsLeader(chat: ChatInterface | string): Promise<boolean>;
}
