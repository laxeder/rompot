import { IUser, IClient } from "rompot-base";
export default class UserUtils {
    /**
     * @param user Usuário que será obtido
     * @returns Retorna o usuário
     */
    static get<USER extends IUser>(user: USER | string): USER | IUser;
    /**
     * @param user Usuário
     * @returns Retorna o ID do usuário
     */
    static getId(user: IUser | string): string;
    /**
     * * Cria um usuário com cliente instanciado
     * @param client Cliente
     * @param user Usuário
     * @returns
     */
    static applyClient<USER extends IUser>(client: IClient, user: USER | string): USER | IUser;
}
