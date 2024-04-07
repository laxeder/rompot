import Address from "../models/Address";

import BaseService from "./BaseService";

/** Serviço para obter os dados de uma localização. */
export default class AddressService extends BaseService {
  /**
   * Obtem os dados de uma localização.
   * @param latitude - Latitude da localização.
   * @param longitude - Longitude da localização.
   * @returns Dados da localização.
   */
  public static async getByLocation(latitude: number, longitude: number): Promise<Address> {
    const { data } = await this.get(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`);

    const loc = new Address();

    if (!data?.address) return loc;

    loc.data = data;

    //? Lendo país da localização
    if (data.address.country) loc.country = data.address.country;

    //? Lendo estado da localização
    if (data.address.state) loc.state = data.address.state;

    //? Lendo cidade da localização
    if (data.address.city) loc.city = data.address.city;
    else if (data.address.city_district) loc.city = data.address.city_district;
    else if (data.address.town) loc.city = data.address.town;

    //? Lendo bairro da localização
    if (data.address.suburb) loc.neighborhood = data.address.suburb;

    //? Lendo rua da localização
    if (data.address.road) loc.street = data.address.road;

    //? Lendo CEP da localização
    if (data.address.postcode) loc.zipcode = data.address.postcode;

    //? Lendo complemento da localização
    if (data.display_name) loc.complement = data.display_name;

    return loc;
  }
}
