export default interface IAuth {
  get: (key: string) => Promise<any>;
  set: (key: string, data: any) => Promise<void>;
  remove: (key: string) => Promise<void>;
  listAll: (key?: string) => Promise<string[]>;
}
