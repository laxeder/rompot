import Client, { Command, CMDKeyExact, Message, ListMessage } from "../../src";

export class StickerCommand extends Command {
  public onRead() {
    this.keys = [CMDKeyExact("sendList")];
  }

  public async onExec(message: Message) {
    const listMsg = new ListMessage(message.chat, "Texto da lista", "Botão da lista", "Rodapé da lista", "Titulo da lista");

    for (let c = 0; c < 5; c++) {
      const catgeory = listMsg.addCategory(`Categoria ${c + 1}`);

      for (let i = 0; i < 5; i++) {
        listMsg.addItem(catgeory, `Item ${i + 1}`, "Descrição");
      }
    }

    await Client.getClient(this.botId).send(listMsg);
  }
}
