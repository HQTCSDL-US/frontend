export interface RevenueReportRequest {
    tripId: number;
}

export interface RevenueReportResponse {
    tickets: TicketInfo[];           // List of tickets from table variable
    reportedTickets: number;         // Count from table variable
    reportedRevenue: number;         // Total revenue aggregated
    actualTicketsNow: number;        // Current actual count in DB (for phantom detection)
    message: string;
    success: boolean;
}

export interface TicketInfo {
    ticketId: number;
    price: number;
}

export interface PhantomBookingRequest {
    tripId: number;
    customerId?: number;
    departureStationId: number;
    arrivalStationId: number;
    placeId: number;
    isBed: boolean;
}
