import { FlightBySupplier } from './../flight_supplier/flight_supplier.entity';
import { FlightSearchParameter, FlightSearchResult } from './flight_search.entity';
import { FlightsByPrice, FlightWithPrice } from '../flight/flight.entity';
import HttpError from '../common/error/http_error';
import { HttpStatus } from '../common/error/http_code';
import { ErrorCode } from '../common/error/error_code';
import {
  mergeFlightsByPriceAndOrderByPriceAndDate,
  getFlightsFromAllSupplier,
  concatFlightsFromMultipleSupplier,
} from './flight_search.helper';
import Logger from '../logger/logger';

export default class FlightSearch {
  // Search parameters
  researchCriterias: FlightSearchParameter;
  // Search flights by price
  flightsByPrice: FlightsByPrice[];

  constructor(parameters: FlightSearchParameter) {
    this.researchCriterias = parameters;
  }

  async searchByPrice(): Promise<FlightSearch> {
    Logger.logInfo(`A new search is run with parameters: ${JSON.stringify(this.researchCriterias)}`);

    if (this.researchCriterias.tripType === 'OW') {
      this.flightsByPrice = await this.getOneWayFlights();
      return this;
    } else if (this.researchCriterias.tripType === 'R') {
      this.flightsByPrice = await this.getTwoWayFlights();
      return this;
    } else {
      throw new HttpError(HttpStatus.BAD_REQUEST, ErrorCode.INVALID_TRIP_TYPE, 'Invalid trip type', {
        tripType: this.researchCriterias.tripType,
      });
    }
  }

  private async getOneWayFlights(): Promise<FlightsByPrice[]> {
    // Get flights from all suppliers
    const flightRequestResults: FlightBySupplier[] = await getFlightsFromAllSupplier({
      departureAirport: this.researchCriterias.departureAirport,
      arrivalAirport: this.researchCriterias.arrivalAirport,
      departureDate: this.researchCriterias.departureDate,
    });

    // Concat all flights from multiple supplier
    const allFlights: FlightWithPrice[] = concatFlightsFromMultipleSupplier(flightRequestResults);

    // Return merge and order flights by price and departureTime
    return mergeFlightsByPriceAndOrderByPriceAndDate(allFlights);
  }

  private async getTwoWayFlights(): Promise<FlightsByPrice[]> {
    // Get all departure flights and get all return flights for all supplier
    const [departureFlightRequestResults, returnFlightRequestResults] = await Promise.all([
      getFlightsFromAllSupplier({
        departureAirport: this.researchCriterias.departureAirport,
        arrivalAirport: this.researchCriterias.arrivalAirport,
        departureDate: this.researchCriterias.departureDate,
      }),
      getFlightsFromAllSupplier({
        departureAirport: this.researchCriterias.arrivalAirport,
        arrivalAirport: this.researchCriterias.departureAirport,
        departureDate: this.researchCriterias.returnDate,
      }),
    ]);

    // Concat all departure flights from multiple supplier
    const allDepartureFlights: FlightWithPrice[] = concatFlightsFromMultipleSupplier(departureFlightRequestResults);

    // Concat all return flights from multiple supplier
    const allReturnFlights: FlightWithPrice[] = concatFlightsFromMultipleSupplier(returnFlightRequestResults);

    // Merge and order return flights by price and departureTime
    const groupReturnFlights: FlightsByPrice[] = mergeFlightsByPriceAndOrderByPriceAndDate(allReturnFlights);

    // Return merge and order departure flights with return flights by price and departureTime
    return mergeFlightsByPriceAndOrderByPriceAndDate(allDepartureFlights, groupReturnFlights);
  }

  toJSON(): FlightSearchResult {
    return {
      criterias: this.researchCriterias,
      flightsByPrice: this.flightsByPrice,
    };
  }
}
