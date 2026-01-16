export interface TripListItem {
  tripId: number;
  departureTime: string;
  status: "scheduled" | "completed" | "cancelled";
  totalTickets: number;
  trainId: number;
  trainName: string;
  trainTypeId: number;
  trainTypeName: string;
  pricingType: "STANDARD" | "LUXURY";
  routeId: number;
  routeName: string;
  totalKilometers: number;
  departureStationId: number;
  departureStationName: string;
  arrivalStationId: number;
  arrivalStationName: string;
  estimatedArrivalTime: string;
  availableSeats: number;
  availableBeds: number;
  totalAvailablePlaces: number;
}

export interface TripListSummary {
  totalTrips: number;
  availableSeats: number;
  availableBeds: number;
}

export interface TripInfo {
  tripId: number;
  departureTime: string;
  status: string;
  totalTickets: number;
  trainId: number;
  trainName: string;
  trainTypeId: number;
  trainTypeName: string;
  pricingType: string;
  routeId: number;
  routeName: string;
  totalKilometers: number;
  departureStationId: number;
  departureStationName: string;
  arrivalStationId: number;
  arrivalStationName: string;
  estimatedArrivalTime: string;
  totalAvailableSeats: number;
  totalAvailableBeds: number;
}

export interface CarriageInfo {
  carriageId: number;
  carriageNumber: number;
  carriageTypeId: number;
  carriageTypeName: string;
  carriageCategory: "Seat" | "Sleeper" | "Other";
  availableSeats: number;
  availableBeds: number;
}

export interface SeatInfo {
  seatId: number;
  seatNumber: number;
  carriageId: number;
  carriageNumber: number;
  isAvailable: boolean;
}

export interface BedInfo {
  bedId: number;
  bedNumber: number;
  floorLevel: number;
  roomId: number;
  roomNumber: number;
  carriageId: number;
  carriageNumber: number;
  isAvailable: boolean;
}

export interface CarriagePagination {
  carriageNumber: number;
  totalSeats: number;
  totalBeds: number;
  availableSeats: number;
  availableBeds: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

export interface TripDetails {
  tripInfo: TripInfo;
  carriages: CarriageInfo[];
  seats: SeatInfo[];
  beds: BedInfo[];
  pagination: CarriagePagination;
}

export interface AvailableTicket {
  placeId: number;
  ticketType: "SEAT" | "BED";
  carriageId: number;
  carriageNumber: number;
  carriageTypeName: string;
  seatNumber: number;
  bedNumber: number;
  floorLevel: number;
  roomId: number;
  roomNumber: number;
  isAvailable: boolean;
  basePrice: number;
  surcharge: number;
  totalPrice: number;
}
