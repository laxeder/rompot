import {
  SignalDataTypeMap,
  initAuthCreds,
  BufferJSON,
  proto,
  AuthenticationState,
  AuthenticationCreds,
} from '@whiskeysockets/baileys';
import { readFile, writeFile, unlink } from 'fs/promises';
import { mkdirSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

import IAuth from '../client/IAuth';

export class MultiFileAuthState implements IAuth {
  public folder: string;
  public botPhoneNumber?: string;
  public autoCreateDir: boolean;

  public fixFileName = (file?: string) =>
    file?.replace(/\//g, '__')?.replace(/:/g, '-');

  public getStat(folder: string) {
    try {
      return statSync(folder);
    } catch {
      return null;
    }
  }

  constructor(
    folder: string,
    botPhoneNumber: string = '',
    autoCreateDir: boolean = true,
  ) {
    this.folder = folder;
    this.botPhoneNumber = botPhoneNumber;
    this.autoCreateDir = autoCreateDir;

    this.prepare();
  }

  public prepare() {
    if (this.autoCreateDir) {
      const folderInfo = this.getStat(this.folder);

      if (folderInfo) {
        if (!folderInfo.isDirectory()) {
          throw new Error(
            `found something that is not a directory at "${this.folder}", either delete it or specify a different location`,
          );
        }
      } else {
        if (this.autoCreateDir) {
          mkdirSync(this.folder, { recursive: true });
        }
      }
    }
  }

  public async get(file: string) {
    try {
      const data = await readFile(
        join(this.folder, this.fixFileName(`${file}.json`)!),
        { encoding: 'utf-8' },
      );

      return JSON.parse(data, BufferJSON.reviver);
    } catch {
      return null;
    }
  }

  public async set(file: string, data: any) {
    try {
      if (!data) {
        await unlink(join(this.folder, this.fixFileName(`${file}.json`)!));
      } else {
        await writeFile(
          join(this.folder, this.fixFileName(`${file}.json`)!),
          JSON.stringify(data, BufferJSON.replacer),
        );
      }
    } catch {}
  }

  public async remove(file: string) {
    try {
      await unlink(join(this.folder, this.fixFileName(`${file}.json`)!));
    } catch {}
  }

  public async listAll(pattern: string = ''): Promise<string[]> {
    try {
      return readdirSync(join(this.folder)).reduce(
        (p, c) => (c.startsWith(pattern) ? [...p, c.replace('.json', '')] : p),
        [],
      );
    } catch {
      return [];
    }
  }
}

export const getBaileysAuth = async (
  auth: IAuth,
): Promise<{ state: AuthenticationState; saveCreds: () => Promise<void> }> => {
  auth.prepare();

  const replacer = (data: any) => {
    try {
      const json = JSON.parse(
        JSON.stringify(data, BufferJSON.replacer),
        BufferJSON.reviver,
      );
      return json;
    } catch {
      return data;
    }
  };

  const creds: AuthenticationCreds =
    replacer(await auth.get('creds')) || initAuthCreds();

  return {
    state: {
      creds,
      keys: {
        async get<T extends keyof SignalDataTypeMap>(
          type: T,
          ids: string[],
        ): Promise<{ [id: string]: SignalDataTypeMap[T] }> {
          const data: { [_: string]: SignalDataTypeMap[typeof type] } = {};

          await Promise.all(
            ids.map(async (id) => {
              let value = await replacer(await auth.get(`${type}-${id}`));

              if (type === 'app-state-sync-key' && value) {
                value = proto.Message.AppStateSyncKeyData.fromObject(value);
              }

              data[id] = value;
            }),
          );

          return data;
        },
        async set(data: any) {
          await Promise.all(
            Object.keys(data).map((category) => {
              return Promise.all(
                Object.keys(data[category]).map(async (id) => {
                  const value = data[category][id];

                  if (!value) {
                    return auth.remove(`${category}-${id}`);
                  } else {
                    return auth.set(`${category}-${id}`, value);
                  }
                }),
              );
            }),
          );
        },
      },
    },
    async saveCreds() {
      return await auth.set('creds', creds);
    },
  };
};
