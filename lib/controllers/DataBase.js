"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataBase = void 0;
const handle_1 = require("../utils/handle");
class DataBase {
    constructor(DB) {
        this._db = DB;
    }
    /**
     * * Atualiza o valor de um caminho do banco de dados
     * @param path
     * @param data
     * @param options
     * @returns
     */
    update(path, data, options) {
        return __awaiter(this, void 0, void 0, function* () {
            return (0, handle_1.handle)(this._db.update(path, data, options));
        });
    }
    /**
     * * Define o valor de um caminho do banco de dados
     * @param path
     * @param data
     * @param options
     * @returns
     */
    set(path, data, options) {
        return __awaiter(this, void 0, void 0, function* () {
            return (0, handle_1.handle)(this._db.set(path, data, options));
        });
    }
    /**
     * * Deleta o valor de um caminho do banco de dados
     * @param path
     * @param options
     * @returns
     */
    delete(path, options) {
        return __awaiter(this, void 0, void 0, function* () {
            return (0, handle_1.handle)(this._db.delete(path, options));
        });
    }
    /**
     * * Retorna o valor de um camino do banco de dados
     * @param path
     * @param options
     * @returns
     */
    get(path, options) {
        return __awaiter(this, void 0, void 0, function* () {
            return (0, handle_1.handle)(this._db.get(path, options));
        });
    }
}
exports.DataBase = DataBase;
//# sourceMappingURL=DataBase.js.map