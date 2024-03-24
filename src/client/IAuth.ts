/** Interface de autenticação */
export default interface IAuth {
  botPhoneNumber?: string;
  prepare(): Promise<void> | void;
  get: (key: string) => Promise<any>;
  set: (key: string, data: any) => Promise<void>;
  remove: (key: string) => Promise<void>;
  listAll: (key?: string) => Promise<string[]>;
}
