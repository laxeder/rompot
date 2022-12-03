"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handle = void 0;
/**
 * * Retorna o erro ou resultado de uma Promise
 * @param {*} promise
 * @returns
 */
function handle(promise) {
    return new Promise((resolve, reject) => {
        promise
            .then((data) => {
            resolve([null, data]);
        })
            .catch((err) => {
            resolve([err, null]);
        });
    });
}
exports.handle = handle;
;
//# sourceMappingURL=handle.js.map