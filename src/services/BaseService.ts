import axios from "axios";

export default class BaseService {
  public static async get(path: string, body: any = {}) {
    return await axios.get(path, body);
  }

  public static async post(path: string, body: any = {}) {
    return await axios.post(path, body);
  }

  public static async patch(path: string, body: any = {}) {
    return await axios.patch(path, body);
  }
}
