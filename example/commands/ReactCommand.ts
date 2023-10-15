import { CMDKeyExact, Command, Message } from "../../src";

export class ReactCommand extends Command {
  public onRead() {
    this.keys = [CMDKeyExact("react")];
  }

  public async onExec(message: Message) {
    message.addAnimatedReaction(["❤️", "⏳"]);
  }
}
