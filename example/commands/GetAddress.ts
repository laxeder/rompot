import { Command, CMDKey, Message, LocationMessage } from "../../src";

export class GetAddressommand extends Command {
  public onRead() {
    this.keys = [CMDKey("location")];
  }

  public async onExec(message: Message) {
    try {
      const locationMessage = message.mention;

      if (!LocationMessage.isValid(locationMessage)) {
        await message.reply("Mencione uma localização para obter os dados dela");
        return;
      }

      const address = await locationMessage.getAddress();

      await message.reply(JSON.stringify(address, undefined, 2));
    } catch (error) {
      console.error(`Get address error: ${error.message}\n${error.stack}`);
    }
  }
}
