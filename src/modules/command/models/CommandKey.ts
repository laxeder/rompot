import { CMDKeyType, ICommandControllerConfig, ICommandKey } from "rompot-base";

export default class CommandKey implements ICommandKey {
  public type: string = CMDKeyType.Sample;
  public values: string[] = [];

  constructor(...values: string[]) {
    this.values = values;
  }

  /**
   * Procura pela chave em um texto
   * @return retorna se a chave foi encontrada
   */
  public static search(text: string, config: ICommandControllerConfig, ...keys: ICommandKey[]): ICommandKey | null {
    if (!!config.prefix) {
      if (!text.startsWith(config.prefix)) return null;

      text = text.replace(config.prefix, "").trim();
    }

    if (!!config.lowerCase) {
      text = text.toLowerCase();
      keys = keys.map((key) => {
        key.values = key.values.map((value) => value.toLowerCase());
        return key;
      });
    }

    const result = keys.filter((key) => {
      if (key.type === CMDKeyType.Exact) {
        return CommandKey.verifyExact(text, key.values);
      }

      return CommandKey.verify(text, key.values);
    });

    if (result.length > 0) {
      let key = result[0];

      for (const res of result) {
        if (res.values.join("").length < key.values.join("").length) continue;

        key = res;
      }

      return key;
    }

    return null;
  }

  /** Verifica se o texto contem as chaves */
  public static verify(text: string, keys: string[]): boolean {
    for (const key of keys) {
      if (text.includes(key)) continue;

      return false;
    }

    return true;
  }

  /** Verifica se o texto tem as chaves exatas */
  public static verifyExact(text: string, keys: string[]): boolean {
    let result = `${text}`;

    for (const key of keys) {
      if (!result.startsWith(key)) return false;

      result = result.replace(key, "").trim();
    }

    return true;
  }
}
