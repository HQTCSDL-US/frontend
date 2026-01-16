export interface BookTicketRequest {
  tripId: number;
  seatId: number;
  fromStationId: number;
  toStationId: number;
}

export interface CancelTicketRequest {
  ticketId: number;
}

export interface ConcurrencyDemoResponse {
  message: string;
  success: boolean;
  ticketId?: number;
  finalPrice?: number;
  discountUsed?: number;
}
