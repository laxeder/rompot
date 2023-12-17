import { readFile, writeFile, unlink } from "fs/promises";
import { mkdirSync, readdirSync, statSync } from "fs";
import { join } from "path";

import IAuth from "../client/IAuth";

export default class TelegramAuth implements IAuth {
  #botToken: string;

  public sessionsDir: string;
  public botPhoneNumber?: string;

  public fixFileName = (file?: string) => file?.replace(/\//g, "__")?.replace(/:/g, "-");

  public getStat(folder: string) {
    try {
      return statSync(folder);
    } catch (err) {
      return null;
    }
  }

  public setBotToken(botToken: string): void {
    this.#botToken = `${botToken || ""}`;
  }

  constructor(botToken: string, sessionsDir: string = "./sessions", autoCreateDir: boolean = true) {
    this.sessionsDir = sessionsDir;
    this.#botToken = `${botToken || ""}`;

    const sessionDir = this.getSession();
    const folderInfo = this.getStat(sessionDir);

    if (folderInfo) {
      if (!folderInfo.isDirectory()) {
        throw new Error(`found something that is not a directory at ${sessionDir}, either delete it or specify a different location`);
      }
    } else {
      if (autoCreateDir) mkdirSync(sessionDir, { recursive: true });
    }
  }

  public getSession(...paths: string[]) {
    return join(`${this.sessionsDir}`, `${this.#botToken}`.slice(0, 9), ...paths);
  }

  public async get(file: string) {
    try {
      if (file == "BOT_TOKEN") {
        return this.#botToken;
      }

      const data = await readFile(this.getSession(this.fixFileName(`${file}.json`)!), { encoding: "utf-8" });

      return JSON.parse(data);
    } catch (error) {
      return null;
    }
  }

  public async set(file: string, data: any) {
    try {
      if (!data) {
        await this.remove(file);
      } else {
        await writeFile(this.getSession(this.fixFileName(`${file}.json`)!), JSON.stringify(data));
      }
    } catch {}
  }

  public async remove(file: string) {
    try {
      await unlink(this.getSession(this.fixFileName(`${file}.json`)!));
    } catch {}
  }

  public async listAll(pattern?: string): Promise<string[]> {
    try {
      return readdirSync(this.getSession()).reduce((p, c) => (c.startsWith(pattern) ? [...p, c.replace(".json", "")] : p), []);
    } catch (error) {
      return [];
    }
  }
}
