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
exports.getBaileysAuth = exports.MultiFileAuthState = void 0;
const baileys_1 = require("baileys");
const promises_1 = require("fs/promises");
const fs_1 = require("fs");
const path_1 = require("path");
class MultiFileAuthState {
    constructor(folder, autoCreateDir = true) {
        this.fixFileName = (file) => { var _a; return (_a = file === null || file === void 0 ? void 0 : file.replace(/\//g, "__")) === null || _a === void 0 ? void 0 : _a.replace(/:/g, "-"); };
        this.folder = folder;
        const folderInfo = this.getStat(folder);
        if (folderInfo) {
            if (!folderInfo.isDirectory()) {
                throw new Error(`found something that is not a directory at ${folder}, either delete it or specify a different location`);
            }
        }
        else {
            if (autoCreateDir)
                (0, fs_1.mkdirSync)(folder, { recursive: true });
        }
    }
    getStat(folder) {
        try {
            return (0, fs_1.statSync)(folder);
        }
        catch (err) {
            return null;
        }
    }
    get(file) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const data = yield (0, promises_1.readFile)((0, path_1.join)(this.folder, this.fixFileName(`${file}.json`)), { encoding: "utf-8" });
                return JSON.parse(data, baileys_1.BufferJSON.reviver);
            }
            catch (error) {
                return null;
            }
        });
    }
    set(file, data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!!!data) {
                    yield (0, promises_1.unlink)((0, path_1.join)(this.folder, this.fixFileName(`${file}.json`)));
                }
                else {
                    yield (0, promises_1.writeFile)((0, path_1.join)(this.folder, this.fixFileName(`${file}.json`)), JSON.stringify(data, baileys_1.BufferJSON.replacer));
                }
            }
            catch (_a) { }
        });
    }
    remove(file) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield (0, promises_1.unlink)((0, path_1.join)(this.folder, this.fixFileName(`${file}.json`)));
            }
            catch (_a) { }
        });
    }
    listAll(file) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return (0, fs_1.readdirSync)(!!file ? (0, path_1.join)(this.folder, file) : this.folder);
            }
            catch (err) {
                return [];
            }
        });
    }
}
exports.MultiFileAuthState = MultiFileAuthState;
const getBaileysAuth = (auth) => __awaiter(void 0, void 0, void 0, function* () {
    const replacer = (data) => {
        try {
            const json = JSON.parse(JSON.stringify(data, baileys_1.BufferJSON.replacer), baileys_1.BufferJSON.reviver);
            return json;
        }
        catch (err) {
            return data;
        }
    };
    const creds = replacer(yield auth.get("creds")) || (0, baileys_1.initAuthCreds)();
    return {
        state: {
            creds,
            keys: {
                get(type, ids) {
                    return __awaiter(this, void 0, void 0, function* () {
                        const data = {};
                        yield Promise.all(ids.map((id) => __awaiter(this, void 0, void 0, function* () {
                            let value = yield replacer(yield auth.get(`${type}-${id}`));
                            if (type === "app-state-sync-key" && value) {
                                value = baileys_1.proto.Message.AppStateSyncKeyData.fromObject(value);
                            }
                            data[id] = value;
                        })));
                        return data;
                    });
                },
                set(data) {
                    return __awaiter(this, void 0, void 0, function* () {
                        const tasks = [];
                        for (const category in data) {
                            for (const id in data[category]) {
                                const value = data[category][id];
                                if (!!!value) {
                                    tasks.push(auth.remove(`${category}-${id}`));
                                }
                                else {
                                    tasks.push(auth.set(`${category}-${id}`, value));
                                }
                            }
                        }
                        yield Promise.all(tasks);
                    });
                },
            },
        },
        saveCreds: () => __awaiter(void 0, void 0, void 0, function* () {
            return yield auth.set("creds", creds);
        }),
    };
});
exports.getBaileysAuth = getBaileysAuth;
//# sourceMappingURL=Auth.js.map