import { Request, Response } from 'express';
import HttpError from '../common/http_error';
import { HttpStatus } from '../common/http_code';
import ErrorCode from '../common/error_code';
import { getAndFormatFlights } from '../services/flights.service';

function checkDateFormat(date: string): boolean {
  return /^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(date);
}

function checkDateTimeFormat(date: string): boolean {
  return /^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}$/.test(date);
}

function checkFirstDateIsAfterSecondDate(firstDate: Date, secondeDate: Date): HttpError | undefined {
  if (firstDate <= secondeDate) {
    return new HttpError(
      HttpStatus.BAD_REQUEST,
      ErrorCode.INVALID_DATES,
      `The date ${firstDate.toISOString()} must be higher than ${secondeDate.toISOString()}`,
      {
        firstDate: firstDate.toISOString(),
        secondeDate: secondeDate.toISOString(),
      },
    );
  }
  return;
}

function checkGetFlightsParameters({
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
}): HttpError | undefined {
  // Check mandatory parameters
  if (!departureAirport) {
    return new HttpError(HttpStatus.NOT_FOUND, ErrorCode.INVALID_DEPARTURE_AIRPORT, `departureAirport not found`, {
      departureAirport,
    });
  }
  if (!arrivalAirport) {
    return new HttpError(HttpStatus.NOT_FOUND, ErrorCode.INVALID_ARRIVAL_AIRPORT, `arrivalAirport not found`, {
      arrivalAirport,
    });
  }
  if (!departureDate) {
    return new HttpError(HttpStatus.NOT_FOUND, ErrorCode.INVALID_DEPARTURE_DATE, `departureDate not found`, {
      departureDate,
    });
  }
  if (!tripType) {
    return new HttpError(HttpStatus.NOT_FOUND, ErrorCode.INVALID_TRIP_TYPE, `tripType not found`, { tripType });
  }

  // Check if departureDate is a correct date
  if (!checkDateFormat(departureDate) && !checkDateTimeFormat(departureDate)) {
    return new HttpError(HttpStatus.BAD_REQUEST, ErrorCode.INVALID_DEPARTURE_DATE, `Invalid date 'departureDate'`, {
      departureDate,
    });
  }

  // Check trip type
  if (tripType !== 'R' && tripType !== 'OW') {
    return new HttpError(
      HttpStatus.BAD_REQUEST,
      ErrorCode.INVALID_TRIP_TYPE,
      `TripType must be equals to 'R' or 'OW'`,
      { tripType },
    );
  }

  // If tripType is equals to 'OW' then returnDate must be set
  if (tripType === 'OW' && !returnDate) {
    return new HttpError(
      HttpStatus.BAD_REQUEST,
      ErrorCode.INVALID_RETURN_DATE,
      `When tripType is equald to 'OW' then returnDate is mandatory`,
      {
        tripType,
        returnDate,
      },
    );
  }

  // Check if returnDate is a correct date
  if (departureDate && !checkDateFormat(returnDate) && !checkDateTimeFormat(returnDate)) {
    return new HttpError(HttpStatus.BAD_REQUEST, ErrorCode.INVALID_RETURN_DATE, `Invalid date 'returnDate'`, {
      returnDate,
    });
  }

  // If returnDate is set, check if returnDate is after departureDate
  if (returnDate && departureDate) {
    return checkFirstDateIsAfterSecondDate(new Date(returnDate), new Date(departureDate));
  }
  return;
}

export async function getFlights(req: Request, res: Response): Promise<void> {
  // Get all URI parameters
  const {
    departure_airport: departureAirport,
    arrival_airport: arrivalAirport,
    departure_date: departureDate,
    return_date: returnDate,
    tripType,
  } = req?.query;

  // Check parameters
  const err: HttpError | void = checkGetFlightsParameters({
    departureAirport,
    arrivalAirport,
    departureDate,
    returnDate,
    tripType,
  });

  console.log('YBO 1');

  // Get all flights
  await getAndFormatFlights(departureAirport, arrivalAirport, departureDate, returnDate, tripType);

  if (err) {
    res.status(err.status).json(err);
  } else {
    res.json({
      message: 'Welcome to the API v1',
    });
  }
}
