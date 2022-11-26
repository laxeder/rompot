import * as fs from "fs";

import { DB } from "../types/DB";

export class JsonDB implements DB {
  private _dir: string;
  private _data: any;

  constructor(dir: string) {
    this._data = JSON.parse(fs.readFileSync(dir, "utf8")) || {};
    this._dir = dir;
  }

  private save(): boolean {
    fs.writeFileSync(this._dir, JSON.stringify(this._data));
    return true;
  }

  public async update(path: string, data: any, options?: any): Promise<any> {
    this._data = this.push(path, data, this._data, true);
    return this.save();
  }

  public async set(path: string, data: any, options?: any): Promise<any> {
    this._data = this.push(path, data, this._data, false);
    return this.save();
  }

  public async get(path: string, options?: any): Promise<any | null> {
    return this.getPath(path, this._data);
  }

  public async delete(path: string, options?: any): Promise<any> {
    this._data = this.push(path, null, this._data, false);
    return this.save();
  }

  private getPath(path: string, data: any): any | null {
    const splitedPath = path.split("/");

    if (!!!splitedPath[1]) return data;

    for (let i = 1; i + 1 <= splitedPath.length; i++) {
      if (!data.hasOwnProperty(splitedPath[i])) {
        data = null;
        break;
      }

      data = data[splitedPath[i]];
    }

    return data || null;
  }

  private push(path: string, data: any, dbData: any, update: boolean = false): any {
    const splitedPath = path.split("/");
    const atualPath = splitedPath[1];

    if (!dbData.hasOwnProperty(atualPath)) dbData[atualPath] = {};

    if (!!!splitedPath[2]) {
      if (!update) {
        dbData[atualPath] = data;
      } else {
        if (typeof data == "object" && !Array.isArray(data)) {
          if (typeof dbData[atualPath] != "object" || Array.isArray(dbData[atualPath])) {
            dbData[atualPath] = {};
          }

          dbData[atualPath] = {
            ...dbData[atualPath],
            ...data,
          };
        } else {
          dbData[atualPath] = data;
        }
      }

      return dbData;
    }

    if (typeof dbData[atualPath] !== "object" || Array.isArray(dbData[atualPath])) dbData[atualPath] = {};

    dbData[atualPath] = this.push(path.replace(`/${atualPath}`, ""), data, dbData[atualPath], update);

    return dbData;
  }
}
