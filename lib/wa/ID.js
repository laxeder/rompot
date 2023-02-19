"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getID = exports.replaceID = void 0;
function replaceID(id) {
    id = String(`${id}`).replace(/:(.*)@/, "@");
    if (id.includes("@s"))
        id = id.split("@")[0];
    return id.trim();
}
exports.replaceID = replaceID;
function getID(id) {
    id = String(`${id}`);
    if (!id.includes("@"))
        id = `${id}@s.whatsapp.net`;
    return id.trim();
}
exports.getID = getID;
//# sourceMappingURL=ID.js.map