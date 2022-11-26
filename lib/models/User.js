"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
class User {
    constructor(id, name) {
        this.id = id;
        if (name)
            this.name = name;
    }
    /**
     * * Define o ID do usuário
     * @param id
     */
    setId(id) {
        this.id = id;
    }
    /**
     * * Define o nome do usuário
     * @param name
     */
    setName(name) {
        this.name = name;
    }
    /**
     * * Retorna o ID do usuário
     * @returns
     */
    getId() {
        return this.id;
    }
    /**
     * * Retorna o nome do usuário
     * @returns
     */
    getName() {
        return this.name;
    }
    /**
     * * verifica se o usuário tem permissão
     * @param userPermissions
     * @param commandPermissions
     * @param ignore
     * @returns
     */
    checkPermissions(userPermissions, commandPermissions, ignore = []) {
        if (commandPermissions.length <= 0)
            return true;
        commandPermissions = commandPermissions.filter((p) => {
            if (ignore.includes(p))
                return true;
            return userPermissions.indexOf(p) > -1;
        });
        return commandPermissions.length <= 0;
    }
}
exports.User = User;
//# sourceMappingURL=User.js.map