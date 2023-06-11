"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CMDKeyExact = exports.CMDKey = exports.CommandKeyExact = exports.CommandKey = void 0;
const Command_1 = require("../../enums/Command");
/** Chave do comando */
class CommandKey {
    constructor(...values) {
        this.type = Command_1.CMDKeyType.Sample;
        this.values = [];
        this.values = values;
    }
    /**
     * Procura pela chave em um texto
     * @return retorna se a chave foi encontrada
     */
    static search(text, ...keys) {
        const result = keys.filter((key) => {
            if (key.type === Command_1.CMDKeyType.Exact) {
                return CommandKey.verifyExact(text, key.values);
            }
            return CommandKey.verify(text, key.values);
        });
        if (result.length > 0) {
            let key = result[0];
            for (const res of result) {
                if (res.values.join("").length < key.values.join("").length)
                    continue;
                key = res;
            }
            return key;
        }
        return null;
    }
    /** Verifica se o texto contem as chaves */
    static verify(text, keys) {
        for (const key of keys) {
            if (text.includes(key))
                continue;
            return false;
        }
        return true;
    }
    /** Verifica se o texto tem as chaves exatas */
    static verifyExact(text, keys) {
        let totalKey = "";
        const result = keys.filter((key) => {
            totalKey += key;
            if (text.indexOf(totalKey) != 0)
                return false;
            const totalSplited = totalKey.split(/\s+/);
            const textSplited = text.split(/\s+/);
            for (const index in totalSplited) {
                if (totalSplited[index] == textSplited[index])
                    continue;
                return false;
            }
            return true;
        });
        return result.length > 0;
    }
}
exports.CommandKey = CommandKey;
/** Chave do comando exata */
class CommandKeyExact extends CommandKey {
    constructor() {
        super(...arguments);
        this.type = Command_1.CMDKeyType.Exact;
    }
}
exports.CommandKeyExact = CommandKeyExact;
/** Chave do comando */
function CMDKey(...values) {
    return new CommandKey(...values);
}
exports.CMDKey = CMDKey;
/** Chave exata do comando */
function CMDKeyExact(...values) {
    return new CommandKeyExact(...values);
}
exports.CMDKeyExact = CMDKeyExact;
//# sourceMappingURL=CommandKey.js.map