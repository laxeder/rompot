"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getError = void 0;
/**
 * @param err
 * @returns Retorna um erro
 */
function getError(err) {
    if (!(err instanceof Error)) {
        err = new Error(`${err}`);
    }
    return err;
}
exports.getError = getError;
//# sourceMappingURL=error.js.map