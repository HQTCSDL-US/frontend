export interface TicketListItem {
  ticketId: number;
  tripId: number;
  tripName: string;
  departureTime: string;
  seatNumber: string | null;
  roomNumber: number | null;
  bedNumber: number | null;
  floorLevel: number | null;
  carriageNumber: number;
  carriageTypeName: string;
  ticketType: "SEAT" | "BED";
  price: number;
  status: "unpaid" | "paid" | "cancelled";
  bookingDate: string;
}

export interface TicketDetails {
  ticketId: number;
  status: string;
  price: number;
  bookingDate: string;
  trip: {
    tripId: number;
    trainName: string;
    routeName: string;
    departureStation: string;
    arrivalStation: string;
    departureTime: string;
    arrivalTime: string;
  };
  seat: {
    seatNumber: string;
    carriageNumber: number;
    carriageType: string;
    floor: number | null;
  };
  customer: {
    customerId: number;
    fullName: string;
    customerType: string;
    discountPercentage: number;
  };
  pricing: {
    basePrice: number;
    discount: number;
    finalPrice: number;
  };
}
