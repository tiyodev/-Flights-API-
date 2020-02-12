import { FlightWithPrice, FlightsByPrice, Flight } from '../flight/flight.entity';

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
            returnFlights: this.filterReturnFlightByArrivalDate(cur.arrivalTime, returnFlights),
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
            returnFlights: this.filterReturnFlightByArrivalDate(cur.arrivalTime, returnFlights),
          },
        ],
      },
    ];
    return acc;
  }, []);
}

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

export { groupFlightsByPrice, filterReturnFlightByArrivalDate };
