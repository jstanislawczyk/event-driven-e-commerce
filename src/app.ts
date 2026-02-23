import express, { type Express } from 'express';
import {
  jsonEvent,
  FORWARDS,
  START,
  type JSONEventType,
} from '@kurrent/kurrentdb-client';
import { buildOrderRoutes } from './modules/ordering/infrastructure/http/routes/order.routes.ts';
import { getKurrentClient } from './modules/ordering/infrastructure/database/clients/kurrent.ts';

export async function createApp(): Promise<Express> {
  const app = express();
  const orderRoutes = await buildOrderRoutes();

  app.use(express.json());
  app.use('/orders', orderRoutes);
  return app;
}

const appendToStream = async () => {
  const client = await getKurrentClient();

  interface Reservation {
    reservationId: string;
    movieId: string;
    userId: string;
    seatId: string;
  }

  type SeatReservedEvent = JSONEventType<
    'seat-reserved',
    {
      reservationId: string;
      movieId: string;
      userId: string;
      seatId: string;
    }
  >;

  type SeatChangedEvent = JSONEventType<
    'seat-changed',
    {
      reservationId: string;
      newSeatId: string;
    }
  >;

  type ReservationEvents = SeatReservedEvent | SeatChangedEvent;

  const streamName = 'booking-abc123';

  const event = jsonEvent<SeatReservedEvent>({
    type: 'seat-reserved',
    data: {
      reservationId: 'abc123',
      movieId: 'tt0368226',
      userId: 'nm0802995',
      seatId: '4b',
    },
  });

  const appendResult = await client.appendToStream<ReservationEvents>(
    streamName,
    event,
  );

  console.log('Appended event', appendResult);

  const events = client.readStream<ReservationEvents>(streamName, {
    fromRevision: START,
    direction: FORWARDS,
    maxCount: 10,
  });

  const reservation: Partial<Reservation> = {};

  for await (const { event } of events) {
    if (!event) {
      console.log('No more events to read');
      continue;
    }

    switch (event.type) {
      case 'seat-reserved': {
        reservation.reservationId = event.data.reservationId;
        reservation.movieId = event.data.movieId;
        reservation.seatId = event.data.seatId;
        reservation.userId = event.data.userId;
        break;
      }
      case 'seat-changed': {
        reservation.seatId = event.data.newSeatId;
        break;
      }
      default: {
        console.log(`Unknown event type: ${event}`);
        break;
      }
    }
  }
};
