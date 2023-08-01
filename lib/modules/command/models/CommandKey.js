"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const rompot_base_1 = require("rompot-base");
class CommandKey {
    constructor(...values) {
        this.type = rompot_base_1.CMDKeyType.Sample;
        this.values = [];
        this.values = values;
    }
    /**
     * Procura pela chave em um texto
     * @return retorna se a chave foi encontrada
     */
    static search(text, config, ...keys) {
        if (!!config.prefix) {
            if (!text.startsWith(config.prefix))
                return null;
            text = text.replace(config.prefix, "").trim();
        }
        if (!!config.lowerCase) {
            text = text.toLowerCase();
            keys = keys.map((key) => {
                key.values = key.values.map((value) => value.toLowerCase());
                return key;
            });
        }
        const result = keys.filter((key) => {
            if (key.type === rompot_base_1.CMDKeyType.Exact) {
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
        let result = `${text}`;
        for (const key of keys) {
            if (!result.startsWith(key))
                return false;
            result = result.replace(key, "").trim();
        }
        return true;
    }
}
exports.default = CommandKey;
//# sourceMappingURL=CommandKey.js.map