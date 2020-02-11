export default interface Flight {
  id: string;
  price: number;
  departureAirport: string;
  arrivalAirport: string;
  departureTime: Date;
  arrivalTime: Date;
  returnFlights?: Flight[];
}
