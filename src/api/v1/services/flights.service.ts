import HttpError from '../common/http_error';
import { HttpStatus } from '../common/http_code';
import ErrorCode from '../common/error_code';
import { FlightSuppliers, getFlightsSuppliers } from './flight_suppliers.service';
import { AxiosResponse } from 'axios';
import Flight from '../entity/flight.entity';

async function getOneWayFlights({
  departureAirport,
  arrivalAirport,
  departureDate,
}: {
  departureAirport: string;
  arrivalAirport: string;
  departureDate: string;
}): Promise<Flight[]> {
  // Get flights from all suppliers
  const result = await Promise.all(
    getFlightsSuppliers?.map((supplier: FlightSuppliers) =>
      supplier.request({ departureAirport, arrivalAirport, departureDate }),
    ),
  );

  // Concat all result by departureTime

  return null;
}

export async function getAndFormatFlights(
  departureAirport: string,
  arrivalAirport: string,
  departureDate: string,
  returnDate: string,
  tripType: string,
): Promise<Flight[]> {
  console.log('YBO 2', tripType);
  if (tripType === 'OW') {
    return await getOneWayFlights({ departureAirport, departureDate, arrivalAirport });
  } else if (tripType === 'R') {
    // const flights: [] = await getTwoWayFlights({ departureAirport, departureDate, arrivalAirport, returnDate });
  } else {
    throw new HttpError(HttpStatus.BAD_REQUEST, ErrorCode.INVALID_TRIP_TYPE, 'Invalid trip type', { tripType });
  }

  return [];
}

// function getTwoWayFlights({
//   departureAirport,
//   departureDate,
//   arrivalAirport,
//   returnDate,
// }: {
//   departureAirport: string;
//   departureDate: Date;
//   arrivalAirport: string;
//   returnDate: Date;
// }): Promise<[]> {
//   const departureFlights = await this.getOneWayFlights(departureAirport, departureDate);
//   const returnFlights = await this.getOneWayFlights(arrivalAirport, returnDate);

//   const flights = this.formatDepartureFlightsAndReturnFlights(departureFlights, returnFlights);

//   return [];
// }

// function formatDepartureFlightsAndReturnFlights() {}
