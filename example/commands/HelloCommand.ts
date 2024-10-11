import Client, { CMDKey, Command, Message, sleep } from "../../src";

export class HelloCommand extends Command {
  public onRead() {
    this.keys = [CMDKey("hello")];
  }

  public async onExec(message: Message) {
    if (message.fromMe) return;

    const client = Client.getClient(this.clientId);

    const msg = await client.sendMessage(message.chat, `Hello...`, message);

    await sleep(3000);

    await client.editMessage(msg, "Hello World!");
  }
}
