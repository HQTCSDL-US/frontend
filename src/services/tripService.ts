import api from "./api";
import type { ApiResponse } from "../types/api";
import type { TripListItem, TripDetails, AvailableTicket } from "../types/trip";

export const tripService = {
  getTrips: async (params?: {
    fromStation?: string;
    toStation?: string;
    departureDate?: string;
    status?: string;
    search?: string;
    page?: number;
    size?: number;
  }) => {
    const response = await api.get<
      ApiResponse<{
        trips: TripListItem[];
        summary: Record<string, unknown>;
      }>
    >("/trips", { params });
    return response.data;
  },

  getTripDetails: async (tripId: number, carriage: number = 1) => {
    const response = await api.get<ApiResponse<TripDetails>>(
      `/trips/${tripId}/details`,
      {
        params: { carriage, pageSize: 100 },
      }
    );
    return response.data;
  },

  getAvailableTickets: async (
    tripId: number,
    params?: {
      carriageNumber?: number;
      ticketType?: string;
      page?: number;
      size?: number;
      includePrice?: boolean;
    }
  ) => {
    const response = await api.get<
      ApiResponse<{
        tickets: AvailableTicket[];
        summary: Record<string, unknown>;
      }>
    >(`/trips/${tripId}/available-tickets`, {
      params: { size: 100, ...params, includePrice: true },
    });
    return response.data;
  },
};
