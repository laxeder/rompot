/** Interface do configurador do controlador de comandos */
export default interface ICommandControllerConfig {
    /** Prefixo necessário para procurar um comando */
    prefix: string;
    /** Procurar sem destinção de tamanho */
    lowerCase: boolean;
}
