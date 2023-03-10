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
exports.getError = exports.getImageURL = exports.sleep = void 0;
const stream_1 = require("stream");
const https_1 = __importDefault(require("https"));
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
//# sourceMappingURL=Generic.js.map