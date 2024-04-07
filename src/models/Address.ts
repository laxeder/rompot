import { injectJSON } from "../utils";

export default class Address {
  public country: string = "";
  public state: string = "";
  public city: string = "";
  public neighborhood: string = "";
  public street: string = "";
  public zipcode: string = "";
  public complement: string = "";
  public data: any = {};

  constructor(data: any = {}) {
    injectJSON(data, this);
  }
}
