"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Chat = void 0;
class Chat {
    constructor(id, name, isOld) {
        this.id = id;
        if (name)
            this.name = name;
        if (isOld)
            this.isOld = isOld;
    }
    /**
     * * Define o ID da sala de bate-papo
     * @param id
     */
    setId(id) {
        this.id = id;
    }
    /**
     * * Define o nome da sala de bate-papo
     * @param name
     */
    setName(name) {
        this.name = name;
    }
    /**
     * * Define se é uma nova sala de bate-papo
     * @param isOld
     */
    setIsOld(isOld) {
        this.isOld = isOld;
    }
    /**
     * * Retorna o ID da sala de bate-papo
     * @returns
     */
    getId() {
        return this.id;
    }
    /**
     * * Retorna o nome da sala de bate-papo
     * @returns
     */
    getName() {
        return this.name;
    }
    /**
     * * Retorna se é uma nova sala de bate-papo
     * @returns
     */
    getIsOld() {
        return this.isOld || false;
    }
}
exports.Chat = Chat;
//# sourceMappingURL=Chat.js.map