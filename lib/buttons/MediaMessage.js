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
exports.MediaMessage = void 0;
const Message_1 = require("./Message");
class MediaMessage extends Message_1.Message {
    constructor(chat, text, mention, id) {
        super(chat, text, mention, id);
        this.isGIF = false;
    }
    /**
     * * Define o meio de leitura da midia da mensagem
     * @param fnStream
     */
    setSream(fnStream) {
        this._getStream = fnStream;
    }
    /**
     * * Obtem a midia da mensagem
     * @param stream
     * @returns
     */
    getStream(stream) {
        return __awaiter(this, void 0, void 0, function* () {
            if (stream instanceof Buffer)
                return stream;
            if (this._getStream)
                return yield this._getStream(stream);
            return Buffer.from("");
        });
    }
    /**
     * * Define a imagem da mensagem
     * @param image
     */
    setImage(image) {
        this._image = image;
    }
    /**
     * * Obtem a imagem da mensagem
     * @returns
     */
    getImage() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!!!this._image)
                return undefined;
            return yield this.getStream(this._image);
        });
    }
    /**
     * * Define o video da mensagem
     * @param video
     */
    setVideo(video) {
        this._video = video;
    }
    /**
     * * Obtem o video da mensagem
     * @returns
     */
    getVideo() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!!!this._video)
                return undefined;
            return yield this.getStream(this._video);
        });
    }
    /**
     * * Define o audio da mensagem
     * @param audio
     */
    setAudio(audio) {
        this._audio = audio;
    }
    /**
     * * Obtem o audio da mensagem
     * @returns
     */
    getAudio() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!!!this._audio)
                return undefined;
            return yield this.getStream(this._audio);
        });
    }
    /**
     * * Define se a imagem é um GIF
     * @param gif
     */
    setIsGIF(gif) {
        this.isGIF = gif;
    }
    /**
     * * Retorna se a imagem é um GIF
     * @returns
     */
    getIsGIF() {
        return this.isGIF;
    }
}
exports.MediaMessage = MediaMessage;
//# sourceMappingURL=MediaMessage.js.map