import { FlightWithPrice } from '../entity/flight.entity';

export type FlightBySupplier = {
  supplierName: string;
  flights: FlightWithPrice[];
};

export interface FlightSuppliersInterface {
  name: string;
  request: ({
    departureAirport,
    arrivalAirport,
    departureDate,
  }: {
    departureAirport: string;
    arrivalAirport: string;
    departureDate: string;
  }) => Promise<FlightBySupplier>;
}
