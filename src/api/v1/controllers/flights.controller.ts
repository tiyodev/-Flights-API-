import { Request, Response } from 'express';
import { HttpStatus } from '../common/error/http_code';
import { getAndFormatFlights } from '../services/flights.service';
import { FlightsByPrice } from '../entity/flight.entity';
import { isValidDate, isValidDateTime, isFirstDateIsAfterSecondDate } from '../common/tools/validation';
import { ErrorCode } from '../common/error/error_code';
import HttpError from '../common/error/http_error';
import logger from '../logger/logger';

function validateGetFlightsByPriceParameters({
  departureAirport,
  arrivalAirport,
  departureDate,
  returnDate,
  tripType,
}: {
  departureAirport: string;
  arrivalAirport: string;
  departureDate: string;
  returnDate: string;
  tripType: string;
}): void {
  // Check mandatory parameters
  if (!departureAirport) {
    throw new HttpError(HttpStatus.NOT_FOUND, ErrorCode.INVALID_DEPARTURE_AIRPORT, `departureAirport not found`, {
      departureAirport,
    });
  }
  if (!arrivalAirport) {
    throw new HttpError(HttpStatus.NOT_FOUND, ErrorCode.INVALID_ARRIVAL_AIRPORT, `arrivalAirport not found`, {
      arrivalAirport,
    });
  }
  if (!departureDate) {
    throw new HttpError(HttpStatus.NOT_FOUND, ErrorCode.INVALID_DEPARTURE_DATE, `departureDate not found`, {
      departureDate,
    });
  }
  if (!tripType) {
    throw new HttpError(HttpStatus.NOT_FOUND, ErrorCode.INVALID_TRIP_TYPE, `tripType not found`, { tripType });
  }

  // Check if departureDate is a correct date
  if (!isValidDate(departureDate) && !isValidDateTime(departureDate)) {
    throw new HttpError(HttpStatus.BAD_REQUEST, ErrorCode.INVALID_DEPARTURE_DATE, `Invalid date 'departureDate'`, {
      departureDate,
    });
  }

  // Check trip type
  if (tripType !== 'R' && tripType !== 'OW') {
    throw new HttpError(HttpStatus.BAD_REQUEST, ErrorCode.INVALID_TRIP_TYPE, `TripType must be equals to 'R' or 'OW'`, {
      tripType,
    });
  }

  // If tripType is equals to 'R' then returnDate must be set
  if (tripType === 'R' && !returnDate) {
    throw new HttpError(
      HttpStatus.BAD_REQUEST,
      ErrorCode.INVALID_RETURN_DATE,
      `When tripType is equald to 'R' then returnDate is mandatory`,
      {
        tripType,
        returnDate,
      },
    );
  }

  // Check if returnDate is a correct date
  if (returnDate && !isValidDate(returnDate) && !isValidDateTime(returnDate)) {
    throw new HttpError(HttpStatus.BAD_REQUEST, ErrorCode.INVALID_RETURN_DATE, `Invalid date 'returnDate'`, {
      returnDate,
    });
  }

  // If returnDate and departureDate are set, check if returnDate is after departureDate
  if (returnDate && departureDate) {
    const firstDate: Date = new Date(returnDate);
    const secondeDate: Date = new Date(departureDate);
    if (isFirstDateIsAfterSecondDate(firstDate, secondeDate)) {
      throw new HttpError(
        HttpStatus.BAD_REQUEST,
        ErrorCode.INVALID_DATES,
        `The date ${firstDate.toISOString()} must be higher than ${secondeDate.toISOString()}`,
        {
          firstDate: firstDate.toISOString(),
          secondeDate: secondeDate.toISOString(),
        },
      );
    }
  }
}

export async function getFlightsByPrice(req: Request, res: Response): Promise<void> {
  try {
    // Get all URI parameters
    const {
      departure_airport: departureAirport,
      arrival_airport: arrivalAirport,
      departure_date: departureDate,
      return_date: returnDate,
      tripType,
    } = req?.query;

    // Query validation
    validateGetFlightsByPriceParameters({
      departureAirport,
      arrivalAirport,
      departureDate,
      returnDate,
      tripType,
    });

    // Get all flights by price
    const flightsByPrice: FlightsByPrice[] = await getAndFormatFlights(
      departureAirport,
      arrivalAirport,
      departureDate,
      returnDate,
      tripType,
    );

    // Return result with query parameters
    res.json({
      search: {
        departureAirport,
        arrivalAirport,
        departureDate,
        returnDate,
        tripType,
      },
      flightsByPrice,
    });
  } catch (err) {
    logger.logError(err);
    if (err.status) {
      res.status(err.status).json(err);
    } else {
      res.status(HttpStatus.INTERNAL_ERROR).json({
        status: HttpStatus.INTERNAL_ERROR,
        error: err.toString(),
      });
    }
  }
}
