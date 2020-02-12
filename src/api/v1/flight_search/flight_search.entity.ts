import { FlightsByPrice } from '../flight/flight.entity';

export interface FlightSearchResult {
  criterias: FlightSearchParameter;
  flightsByPrice: FlightsByPrice[];
}

export interface FlightSearchParameter {
  departureAirport: string;
  arrivalAirport: string;
  departureDate: string;
  returnDate: string;
  tripType: string;
}
