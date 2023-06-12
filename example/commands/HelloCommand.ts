import { CMDKey, Command, IMessage, sleep } from "../../src";

export class HelloCommand extends Command {
  public onRead() {
    this.keys = [CMDKey("hello")];
  }

  public async onExec(message: IMessage) {
    const msg = await message.reply(`Hello...`);

    await sleep(3000);

    await this.client.editMessage(msg, "Hello World!");
  }
}
