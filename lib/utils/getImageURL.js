"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const stream_1 = require("stream");
const https_1 = __importDefault(require("https"));
exports.default = (uri) => {
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
            rej(e);
        }
    });
};
//# sourceMappingURL=getImageURL.js.map