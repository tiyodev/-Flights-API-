export interface Flight {
  id: string;
  departureAirport: string;
  arrivalAirport: string;
  departureTime: Date;
  arrivalTime: Date;
  returnFlights?: FlightsByPrice[];
}

export interface FlightWithPrice extends Flight {
  price?: number;
}

export interface FlightsByPrice {
  price: number;
  flights: Flight[];
}
