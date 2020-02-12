import { FlightWithPrice } from '../entity/flight.entity';
import axios, { AxiosResponse } from 'axios';
import { FlightSuppliersInterface, FlightBySupplier } from './flight_supplier.entity';

export default class JazzFlightSupplier implements FlightSuppliersInterface {
  name: string;

  constructor() {
    this.name = 'JAZZ';
  }

  async request({
    departureAirport,
    arrivalAirport,
    departureDate,
  }: {
    departureAirport: string;
    arrivalAirport: string;
    departureDate: string;
  }): Promise<FlightBySupplier> {
    console.log('YBO JAZZ get');
    try {
      const response: AxiosResponse = await axios.get(
        `${process.env.AIR_JAZZ_SUPPLIER_URL}?departure_airport=${departureAirport}&arrival_airport=${arrivalAirport}&departure_date=${departureDate}`,
      );
      return { supplierName: this.name, flights: this.format(response.data) };
    } catch (err) {
      console.error(err);
      // TODO throw an error
      throw new Error();
    }
  }

  protected format(data: any): FlightWithPrice[] {
    console.log('YBO JAZZ format');
    if (!data) return;

    if (data instanceof Array) {
      return data.reduce((acc: FlightWithPrice[], cur: any) => {
        return [
          ...acc,
          {
            id: cur?.flight?.id,
            price: cur?.price,
            departureAirport: cur?.flight?.departure_airport,
            arrivalAirport: cur?.flight?.arrival_airport,
            departureTime: cur?.flight?.departure_time,
            arrivalTime: cur?.flight?.arrival_time,
          },
        ];
      }, []);
    }

    return;
  }
}
