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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.readRecursiveDir = exports.getRompotVersion = exports.ApplyClient = exports.injectJSON = exports.replaceCommandTag = exports.getError = exports.getImageURL = exports.sleep = void 0;
const fs_1 = require("fs");
const path_1 = require("path");
const stream_1 = require("stream");
const https_1 = __importDefault(require("https"));
const Defaults_1 = require("../config/Defaults");
/**
 * * Aguarda um determinado tempo
 * @param timeout
 * @returns
 */
function sleep(timeout = 1000) {
    return __awaiter(this, void 0, void 0, function* () {
        const result = timeout - 2147483647;
        if (result > 0) {
            yield new Promise((res) => setTimeout(res, 2147483647));
            yield sleep(result);
        }
        else {
            yield new Promise((res) => setTimeout(res, timeout));
        }
    });
}
exports.sleep = sleep;
/**
 * * Obtem a imagem de uma url
 * @param uri URL
 * @returns
 */
function getImageURL(uri) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!!!uri)
            return Buffer.from("");
        return new Promise((res, rej) => {
            try {
                https_1.default
                    .request(uri, (response) => {
                    var data = new stream_1.Transform();
                    response.on("data", (chunk) => data.push(chunk));
                    response.on("end", () => res(data.read()));
                })
                    .end();
            }
            catch (e) {
                res(Buffer.from(""));
            }
        });
    });
}
exports.getImageURL = getImageURL;
/**
 * @param err Erro
 * @returns Retorna um erro
 */
function getError(err) {
    if (!(err instanceof Error)) {
        err = new Error(`${err}`);
    }
    return err;
}
exports.getError = getError;
/**
 * * Remove a Tag do texto
 * @param tag Tag do comando
 * @param text Texto do comando
 * @returns Texto sem a tag
 */
function replaceCommandTag(tag, text) {
    const indexOfTag = text.toLowerCase().indexOf(tag.toLowerCase());
    if (indexOfTag == -1)
        return text;
    return String(`${text}`)
        .slice(indexOfTag + tag.length)
        .trim();
}
exports.replaceCommandTag = replaceCommandTag;
/**
 * * Injeta valores de um objeto em outro
 * @param object Objeto com novos valores
 * @param injectableObject Objeto que receberá os novos valores
 * @returns Retorna o objeto com os novos valores
 */
function injectJSON(objectIn, objectOut) {
    Object.keys(objectIn).forEach((keyIn) => {
        const keyOut = keyIn;
        if (!objectOut.hasOwnProperty(keyOut))
            return;
        if (typeof objectOut[keyOut] == "undefined") {
            objectOut[keyOut] = objectIn[keyIn];
        }
        if (typeof objectOut[keyOut] != typeof objectIn[keyIn]) {
            if (typeof objectOut[keyOut] == "string" && typeof objectIn[keyIn] == "number") {
                objectIn[keyIn] = String(objectIn[keyIn]);
            }
            else if (typeof objectOut[keyOut] == "number" && typeof objectIn[keyIn] == "string") {
                objectIn[keyIn] = Number(objectIn[keyIn]);
            }
            else
                return;
        }
        if (!!objectIn[keyIn] && !!objectOut[keyOut] && typeof objectIn[keyIn] == "object" && typeof objectOut[keyOut] == "object") {
            if (Array.isArray(objectOut[keyOut])) {
                if (objectIn[keyIn].length == 0)
                    return;
            }
            else {
                injectJSON(objectIn[keyIn], objectOut[keyOut]);
            }
        }
    });
    return objectOut;
}
exports.injectJSON = injectJSON;
/**
 * * Adiciona um cliente ao objeto
 * @param obj Objeto
 * @param client Cliente
 * @returns Objeto com Cliente adicionado
 */
function ApplyClient(obj, client) {
    obj["client"] = client;
    return obj;
}
exports.ApplyClient = ApplyClient;
/** Retorna a versão do Rompot */
function getRompotVersion() {
    return Defaults_1.ROMPOT_VERSION;
}
exports.getRompotVersion = getRompotVersion;
/** Lê um diretório recursivamente */
function readRecursiveDir(dir, callback) {
    return __awaiter(this, void 0, void 0, function* () {
        const files = [];
        const rtn = [];
        try {
            yield Promise.all((0, fs_1.readdirSync)(dir).map((filename) => __awaiter(this, void 0, void 0, function* () {
                const filepath = (0, path_1.resolve)(dir, filename);
                const stat = (0, fs_1.statSync)(filepath);
                const isFile = stat.isFile();
                if (!isFile) {
                    files.push(...(yield readRecursiveDir(filepath, callback)));
                    return;
                }
                rtn.push(yield callback(filepath, filename, (0, path_1.parse)(filename).ext));
            })));
        }
        catch (err) { }
        return rtn;
    });
}
exports.readRecursiveDir = readRecursiveDir;
//# sourceMappingURL=Generic.js.map