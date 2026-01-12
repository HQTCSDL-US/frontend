// src/services/api.ts
// API service for railway booking system

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:9000/api';

// ===========================================
// TYPES
// ===========================================

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
  error?: string;
}

// Trip List Types (matches backend TripListDTO)
export interface TripListDTO {
  tripId: number;
  departureTime: string;
  status: string;
  totalTickets: number;
  
  // Train info
  trainId: number;
  trainName: string;
  trainTypeId: number;
  trainTypeName: string;
  pricingType: string;
  
  // Route info
  routeId: number;
  routeName: string;
  totalKilometers: number;
  
  // Stations
  departureStationId: number;
  departureStationName: string;
  arrivalStationId: number;
  arrivalStationName: string;
  
  estimatedArrivalTime: string;
  
  // Availability
  availableSeats: number;
  availableBeds: number;
  totalAvailablePlaces: number;
}

export interface TripListSummaryDTO {
  totalTrips: number;
  scheduledTrips: number;
  enrouteTrips: number;
  completedTrips: number;
  cancelledTrips: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

export interface TripListResponse {
  trips: TripListDTO[];
  summary: TripListSummaryDTO;
}

// Trip Details Types (matches backend TripDetailsResponse)
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
  carriageCategory: 'Seat' | 'Sleeper';
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

export interface TripDetailsResponse {
  tripInfo: TripInfo;
  carriages: CarriageInfo[];
  seats: SeatInfo[];
  beds: BedInfo[];
  pagination: CarriagePagination;
}

// Legacy types for backward compatibility
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

class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public data?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Network error' }));
    throw new ApiError(response.status, error.message || `HTTP error! status: ${response.status}`, error);
  }
  const json = await response.json();
  return json.data !== undefined ? json.data : json;
}

async function handleApiResponse<T>(response: Response): Promise<ApiResponse<T>> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Network error' }));
    throw new ApiError(response.status, error.message || `HTTP error! status: ${response.status}`, error);
  }
  return response.json();
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(price);
}

export function formatTime(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
}

