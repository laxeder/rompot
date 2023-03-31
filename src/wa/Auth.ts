import { SignalDataTypeMap, initAuthCreds, BufferJSON, proto } from "@adiwajshing/baileys";
import { mkdirSync, statSync, unlinkSync } from "fs";
import { join } from "path";

import IAuth from "@interfaces/IAuth";
import { readFile, writeFile } from "fs/promises";

export class MultiFileAuthState implements IAuth {
  public folder: string;

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

  public fixFileName = (file?: string) => file?.replace(/\//g, "__")?.replace(/:/g, "-");

  public getStat(folder: string) {
    try {
      return statSync(folder);
    } catch (err) {
      return null;
    }
  }

  public get = async (key: string) => {
    return await this.readData(`${key}.json`);
  };

  public set = async (key: string, data: any) => {
    if (!!!data) this.removeData(key);
    else this.writeData(data, `${key}.json`);
  };

  public writeData = async (data: any, file: string) => {
    return writeFile(join(this.folder, this.fixFileName(file)!), JSON.stringify(data, BufferJSON.replacer));
  };

  public readData = async (file: string) => {
    try {
      const data = await readFile(join(this.folder, this.fixFileName(file)!), { encoding: "utf-8" });
      return JSON.parse(data, BufferJSON.reviver);
    } catch (error) {
      return null;
    }
  };

  public removeData = async (file: string) => {
    try {
      unlinkSync(join(this.folder, this.fixFileName(file)!));
    } catch {}
  };
}

export async function getBaileysAuth(auth: IAuth) {
  const creds = (await auth.get("creds")) || initAuthCreds();

  return {
    saveCreds: async () => {
      return await auth.set("creds", creds);
    },
    state: {
      creds,
      keys: {
        async get<T extends keyof SignalDataTypeMap>(type: T, ids: string[]): Promise<{ [id: string]: SignalDataTypeMap[T] }> {
          const data: { [id: string]: SignalDataTypeMap[typeof type] } = {};

          await Promise.all(
            ids.map(async (id) => {
              let value = await auth.get(`${type}-${id}`);

              if (type === "app-state-sync-key" && value) {
                value = proto.Message.AppStateSyncKeyData.fromObject(value);
              }

              data[id] = value;
            })
          );

          return data;
        },

        set: async (data: any): Promise<void> => {
          const tasks: Promise<void>[] = [];

          for (const category in data) {
            for (const id in data[category]) {
              tasks.push(auth.set(`${category}-${id}`, data[category][id]));
            }
          }

          await Promise.all(tasks);
        },
      },
    },
  };
}
