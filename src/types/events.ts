export type SeatStatus = 'available' | 'selected' | 'occupied' | 'reserved';

export type SeatCategory = 'vip' | 'premium' | 'standard' | 'balcony';

export interface Seat {
  id: string;
  row: string;
  number: number;
  category: SeatCategory;
  status: SeatStatus;
  price: number;
}

export interface Event {
  id: string;
  title: string;
  artist: string;
  date: string;
  time: string;
  venue: string;
  image: string;
  description: string;
  totalSeats: number;
  availableSeats: number;
}

export interface Reservation {
  eventId: string;
  seats: Seat[];
  totalPrice: number;
  customerName: string;
  customerEmail: string;
  timestamp: Date;
}

