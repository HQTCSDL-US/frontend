// src/hooks/useRailwayApi.ts
// React Query hooks for railway booking API

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getTrips,
  getTripDetail,
  getCarriages,
  getCarriageSeats,
  bookTicket,
  calculatePrice,
  getCustomerTickets,
  getAccountTickets,
} from '@/services/api';

// Query keys
export const queryKeys = {
  trips: ['trips'],
  tripDetail: (tripId: number) => ['trips', tripId],
  carriages: (tripId: number) => ['trips', tripId, 'carriages'],
  carriageSeats: (tripId: number, carriageNumber: number, ticketType: string, page: number) =>
    ['trips', tripId, 'carriages', carriageNumber, 'seats', ticketType, page],
  customerTickets: (customerId: number) => ['tickets', 'customer', customerId],
  accountTickets: (accountId: number) => ['tickets', 'account', accountId],
  price: (tripId: number, ticketType: string, floorLevel?: number) =>
    ['price', tripId, ticketType, floorLevel],
};

// ===========================================
// TRIP HOOKS
// ===========================================

interface UseTripsParams {
  status?: string;
  search?: string;
}

export function useTrips(params?: UseTripsParams) {
  return useQuery({
    queryKey: [...queryKeys.trips, params],
    queryFn: () => getTrips(params),
    staleTime: 30000,
  });
}

export function useTripDetail(tripId: number | undefined) {
  return useQuery({
    queryKey: tripId ? queryKeys.tripDetail(tripId) : ['trips', 'none'],
    queryFn: () => getTripDetail(tripId!),
    enabled: !!tripId,
    staleTime: 10000,
  });
}

// ===========================================
// CARRIAGE HOOKS
// ===========================================

export function useCarriages(tripId: number | undefined) {
  return useQuery({
    queryKey: tripId ? queryKeys.carriages(tripId) : ['carriages', 'none'],
    queryFn: () => getCarriages(tripId!),
    enabled: !!tripId,
    staleTime: 60000,
  });
}

interface UseCarriageSeatsParams {
  tripId: number;
  carriageNumber: number;
  ticketType: 'SEAT' | 'BED';
  page?: number;
  size?: number;
}

export function useCarriageSeats(params: UseCarriageSeatsParams | null) {
  return useQuery({
    queryKey: params
      ? queryKeys.carriageSeats(
          params.tripId,
          params.carriageNumber,
          params.ticketType,
          params.page || 0
        )
      : ['carriageSeats', 'none'],
    queryFn: () =>
      getCarriageSeats(params!.tripId, params!.carriageNumber, {
        ticketType: params!.ticketType,
        page: params!.page,
        size: params!.size,
      }),
    enabled: !!params,
    staleTime: 5000,
    refetchInterval: 30000,
  });
}

// ===========================================
// BOOKING HOOKS
// ===========================================

export function useBookTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: bookTicket,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.trips });
      queryClient.invalidateQueries({
        queryKey: queryKeys.tripDetail(data.tripId),
      });
      queryClient.invalidateQueries({
        queryKey: ['trips', data.tripId, 'carriages'],
      });
    },
  });
}

export function useTicketPrice(
  tripId: number | undefined,
  ticketType: 'SEAT' | 'BED' | undefined,
  floorLevel?: number
) {
  return useQuery({
    queryKey:
      tripId && ticketType
        ? queryKeys.price(tripId, ticketType, floorLevel)
        : ['price', 'none'],
    queryFn: () => calculatePrice(tripId!, ticketType!, floorLevel),
    enabled: !!tripId && !!ticketType,
    staleTime: 60000,
  });
}

export function useCustomerTickets(customerId: number | undefined) {
  return useQuery({
    queryKey: customerId
      ? queryKeys.customerTickets(customerId)
      : ['tickets', 'none'],
    queryFn: () => getCustomerTickets(customerId!),
    enabled: !!customerId,
    staleTime: 30000,
  });
}

export function useAccountTickets(accountId: number | undefined) {
  return useQuery({
    queryKey: accountId
      ? queryKeys.accountTickets(accountId)
      : ['tickets', 'none'],
    queryFn: () => getAccountTickets(accountId!),
    enabled: !!accountId,
    staleTime: 30000,
  });
}

// ===========================================
// PREFETCH HELPERS
// ===========================================

export function usePrefetchTripDetail() {
  const queryClient = useQueryClient();

  return (tripId: number) => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.tripDetail(tripId),
      queryFn: () => getTripDetail(tripId),
      staleTime: 10000,
    });
  };
}
