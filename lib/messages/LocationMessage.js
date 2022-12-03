"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocationMessage = void 0;
const Message_1 = require("./Message");
class LocationMessage extends Message_1.Message {
    constructor(chat, latitude, longitude, mention, id) {
        super(chat, "", mention, id);
        this.latitude = latitude;
        this.longitude = longitude;
    }
    /**
     * * Define a latitude e longitude da localização
     * @param latitude
     * @param longitude
     */
    setLocation(latitude, longitude) {
        this.latitude = latitude;
        this.longitude = longitude;
    }
    /**
     * * Define a latitude
     * @param longitude
     */
    setLongitude(longitude) {
        this.longitude = longitude;
    }
    /**
     * * Define a longitude
     * @param latitude
     */
    setLatitude(latitude) {
        this.latitude = latitude;
    }
    /**
     * * Retorna a longitude
     * @returns
     */
    getLongitude() {
        return this.longitude;
    }
    /**
     * * retorna a latitude
     * @returns
     */
    getLatitude() {
        return this.latitude;
    }
}
exports.LocationMessage = LocationMessage;
//# sourceMappingURL=LocationMessage.js.map