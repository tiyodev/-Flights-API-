import { HttpStatus } from '../common/error/http_code';
import { FlightWithPrice, FlightsByPrice, Flight } from '../entity/flight.entity';
import { FlightBySupplier, FlightSuppliersInterface } from '../flight_supplier/flight_supplier.entity';
import FlightSupplier from '../flight_supplier/flight_suplier';
import { ErrorCode } from '../common/error/error_code';
import HttpError from '../common/error/http_error';

function filterReturnFlightByArrivalDate(
  arrivalTime: Date,
  returnFlights: FlightsByPrice[],
): FlightsByPrice[] | undefined {
  if (!returnFlights) return undefined;

  const filteredReturnFlights: FlightsByPrice[] = returnFlights.reduce((acc: FlightsByPrice[], cur: FlightsByPrice) => {
    const returnFlightFilterByDate: Flight[] = cur.flights
      .filter(x => x.departureTime > arrivalTime)
      .sort((a, b) => {
        return new Date(a.departureTime).getTime() - new Date(b.departureTime).getTime();
      });

    if (returnFlightFilterByDate && returnFlightFilterByDate.length > 0) {
      return [
        ...acc,
        {
          price: cur.price,
          flights: returnFlightFilterByDate,
        },
      ];
    }
    return acc;
  }, []);

  if (!filteredReturnFlights || filteredReturnFlights.length === 0) return undefined;

  return filteredReturnFlights
    .filter(x => x.flights && x.flights.length > 0)
    .sort((firstFlight, secondFlight) => firstFlight.price - secondFlight.price);
}

function groupFlightsByPrice(departureFlights: FlightWithPrice[], returnFlights?: FlightsByPrice[]): FlightsByPrice[] {
  if (!departureFlights) return;

  // Group flights by price
  return departureFlights.reduce((acc: FlightsByPrice[], cur: FlightWithPrice) => {
    // Check if price already exist
    const priceIndex = acc.findIndex(x => x.price === cur.price);

    // If price already exit then add flight in the price's flights array
    if (priceIndex >= 0) {
      acc[priceIndex] = {
        price: acc[priceIndex].price,
        flights: [
          ...acc[priceIndex].flights,
          {
            id: cur.id,
            departureAirport: cur.departureAirport,
            arrivalAirport: cur.arrivalAirport,
            departureTime: cur.departureTime,
            arrivalTime: cur.arrivalTime,
            returnFlights: filterReturnFlightByArrivalDate(cur.arrivalTime, returnFlights),
          },
        ].sort((a, b) => {
          return new Date(a.departureTime).getTime() - new Date(b.departureTime).getTime();
        }),
      };

      return acc;
    }
    // Create a new object with this price and flight
    acc = [
      ...acc,
      {
        price: cur.price,
        flights: [
          {
            id: cur.id,
            departureAirport: cur.departureAirport,
            arrivalAirport: cur.arrivalAirport,
            departureTime: cur.departureTime,
            arrivalTime: cur.arrivalTime,
            returnFlights: filterReturnFlightByArrivalDate(cur.arrivalTime, returnFlights),
          },
        ],
      },
    ];
    return acc;
  }, []);
}

async function getOneWayFlights({
  departureAirport,
  arrivalAirport,
  departureDate,
}: {
  departureAirport: string;
  arrivalAirport: string;
  departureDate: string;
}): Promise<FlightsByPrice[]> {
  // Get flights from all suppliers
  const flightRequestResults: FlightBySupplier[] = await Promise.all(
    FlightSupplier.getAllFlightSupplier().map((supplier: FlightSuppliersInterface) =>
      supplier.request({ departureAirport, arrivalAirport, departureDate }),
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

async function getTwoWayFlights({
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
  const groupReturnFlights: FlightsByPrice[] = groupFlightsByPrice(allReturnFlights).filter(x => x.flights.length > 0);

  // Group departure flights by price and return flights
  const flights: FlightsByPrice[] = groupFlightsByPrice(allDepartureFlights, groupReturnFlights);

  // Order departureflights by price
  return flights.sort((firstFlight, secondFlight) => firstFlight.price - secondFlight.price);
}

export async function getAndFormatFlights(
  departureAirport: string,
  arrivalAirport: string,
  departureDate: string,
  returnDate: string,
  tripType: string,
): Promise<FlightsByPrice[]> {
  if (tripType === 'OW') {
    return await getOneWayFlights({ departureAirport, departureDate, arrivalAirport });
  } else if (tripType === 'R') {
    return await getTwoWayFlights({ departureAirport, departureDate, arrivalAirport, returnDate });
  } else {
    throw new HttpError(HttpStatus.BAD_REQUEST, ErrorCode.INVALID_TRIP_TYPE, 'Invalid trip type', { tripType });
  }
}
