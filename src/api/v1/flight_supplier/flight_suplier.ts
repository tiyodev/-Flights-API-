import { FlightSuppliersInterface } from './flight_supplier.entity';
import JazzFlightSupplier from './Jazz_flight_supplier';
import MoonFlightSupplier from './moon_flight_supplier';

class FlightSupplier {
  private static instance: FlightSupplier;

  private constructor() {
    // TODO Log
  }

  public static getInstance(): FlightSupplier {
    if (!FlightSupplier.instance) {
      FlightSupplier.instance = new FlightSupplier();
    }

    return FlightSupplier.instance;
  }

  getAllFlightSupplier(): FlightSuppliersInterface[] {
    return [new JazzFlightSupplier(), new MoonFlightSupplier()];
  }
}

export default FlightSupplier.getInstance();