export function formatDate(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleDateString('vi-VN', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function formatDateTime(isoString: string): string {
  return `${formatDate(isoString)} ${formatTime(isoString)}`;
}

// ===========================================
// TRIP LIST API (NEW - uses stored procedure)
// ===========================================

export interface GetTripsParams {
  status?: string | null;
  search?: string;
  page?: number;
  size?: number;
}

/**
 * Get all trips with filtering and pagination
 * GET /api/trips?status=scheduled&search=Hà Nội&page=1&size=10
 */
export async function getTripList(params?: GetTripsParams): Promise<TripListResponse> {
  const searchParams = new URLSearchParams();
  
  if (params?.status && params.status !== 'ALL') {
    searchParams.append('status', params.status.toLowerCase());
  }
  if (params?.search) searchParams.append('search', params.search);
  if (params?.page) searchParams.append('page', params.page.toString());
  if (params?.size) searchParams.append('size', params.size.toString());
  
  const queryString = searchParams.toString();
  const url = `${API_BASE_URL}/trips${queryString ? `?${queryString}` : ''}`;
  
  const response = await fetch(url);
  const apiResponse = await handleApiResponse<TripListResponse>(response);
  return apiResponse.data;
}

/**
 * Get scheduled trips only
 */
export async function getScheduledTrips(search?: string, page = 1, size = 10): Promise<TripListResponse> {
  return getTripList({ status: 'scheduled', search, page, size });
}

/**
 * Get completed trips only
 */
export async function getCompletedTrips(search?: string, page = 1, size = 10): Promise<TripListResponse> {
  return getTripList({ status: 'completed', search, page, size });
}

// ===========================================
// TRIP DETAILS API (NEW - uses stored procedure)
// ===========================================

export interface GetTripDetailsParams {
  tripId: number;
  carriage?: number;
  ticketType?: 'SEAT' | 'BED';
  page?: number;
  size?: number;
}

/**
 * Get trip details with carriages and seats/beds
 * GET /api/trips/{tripId}/details?carriage=1&page=1&size=32
 */
export async function getTripDetails(params: GetTripDetailsParams): Promise<TripDetailsResponse> {
  const { tripId, carriage = 1, ticketType, page = 1, size = 32 } = params;
  
  const searchParams = new URLSearchParams();
  searchParams.append('carriage', carriage.toString());
  if (ticketType) searchParams.append('ticketType', ticketType);
  searchParams.append('page', page.toString());
  searchParams.append('size', size.toString());
  
  const response = await fetch(`${API_BASE_URL}/trips/${tripId}/details?${searchParams}`);
  const apiResponse = await handleApiResponse<TripDetailsResponse>(response);
  return apiResponse.data;
}

/**
 * Get seats for a specific carriage
 */
export async function getCarriageSeatsNew(
  tripId: number,
  carriageNumber: number,
  page = 1,
  size = 32
): Promise<TripDetailsResponse> {
  const response = await fetch(
    `${API_BASE_URL}/trips/${tripId}/carriages/${carriageNumber}/seats?page=${page}&size=${size}`
  );
  const apiResponse = await handleApiResponse<TripDetailsResponse>(response);
  return apiResponse.data;
}

/**
 * Get beds for a specific carriage
 */
export async function getCarriageBeds(
  tripId: number,
  carriageNumber: number,
  page = 1,
  size = 32
): Promise<TripDetailsResponse> {
  const response = await fetch(
    `${API_BASE_URL}/trips/${tripId}/carriages/${carriageNumber}/beds?page=${page}&size=${size}`
  );
  const apiResponse = await handleApiResponse<TripDetailsResponse>(response);
  return apiResponse.data;
}

// ===========================================
// LEGACY API FUNCTIONS (for backward compatibility)
// ===========================================

export async function getTrips(params?: { status?: string; search?: string }): Promise<Trip[]> {
  // Convert to new API and transform response
  const response = await getTripList({
    status: params?.status,
    search: params?.search,
  });
  
  // Transform TripListDTO[] to Trip[]
  return response.trips.map(transformTripListDTOToTrip);
}

function transformTripListDTOToTrip(dto: TripListDTO): Trip {
  return {
    id: dto.tripId,
    departureTime: dto.departureTime,
    status: dto.status,
    totalTickets: dto.totalTickets,
    route: {
      id: dto.routeId,
      name: dto.routeName,
      totalKilometers: dto.totalKilometers,
    },
    train: {
      id: dto.trainId,
      name: dto.trainName,
      trainType: {
        id: dto.trainTypeId,
        name: dto.trainTypeName,
        pricingType: dto.pricingType,
      },
    },
    departureStation: {
      id: dto.departureStationId,
      name: dto.departureStationName,
      address: '',
    },
    arrivalStation: {
      id: dto.arrivalStationId,
      name: dto.arrivalStationName,
      address: '',
    },
    estimatedArrivalTime: dto.estimatedArrivalTime,
  };
}

export async function getTripDetail(tripId: number): Promise<TripDetailsResponse> {
  return getTripDetails({ tripId, carriage: 1 });
}

export async function getCarriages(tripId: number): Promise<CarriageInfo[]> {
  const response = await getTripDetails({ tripId });
  return response.carriages;
}

export async function getCarriageSeats(
  tripId: number,
  carriageNumber: number,
  params?: { ticketType?: string; page?: number; size?: number }
): Promise<{ seats: SeatInfo[]; beds: BedInfo[]; totalPages: number; currentPage: number }> {
  const response = await getTripDetails({
    tripId,
    carriage: carriageNumber,
    ticketType: params?.ticketType as 'SEAT' | 'BED',
    page: params?.page,
    size: params?.size,
  });
  
  return {
    seats: response.seats,
    beds: response.beds,
    totalPages: response.pagination.totalPages,
    currentPage: response.pagination.currentPage,
  };
}

// ===========================================
// BOOKING API
// ===========================================

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