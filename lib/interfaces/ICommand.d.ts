import Message from "../messages/Message";
import { ClientType } from "../modules/Client";
export default interface ICommand {
    /** * Cliente do modulo */
    get client(): ClientType;
    set client(client: ClientType);
    /**
     * * Tags do comando
     */
    tags: string[];
    /**
     * * prefixo do comando
     */
    prefix: string;
    /**
     * * Nome do comando
     */
    name: string;
    /**
     * * Descrição do comando
     */
    description: string;
    /**
     * * Categorias do comando
     */
    categories: string[];
    /**
     * * Permissões do comando
     */
    permissions: string[];
    /**
     * * Método chamado quando a função é executada
     * @param message Mensagem recebida
     */
    execute(message: Message): Promise<void>;
    /**
     * * Método chamado quando é respondido uma mensagem do comando
     * @param message
     */
    response(message: Message): Promise<void>;
    /**
     * * Método chamado quando é solicitado a ajuda do comando
     * @param message
     */
    help(message: Message): Promise<void>;
}
