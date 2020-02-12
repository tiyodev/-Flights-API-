import { FlightSuppliersInterface } from './flight_supplier.entity';
import JazzFlightSupplier from './Jazz_flight_supplier';
import MoonFlightSupplier from './moon_flight_supplier';
import Logger from '../logger/logger';

class FlightSupplier {
  private static instance: FlightSupplier;

  private constructor() {
    Logger.logDebug('Create an instance of FlightSupplier');
  }

  static getInstance(): FlightSupplier {
    if (!FlightSupplier.instance) {
      FlightSupplier.instance = new FlightSupplier();
    }
    return FlightSupplier.instance;
  }

  getAllFlightSupplier(): FlightSuppliersInterface[] {
    return [JazzFlightSupplier, MoonFlightSupplier];
  }
}

export default FlightSupplier.getInstance();
