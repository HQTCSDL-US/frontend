import api from "./api";
import type { ApiResponse } from "../types/api";
import type {
  BookTicketRequest,
  CancelTicketRequest,
  ConcurrencyDemoResponse,
} from "../types/concurrency";
import type { BatchBookingRequest, BatchBookingResponse } from "../types/unrepeatable";

export const concurrencyService = {
  // Scenario 1: Ticket Booking & Cancellation
  cancelTicketUnsafe: async (request: CancelTicketRequest) => {
    const response = await api.post<ApiResponse<ConcurrencyDemoResponse>>(
      "/concurrency/tickets/cancel-unsafe",
      request
    );
    return response.data;
  },

  cancelTicketSafe: async (request: CancelTicketRequest) => {
    const response = await api.post<ApiResponse<ConcurrencyDemoResponse>>(
      "/concurrency/tickets/cancel",
      request
    );
    return response.data;
  },

  bookTicketUnsafe: async (request: BookTicketRequest) => {
    const response = await api.post<ApiResponse<ConcurrencyDemoResponse>>(
      "/concurrency/tickets/book-unsafe",
      request
    );
    return response.data;
  },

  bookTicketSafe: async (request: BookTicketRequest) => {
    const response = await api.post<ApiResponse<ConcurrencyDemoResponse>>(
      "/concurrency/tickets/book",
      request
    );
    return response.data;
  },

  // Scenario 4: Batch Booking (Unrepeatable Read)
  batchBookTicketsUnsafe: async (request: BatchBookingRequest) => {
    const response = await api.post<BatchBookingResponse>(
      "/concurrency/unrepeatable-read/batch-book-unsafe",
      request
    );
    return response.data;
  },

  batchBookTicketsSafe: async (request: BatchBookingRequest) => {
    const response = await api.post<BatchBookingResponse>(
      "/concurrency/unrepeatable-read/batch-book-safe",
      request
    );
    return response.data;
  },
};
