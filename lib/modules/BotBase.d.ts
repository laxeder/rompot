import CommandInterface from "../interfaces/CommandInterface";
import BotInterface from "../interfaces/BotInterface";
import BotModule from "./BotModule";
export default class BotBase extends BotModule<BotInterface, CommandInterface> {
    constructor();
}
