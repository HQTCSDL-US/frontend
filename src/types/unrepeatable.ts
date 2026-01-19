// Batch Booking Types for Unrepeatable Read Demo

export interface BatchBookingRequest {
    customerId: number;
    tripId: number;
    departureStationId: number;
    arrivalStationId: number;
    ticketCount: number; // 1-4
    seatIds: number[]; // Array of place IDs to book
}

export interface TicketInfo {
    ticketId: number;
    price: number;
    appliedPricingRuleId: number;
}

export interface BatchBookingResponse {
    tickets: TicketInfo[];
    totalPrice: number;
    hasDiscrepancy: boolean; // true if prices differ
    message: string;
    success: boolean;
}

// Pricing Rule Types

export interface PricingRuleDto {
    id?: number;
    pricePerKilometer: number;
    luxuryTrainSurcharge: number;
    firstFloorBedSurcharge: number;
    secondFloorBedSurcharge: number;
    effectiveDate: string; // ISO date string
    isActive?: boolean;
}
