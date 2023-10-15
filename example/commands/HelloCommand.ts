import Client, { CMDKey, Command, Message, sleep } from "../../src";

export class HelloCommand extends Command {
  public onRead() {
    this.keys = [CMDKey("hello")];
  }

  public async onExec(message: Message) {
    const client = Client.getClient(this.botId);

    const msg = await client.sendMessage(message.chat, `Hello...`, message);

    await sleep(3000);

    await client.editMessage(msg, "Hello World!");
  }
}
