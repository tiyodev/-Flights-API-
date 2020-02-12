import { FlightBySupplier, FlightSuppliersInterface } from './../flight_supplier/flight_supplier.entity';
import { FlightSearchParameter, FlightSearchResult } from './flight_search.entity';
import { FlightsByPrice, FlightWithPrice } from '../flight/flight.entity';
import HttpError from '../common/error/http_error';
import { HttpStatus } from '../common/error/http_code';
import { ErrorCode } from '../common/error/error_code';
import FlightSupplier from '../flight_supplier/flight_suplier';
import { groupFlightsByPrice } from './flight_search.helper';
import logger from '../logger/logger';

export default class FlightSearch {
  // Search parameters
  researchCriterias: FlightSearchParameter;
  // Search flights by price
  flightsByPrice: FlightsByPrice[];

  constructor(parameters: FlightSearchParameter) {
    this.researchCriterias = parameters;
  }

  async searchByPrice(): Promise<FlightSearch> {
    logger.logInfo(`A new search is run with parameters: ${JSON.stringify(this.researchCriterias)}`);

    if (this.researchCriterias.tripType === 'OW') {
      this.flightsByPrice = await this.getOneWayFlights();
      return this;
    } else if (this.researchCriterias.tripType === 'R') {
      this.flightsByPrice = await this.getTwoWayFlights(this.researchCriterias);
      return this;
    } else {
      throw new HttpError(HttpStatus.BAD_REQUEST, ErrorCode.INVALID_TRIP_TYPE, 'Invalid trip type', {
        tripType: this.researchCriterias.tripType,
      });
    }
  }

  private async getOneWayFlights(): Promise<FlightsByPrice[]> {
    // Get flights from all suppliers
    const flightRequestResults: FlightBySupplier[] = await Promise.all(
      FlightSupplier.getAllFlightSupplier().map((supplier: FlightSuppliersInterface) =>
        supplier.request({
          departureAirport: this.researchCriterias.departureAirport,
          arrivalAirport: this.researchCriterias.arrivalAirport,
          departureDate: this.researchCriterias.departureDate,
        }),
      ),
    );

    // Concat all flights
    let allFlights: FlightWithPrice[] = [];
    flightRequestResults.map(x => (allFlights = [...allFlights, ...x.flights]));

    // Group flights by price
    const groupFlights: FlightsByPrice[] = groupFlightsByPrice(allFlights);

    // Order flights by price
    groupFlights.sort((firstFlight, secondFlight) => firstFlight.price - secondFlight.price);

    return groupFlights;
  }

  private async getTwoWayFlights({
    departureAirport,
    departureDate,
    arrivalAirport,
    returnDate,
  }: {
    departureAirport: string;
    departureDate: string;
    arrivalAirport: string;
    returnDate: string;
  }): Promise<FlightsByPrice[]> {
    // Get departure flights from all suppliers
    const departureFlightRequestResults: FlightBySupplier[] = await Promise.all(
      FlightSupplier.getAllFlightSupplier().map((supplier: FlightSuppliersInterface) =>
        supplier.request({ departureAirport, arrivalAirport, departureDate }),
      ),
    );
    // Concat all departure flights
    let allDepartureFlights: FlightWithPrice[] = [];
    departureFlightRequestResults.map(x => (allDepartureFlights = [...allDepartureFlights, ...x.flights]));

    // Get all return flights
    const returnFlightRequestResults: FlightBySupplier[] = await Promise.all(
      FlightSupplier.getAllFlightSupplier().map((supplier: FlightSuppliersInterface) =>
        supplier.request({
          departureAirport: arrivalAirport,
          arrivalAirport: departureAirport,
          departureDate: returnDate,
        }),
      ),
    );

    // Concat all return flights
    let allReturnFlights: FlightWithPrice[] = [];
    returnFlightRequestResults.map(x => (allReturnFlights = [...allReturnFlights, ...x.flights]));

    // Group return flights by price
    const groupReturnFlights: FlightsByPrice[] = groupFlightsByPrice(allReturnFlights).filter(
      x => x.flights.length > 0,
    );

    // Group departure flights by price and return flights
    const flights: FlightsByPrice[] = groupFlightsByPrice(allDepartureFlights, groupReturnFlights);

    // Order departureflights by price
    return flights.sort((firstFlight, secondFlight) => firstFlight.price - secondFlight.price);
  }

  toJSON(): FlightSearchResult {
    return {
      criterias: this.researchCriterias,
      flightsByPrice: this.flightsByPrice,
    };
  }
}
