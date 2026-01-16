import api from "./api";
import type { ApiResponse } from "../types/api";
import type { TicketListItem, TicketDetails } from "../types/ticket";

export const ticketService = {
  getMyTickets: async (
    page: number = 1,
    size: number = 20,
    status?: string
  ) => {
    const response = await api.get<
      ApiResponse<{
        data: TicketListItem[];
        pagination: {
          currentPage: number;
          totalPages: number;
          totalItems: number;
          pageSize: number;
        };
      }>
    >("/customers/me/tickets", {
      params: { page, size, status },
    });
    return response.data;
  },

  getTicketDetails: async (ticketId: number) => {
    const response = await api.get<ApiResponse<TicketDetails>>(
      `/tickets/${ticketId}`
    );
    return response.data;
  },
};
