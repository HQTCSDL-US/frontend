// Railway system types based on the database schema

export interface TrainStation {
  id: number;
  name: string;
  address: string;
}

export interface Route {
  id: number;
  name: string;
  description: string;
  totalKilometers: number;
}

export interface TrainType {
  id: number;
  name: string;
  description: string;
  pricingType: 'STANDARD' | 'LUXURY';
}

export interface Train {
  id: number;
  name: string;
  operatingDate: string;
  trainType: TrainType;
}

export interface Trip {
  id: number;
  departureTime: string;
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
  totalTickets: number;
  route: Route;
  train: Train;
  departureStation: TrainStation;
  arrivalStation: TrainStation;
  estimatedArrivalTime: string;
}

export interface CarriageType {
  id: number;
  name: string;
  description: string;
}

export interface Carriage {
  id: number;
  carriageNumber: number;
  carriageType: CarriageType;
  trainId: number;
}

export interface Seat {
  id: number;
  seatNumber: number;
  carriageId: number;
  isAvailable: boolean;
}

export interface Bed {
  id: number;
  bedNumber: number;
  floorLevel: 1 | 2;
  roomId: number;
  roomNumber: number;
  carriageId: number;
  isAvailable: boolean;
}

export type TicketType = 'SEAT' | 'BED';

export interface TicketInfo {
  tripId: number;
  carriageId: number;
  carriageNumber: number;
  ticketType: TicketType;
  price: number;
  seatOrBedNumber: number;
  floorLevel?: number;
  roomNumber?: number;
}

export interface BookedTicket {
  id: number;
  tripId: number;
  tripName: string;
  departureStation: string;
  arrivalStation: string;
  departureTime: string;
  carriageNumber: number;
  ticketType: TicketType;
  seatOrBedNumber: number;
  price: number;
  status: 'BOOKED' | 'PAID' | 'CANCELLED';
  bookingTime: string;
}

export interface TripDetail {
  trip: Trip;
  carriages: Carriage[];
  availableSeats: number;
  availableBeds: number;
}

export interface CarriageSeats {
  carriage: Carriage;
  seats: Seat[];
  beds: Bed[];
}
