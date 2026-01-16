import api from "./api";
import type { ApiResponse } from "../types/api";
import type {
  BookTicketRequest,
  CancelTicketRequest,
  ConcurrencyDemoResponse,
} from "../types/concurrency";

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
};
