import { CMDKeyExact, Command, IMessage } from "../../src";

export class ReactCommand extends Command {
  public onRead() {
    this.keys = [CMDKeyExact("react")];
  }

  public async onExec(message: IMessage) {
    message.addAnimatedReaction(["❤️", "⏳"]);
  }
}
