import ICommand from "@interfaces/ICommand";
import IBot from "@interfaces/IBot";
import BotModule from "@modules/BotModule";
export default class BotBase extends BotModule<IBot, ICommand> {
    constructor();
}
