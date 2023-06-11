import { CMDKey, CMDKeyExact, Command, IMessage } from "../../src";

export class HelloCommand extends Command {
  public onRead() {
    this.keys = [CMDKey("hello")];
  }

  public async onExec(message: IMessage) {
    await message.reply(`Hello World!`);
  }
}
