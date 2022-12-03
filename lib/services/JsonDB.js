"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.JsonDB = void 0;
const fs = __importStar(require("fs"));
class JsonDB {
    constructor(dir) {
        this._data = JSON.parse(fs.readFileSync(dir, "utf8")) || {};
        this._dir = dir;
    }
    save() {
        fs.writeFileSync(this._dir, JSON.stringify(this._data));
        return true;
    }
    update(path, data, options) {
        return __awaiter(this, void 0, void 0, function* () {
            this._data = this.push(path, data, this._data, true);
            return this.save();
        });
    }
    set(path, data, options) {
        return __awaiter(this, void 0, void 0, function* () {
            this._data = this.push(path, data, this._data, false);
            return this.save();
        });
    }
    get(path, options) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.getPath(path, this._data);
        });
    }
    delete(path, options) {
        return __awaiter(this, void 0, void 0, function* () {
            this._data = this.push(path, null, this._data, false);
            return this.save();
        });
    }
    getPath(path, data) {
        const splitedPath = path.split("/");
        if (!!!splitedPath[1])
            return data;
        for (let i = 1; i + 1 <= splitedPath.length; i++) {
            if (!data.hasOwnProperty(splitedPath[i])) {
                data = null;
                break;
            }
            data = data[splitedPath[i]];
        }
        return data || null;
    }
    push(path, data, dbData, update = false) {
        const splitedPath = path.split("/");
        const atualPath = splitedPath[1];
        if (!dbData.hasOwnProperty(atualPath))
            dbData[atualPath] = {};
        if (!!!splitedPath[2]) {
            if (!update) {
                dbData[atualPath] = data;
            }
            else {
                if (typeof data == "object" && !Array.isArray(data)) {
                    if (typeof dbData[atualPath] != "object" || Array.isArray(dbData[atualPath])) {
                        dbData[atualPath] = {};
                    }
                    dbData[atualPath] = Object.assign(Object.assign({}, dbData[atualPath]), data);
                }
                else {
                    dbData[atualPath] = data;
                }
            }
            return dbData;
        }
        if (typeof dbData[atualPath] !== "object" || Array.isArray(dbData[atualPath]))
            dbData[atualPath] = {};
        dbData[atualPath] = this.push(path.replace(`/${atualPath}`, ""), data, dbData[atualPath], update);
        return dbData;
    }
}
exports.JsonDB = JsonDB;
//# sourceMappingURL=JsonDB.js.map