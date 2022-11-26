import { handle } from "@utils/handle";
import { DB } from "../types/DB";

export class DataBase {
  private _db: DB;

  constructor(DB: DB) {
    this._db = DB;
  }

  /**
   * * Atualiza o valor de um caminho do banco de dados
   * @param path 
   * @param data 
   * @param options 
   * @returns 
   */
  public async update(path: string, data: any, options?: any) {
    return handle(this._db.update(path, data, options));
  }

  /**
   * * Define o valor de um caminho do banco de dados
   * @param path 
   * @param data 
   * @param options 
   * @returns 
   */
  public async set(path: string, data: any, options?: any) {
    return handle(this._db.set(path, data, options));
  }

  /**
   * * Deleta o valor de um caminho do banco de dados
   * @param path 
   * @param options 
   * @returns 
   */
  public async delete(path: string, options?: any) {
    return handle(this._db.delete(path, options));
  }

  /**
   * * Retorna o valor de um camino do banco de dados
   * @param path 
   * @param options 
   * @returns 
   */
  public async get(path: string, options?: any) {
    return handle(this._db.get(path, options));
  }
}
