import axios, { AxiosResponse } from 'axios';
import { FlightWithPrice } from '../flight/flight.entity';
import { FlightSuppliersInterface, FlightBySupplier } from './flight_supplier.entity';
import Logger from '../logger/logger';
import HttpError from '../common/error/http_error';
import { HttpStatus } from '../common/error/http_code';
import { ErrorCode } from '../common/error/error_code';

class MoonFlightSupplier implements FlightSuppliersInterface {
  private static instance: MoonFlightSupplier;
  name: string;

  private constructor() {
    this.name = 'MOON';
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
    Logger.logDebug('Request flights from MOON supplier');
    try {
      const response: AxiosResponse = await axios.get(
        `${process.env.AIR_MOON_SUPPLIER_URL}?departure_airport=${departureAirport}&arrival_airport=${arrivalAirport}&departure_date=${departureDate}`,
      );
      return { supplierName: this.name, flights: this.format(response.data) };
    } catch (err) {
      const error = new HttpError(HttpStatus.INTERNAL_ERROR, ErrorCode.MOON_API_ERROR, 'MOON api request error', {
        err: err.toString(),
      });
      Logger.logError(error);
      throw error;
    }
  }

  format(data: any): FlightWithPrice[] {
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
