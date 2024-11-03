import Client, { Command, CMDKeyExact, Message, ListMessage } from '../../src';

export class ListMessageCommand extends Command {
  public onRead() {
    this.keys = [CMDKeyExact('sendList')];
  }

  public async onExec(message: Message) {
    const listMsg = new ListMessage(
      message.chat,
      'Texto da lista',
      'Botão da lista',
      'Rodapé da lista',
      'Titulo da lista',
      { interactiveMode: true },
    );

    for (let c = 0; c < 5; c++) {
      const catgeory = listMsg.addCategory(`Categoria ${c + 1}`);

      for (let i = 0; i < 5; i++) {
        listMsg.addItem(catgeory, `Item ${i + 1}`, 'Descrição');
      }
    }

    await Client.getClient(this.clientId).send(listMsg);
  }
}
