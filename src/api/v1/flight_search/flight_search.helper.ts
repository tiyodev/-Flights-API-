import { FlightBySupplier, FlightSuppliersInterface } from './../flight_supplier/flight_supplier.entity';
import { FlightWithPrice, FlightsByPrice, Flight } from '../flight/flight.entity';
import FlightSupplier from '../flight_supplier/flight_suplier';
import Logger from '../logger/logger';

function filterReturnFlightByArrivalDateAndMergeByPrice(
  arrivalTime: Date,
  returnFlights: FlightsByPrice[],
): FlightsByPrice[] | undefined {
  if (!returnFlights) return undefined;

  const filteredReturnFlights: FlightsByPrice[] = returnFlights.reduce((acc: FlightsByPrice[], cur: FlightsByPrice) => {
    // departure time of return flights must be after departure time of the departure flight
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

  return filteredReturnFlights.sort((firstFlight, secondFlight) => firstFlight.price - secondFlight.price);
}

function mergeFlightsByPriceAndOrderByPriceAndDate(
  departureFlights: FlightWithPrice[],
  returnFlights?: FlightsByPrice[],
): FlightsByPrice[] {
  if (!departureFlights) return;

  // Group flights by price
  const flightsByPrice: FlightsByPrice[] = departureFlights.reduce((acc: FlightsByPrice[], cur: FlightWithPrice) => {
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
            returnFlights: filterReturnFlightByArrivalDateAndMergeByPrice(cur.arrivalTime, returnFlights),
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
            returnFlights: filterReturnFlightByArrivalDateAndMergeByPrice(cur.arrivalTime, returnFlights),
          },
        ],
      },
    ];
    return acc;
  }, []);

  return flightsByPrice.sort((firstFlight, secondFlight) => firstFlight.price - secondFlight.price);
}

async function getFlightsFromAllSupplier({
  departureAirport,
  arrivalAirport,
  departureDate,
}: {
  departureAirport: string;
  arrivalAirport: string;
  departureDate: string;
}): Promise<FlightBySupplier[]> {
  Logger.logDebug(`Search all flights from ${departureAirport} to ${arrivalAirport} at ${departureDate}`);
  return await Promise.all(
    FlightSupplier.getAllFlightSupplier().map((supplier: FlightSuppliersInterface) =>
      supplier.request({ departureAirport, arrivalAirport, departureDate }),
    ),
  );
}

function concatFlightsFromMultipleSupplier(flightRequestResults: FlightBySupplier[]): FlightWithPrice[] {
  return flightRequestResults.reduce((acc: FlightWithPrice[], cur: FlightBySupplier) => {
    acc = acc.concat(...cur.flights);
    return acc;
  }, []);
}

export {
  mergeFlightsByPriceAndOrderByPriceAndDate,
  filterReturnFlightByArrivalDateAndMergeByPrice,
  getFlightsFromAllSupplier,
  concatFlightsFromMultipleSupplier,
};
