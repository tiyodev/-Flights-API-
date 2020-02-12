import { FlightWithPrice } from '../entity/flight.entity';
import axios, { AxiosResponse } from 'axios';

export type FlightBySupplier = {
  supplierName: string;
  flights: FlightWithPrice[];
};

interface FlightSuppliers {
  name: string;
  request: ({
    supplierName,
    departureAirport,
    arrivalAirport,
    departureDate,
  }: {
    supplierName: string;
    departureAirport: string;
    arrivalAirport: string;
    departureDate: string;
  }) => Promise<FlightBySupplier>;
}

function formatJazzFlights(data: any): FlightWithPrice[] {
  console.log('YBO JAZZ format');
  if (!data) return;

  if (data instanceof Array) {
    return data.reduce((acc: FlightWithPrice[], cur: any) => {
      return [
        ...acc,
        {
          id: cur?.flight?.id,
          price: cur?.price,
          departureAirport: cur?.flight?.departure_airport,
          arrivalAirport: cur?.flight?.arrival_airport,
          departureTime: cur?.flight?.departure_time,
          arrivalTime: cur?.flight?.arrival_time,
        },
      ];
    }, []);
  }

  return;
}

async function getAirJazzFlights({
  supplierName,
  departureAirport,
  arrivalAirport,
  departureDate,
}: {
  supplierName: string;
  departureAirport: string;
  arrivalAirport: string;
  departureDate: string;
}): Promise<FlightBySupplier> {
  console.log('YBO JAZZ get');
  try {
    const response: AxiosResponse = await axios.get(
      `${process.env.AIR_JAZZ_SUPPLIER_URL}?departure_airport=${departureAirport}&arrival_airport=${arrivalAirport}&departure_date=${departureDate}`,
    );
    return { supplierName, flights: formatJazzFlights(response.data) };
  } catch (err) {
    console.error(err);
    // TODO throw an error
    throw new Error();
  }
}

function formatMoonFlights(data: any): FlightWithPrice[] {
  console.log('YBO MOON format');
  if (!data) return;

  if (data instanceof Array) {
    return data.reduce((acc: FlightWithPrice[], cur: any) => {
      return [
        ...acc,
        {
          id: cur?.legs[0]?.id,
          price: cur?.price,
          departureAirport: cur?.legs[0]?.departure_airport,
          arrivalAirport: cur?.legs[0]?.arrival_airport,
          departureTime: cur?.legs[0]?.departure_time,
          arrivalTime: cur?.legs[0]?.arrival_time,
        },
      ];
    }, []);
  }

  return null;
}

async function getAirMoonFlights({
  supplierName,
  departureAirport,
  arrivalAirport,
  departureDate,
}: {
  supplierName: string;
  departureAirport: string;
  arrivalAirport: string;
  departureDate: string;
}): Promise<FlightBySupplier> {
  console.log('YBO MOON get');
  try {
    const response: AxiosResponse = await axios.get(
      `${process.env.AIR_MOON_SUPPLIER_URL}?departure_airport=${departureAirport}&arrival_airport=${arrivalAirport}&departure_date=${departureDate}`,
    );
    return { supplierName, flights: formatMoonFlights(response.data) };
  } catch (err) {
    console.error(err);
    // TODO throw an error
    throw new Error();
  }
}

const getFlightsSuppliers: FlightSuppliers[] = [
  {
    name: 'jazz',
    request: getAirJazzFlights,
  },
  {
    name: 'moon',
    request: getAirMoonFlights,
  },
];

export { FlightSuppliers, getFlightsSuppliers };
