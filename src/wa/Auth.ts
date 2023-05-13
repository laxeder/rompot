import { SignalDataTypeMap, initAuthCreds, BufferJSON, proto, AuthenticationState, AuthenticationCreds } from "@whiskeysockets/baileys";
import { readFile, writeFile, unlink } from "fs/promises";
import { mkdirSync, readdirSync, statSync } from "fs";
import { join } from "path";

import { IAuth } from "@interfaces/IAuth";

export class MultiFileAuthState implements IAuth {
  public folder: string;

  public fixFileName = (file?: string) => file?.replace(/\//g, "__")?.replace(/:/g, "-");

  public getStat(folder: string) {
    try {
      return statSync(folder);
    } catch (err) {
      return null;
    }
  }

  constructor(folder: string, autoCreateDir: boolean = true) {
    this.folder = folder;

    const folderInfo = this.getStat(folder);

    if (folderInfo) {
      if (!folderInfo.isDirectory()) {
        throw new Error(`found something that is not a directory at ${folder}, either delete it or specify a different location`);
      }
    } else {
      if (autoCreateDir) mkdirSync(folder, { recursive: true });
    }
  }

  public async get(file: string) {
    try {
      const data = await readFile(join(this.folder, this.fixFileName(`${file}.json`)!), { encoding: "utf-8" });

      return JSON.parse(data, BufferJSON.reviver);
    } catch (error) {
      return null;
    }
  }

  public async set(file: string, data: any) {
    try {
      if (!!!data) {
        await unlink(join(this.folder, this.fixFileName(`${file}.json`)!));
      } else {
        await writeFile(join(this.folder, this.fixFileName(`${file}.json`)!), JSON.stringify(data, BufferJSON.replacer));
      }
    } catch {}
  }

  public async remove(file: string) {
    try {
      await unlink(join(this.folder, this.fixFileName(`${file}.json`)!));
    } catch {}
  }

  public async listAll(file?: string) {
    try {
      return readdirSync(!!file ? join(this.folder, file) : this.folder);
    } catch (err) {
      return [];
    }
  }
}

export const getBaileysAuth = async (auth: IAuth): Promise<{ state: AuthenticationState; saveCreds: () => Promise<void> }> => {
  const replacer = (data: any) => {
    try {
      const json = JSON.parse(JSON.stringify(data, BufferJSON.replacer), BufferJSON.reviver);
      return json;
    } catch (err) {
      return data;
    }
  };

  const creds: AuthenticationCreds = replacer(await auth.get("creds")) || initAuthCreds();

  return {
    state: {
      creds,
      keys: {
        async get<T extends keyof SignalDataTypeMap>(type: T, ids: string[]): Promise<{ [id: string]: SignalDataTypeMap[T] }> {
          const data: { [_: string]: SignalDataTypeMap[typeof type] } = {};

          await Promise.all(
            ids.map(async (id) => {
              let value = await replacer(await auth.get(`${type}-${id}`));

              if (type === "app-state-sync-key" && value) {
                value = proto.Message.AppStateSyncKeyData.fromObject(value);
              }

              data[id] = value;
            })
          );

          return data;
        },
        async set(data: any) {
          const tasks: Promise<void>[] = [];

          for (const category in data) {
            for (const id in data[category]) {
              const value = data[category][id];

              if (!!!value) {
                tasks.push(auth.remove(`${category}-${id}`));
              } else {
                tasks.push(auth.set(`${category}-${id}`, value));
              }
            }
          }

          await Promise.all(tasks);
        },
      },
    },
    saveCreds: async () => {
      return await auth.set("creds", creds);
    },
  };
};
