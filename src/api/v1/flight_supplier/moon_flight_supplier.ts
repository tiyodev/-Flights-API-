import axios, { AxiosResponse } from 'axios';
import { FlightWithPrice } from '../entity/flight.entity';
import { FlightSuppliersInterface, FlightBySupplier } from './flight_supplier.entity';
import Logger from '../logger/logger';

class MoonFlightSupplier implements FlightSuppliersInterface {
  private static instance: MoonFlightSupplier;
  name: string;

  private constructor() {
    this.name = 'JAZZ';
    Logger.logDebug('Create an instance of MoonFlightSupplier');
  }

  static getInstance(): MoonFlightSupplier {
    if (!MoonFlightSupplier.instance) {
      MoonFlightSupplier.instance = new MoonFlightSupplier();
    }
    return MoonFlightSupplier.instance;
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
    console.log(`YBO ${this.name} get`);
    try {
      const response: AxiosResponse = await axios.get(
        `${process.env.AIR_MOON_SUPPLIER_URL}?departure_airport=${departureAirport}&arrival_airport=${arrivalAirport}&departure_date=${departureDate}`,
      );
      return { supplierName: this.name, flights: this.format(response.data) };
    } catch (err) {
      console.error(err);
      // TODO throw an error
      throw new Error();
    }
  }

  format(data: any): FlightWithPrice[] {
    console.log(`YBO ${this.name} format`);
    if (!data) return;

    if (data instanceof Array) {
      return data.reduce((acc: FlightWithPrice[], cur: any) => {
        return [
          ...acc,
          {
            id: cur?.legs[0]?.id,
            price: cur?.price,
            departureAirport: cur?.legs[0]?.departure_airport,
            arrivalAirport: cur?.legs[0]?.arrival_airport,
            departureTime: cur?.legs[0]?.departure_time,
            arrivalTime: cur?.legs[0]?.arrival_time,
          },
        ];
      }, []);
    }

    return null;
  }
}

export default MoonFlightSupplier.getInstance();
