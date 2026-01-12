// src/services/api.ts
// API service for railway booking system

const API_BASE_URL = 'http://localhost:8080/api';

// ===========================================
// TYPES
// ===========================================

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface Trip {
  id: number;
  departureTime: string;
  status: string;
  totalTickets: number;
  route: {
    id: number;
    name: string;
    totalKilometers: number;
  };
  train: {
    id: number;
    name: string;
    trainType: {
      id: number;
      name: string;
      pricingType: string;
    };
  };
  departureStation: {
    id: number;
    name: string;
    address: string;
  };
  arrivalStation: {
    id: number;
    name: string;
    address: string;
  };
  estimatedArrivalTime?: string;
}

export interface TripDetail {
  trip: Trip;
  carriages: Carriage[];
  availableSeats: number;
  availableBeds: number;
}

export interface Carriage {
  id: number;
  carriageNumber: number;
  carriageType: string;
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
  floorLevel: number;
  roomId: number;
  roomNumber: number;
  carriageId: number;
  isAvailable: boolean;
}

export interface CarriageSeatsResponse {
  seats: Seat[];
  beds: Bed[];
  totalPages: number;
  currentPage: number;
  totalElements: number;
}

export interface BookingRequest {
  tripId: number;
  carriageId: number;
  ticketType: 'SEAT' | 'BED';
  seatId?: number;
  bedId?: number;
  customerId: number;
}

export interface BookingResponse {
  ticketId: number;
  tripId: number;
  status: string;
  bookingTime: string;
  paymentDeadline: string;
}

export interface CustomerTicket {
  id: number;
  tripId: number;
  status: string;
  ticketPrice: number;
  bookingTime: string;
  departureTime: string;
  departureStation: string;
  arrivalStation: string;
  trainName: string;
  carriageNumber: number;
  ticketType: 'SEAT' | 'BED';
  seatNumber?: number;
  bedNumber?: number;
  floorLevel?: number;
  roomNumber?: number;
}

export interface PriceResponse {
  basePrice: number;
  surcharge: number;
  totalPrice: number;
}

// ===========================================
// HELPER FUNCTIONS
// ===========================================

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Network error' }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }
  const json = await response.json();
  return json.data !== undefined ? json.data : json;
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(price);
}

// ===========================================
// API FUNCTIONS
// ===========================================

export async function getTrips(params?: { status?: string; search?: string }): Promise<Trip[]> {
  const searchParams = new URLSearchParams();
  if (params?.status) searchParams.append('status', params.status);
  if (params?.search) searchParams.append('search', params.search);
  
  const url = `${API_BASE_URL}/trips${searchParams.toString() ? `?${searchParams}` : ''}`;
  const response = await fetch(url);
  return handleResponse<Trip[]>(response);
}

export async function getTripDetail(tripId: number): Promise<TripDetail> {
  const response = await fetch(`${API_BASE_URL}/trips/${tripId}`);
  return handleResponse<TripDetail>(response);
}

export async function getCarriages(tripId: number): Promise<Carriage[]> {
  const response = await fetch(`${API_BASE_URL}/trips/${tripId}/carriages`);
  return handleResponse<Carriage[]>(response);
}

export async function getCarriageSeats(
  tripId: number,
  carriageNumber: number,
  params?: { ticketType?: string; page?: number; size?: number }
): Promise<CarriageSeatsResponse> {
  const searchParams = new URLSearchParams();
  if (params?.ticketType) searchParams.append('ticketType', params.ticketType);
  if (params?.page !== undefined) searchParams.append('page', params.page.toString());
  if (params?.size !== undefined) searchParams.append('size', params.size.toString());
  
  const url = `${API_BASE_URL}/trips/${tripId}/carriages/${carriageNumber}/seats${searchParams.toString() ? `?${searchParams}` : ''}`;
  const response = await fetch(url);
  return handleResponse<CarriageSeatsResponse>(response);
}

export async function bookTicket(request: BookingRequest): Promise<BookingResponse> {
  const response = await fetch(`${API_BASE_URL}/booking`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });
  return handleResponse<BookingResponse>(response);
}

export async function calculatePrice(
  tripId: number,
  ticketType: 'SEAT' | 'BED',
  floorLevel?: number
): Promise<PriceResponse> {
  const searchParams = new URLSearchParams();
  searchParams.append('tripId', tripId.toString());
  searchParams.append('ticketType', ticketType);
  if (floorLevel !== undefined) searchParams.append('floorLevel', floorLevel.toString());
  
  const response = await fetch(`${API_BASE_URL}/booking/price?${searchParams}`);
  return handleResponse<PriceResponse>(response);
}

export async function getCustomerTickets(customerId: number): Promise<CustomerTicket[]> {
  const response = await fetch(`${API_BASE_URL}/tickets/customer/${customerId}`);
  return handleResponse<CustomerTicket[]>(response);
}

export async function getAccountTickets(accountId: number): Promise<CustomerTicket[]> {
  const response = await fetch(`${API_BASE_URL}/tickets/account/${accountId}`);
  return handleResponse<CustomerTicket[]>(response);
}
