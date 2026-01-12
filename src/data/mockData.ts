import { Trip, TripDetail, Carriage, Seat, Bed, BookedTicket, CarriageSeats } from '@/types/railway';

// Mock train stations
const stations = {
  HN: { id: 1, name: 'Hà Nội', address: 'Số 120 Lê Duẩn, Hoàn Kiếm, Hà Nội' },
  SG: { id: 2, name: 'Sài Gòn', address: 'Số 1 Nguyễn Thông, Quận 3, TP.HCM' },
  DN: { id: 3, name: 'Đà Nẵng', address: 'Số 202 Hải Phòng, Thanh Khê, Đà Nẵng' },
  HP: { id: 4, name: 'Hải Phòng', address: 'Số 75 Lương Khánh Thiện, Hải Phòng' },
  HUE: { id: 5, name: 'Huế', address: 'Số 2 Bùi Thị Xuân, TP Huế' },
};

// Mock trips
export const mockTrips: Trip[] = [
  {
    id: 1,
    departureTime: '2026-01-12T10:00:00',
    status: 'SCHEDULED',
    totalTickets: 200,
    route: { id: 1, name: 'HN-SG Express', description: 'Hanoi to Saigon', totalKilometers: 1726 },
    train: { id: 1, name: 'SE1', operatingDate: '2020-01-01', trainType: { id: 1, name: 'Express', description: 'High-speed express train', pricingType: 'LUXURY' } },
    departureStation: stations.HN,
    arrivalStation: stations.SG,
    estimatedArrivalTime: '2026-01-13T06:00:00',
  },
  {
    id: 2,
    departureTime: '2026-01-12T14:30:00',
    status: 'SCHEDULED',
    totalTickets: 180,
    route: { id: 2, name: 'HN-DN Express', description: 'Hanoi to Da Nang', totalKilometers: 791 },
    train: { id: 2, name: 'SE3', operatingDate: '2021-03-15', trainType: { id: 2, name: 'Standard', description: 'Standard train', pricingType: 'STANDARD' } },
    departureStation: stations.HN,
    arrivalStation: stations.DN,
    estimatedArrivalTime: '2026-01-12T23:00:00',
  },
  {
    id: 3,
    departureTime: '2026-01-11T08:00:00',
    status: 'COMPLETED',
    totalTickets: 150,
    route: { id: 3, name: 'SG-DN Express', description: 'Saigon to Da Nang', totalKilometers: 935 },
    train: { id: 3, name: 'SE5', operatingDate: '2019-06-20', trainType: { id: 1, name: 'Express', description: 'High-speed express train', pricingType: 'LUXURY' } },
    departureStation: stations.SG,
    arrivalStation: stations.DN,
    estimatedArrivalTime: '2026-01-11T20:00:00',
  },
  {
    id: 4,
    departureTime: '2026-01-13T06:00:00',
    status: 'SCHEDULED',
    totalTickets: 120,
    route: { id: 4, name: 'HN-HP Local', description: 'Hanoi to Hai Phong', totalKilometers: 102 },
    train: { id: 4, name: 'LP1', operatingDate: '2022-08-10', trainType: { id: 2, name: 'Standard', description: 'Standard train', pricingType: 'STANDARD' } },
    departureStation: stations.HN,
    arrivalStation: stations.HP,
    estimatedArrivalTime: '2026-01-13T08:30:00',
  },
  {
    id: 5,
    departureTime: '2026-01-10T22:00:00',
    status: 'COMPLETED',
    totalTickets: 200,
    route: { id: 5, name: 'DN-HUE Scenic', description: 'Da Nang to Hue', totalKilometers: 103 },
    train: { id: 5, name: 'SE7', operatingDate: '2023-02-14', trainType: { id: 1, name: 'Express', description: 'High-speed express train', pricingType: 'LUXURY' } },
    departureStation: stations.DN,
    arrivalStation: stations.HUE,
    estimatedArrivalTime: '2026-01-11T01:30:00',
  },
  {
    id: 6,
    departureTime: '2026-01-14T16:00:00',
    status: 'SCHEDULED',
    totalTickets: 180,
    route: { id: 1, name: 'SG-HN Express', description: 'Saigon to Hanoi', totalKilometers: 1726 },
    train: { id: 6, name: 'SE2', operatingDate: '2020-01-01', trainType: { id: 1, name: 'Express', description: 'High-speed express train', pricingType: 'LUXURY' } },
    departureStation: stations.SG,
    arrivalStation: stations.HN,
    estimatedArrivalTime: '2026-01-15T12:00:00',
  },
];

// Generate mock carriages for a trip
export const generateCarriages = (tripId: number): Carriage[] => {
  const carriageTypes = [
    { id: 1, name: 'Soft Seat', description: 'Air-conditioned soft seat carriage' },
    { id: 2, name: 'Hard Seat', description: 'Air-conditioned hard seat carriage' },
    { id: 3, name: 'Sleeper 4-berth', description: 'Air-conditioned 4-berth sleeper' },
    { id: 4, name: 'Sleeper 6-berth', description: 'Air-conditioned 6-berth sleeper' },
  ];

  return Array.from({ length: 8 }, (_, i) => ({
    id: tripId * 100 + i + 1,
    carriageNumber: i + 1,
    carriageType: i < 4 ? carriageTypes[i % 2] : carriageTypes[2 + (i % 2)],
    trainId: tripId,
  }));
};

// Generate mock seats for a carriage
export const generateSeats = (carriageId: number, carriageNumber: number): Seat[] => {
  const seatsPerCarriage = 64;
  return Array.from({ length: seatsPerCarriage }, (_, i) => ({
    id: carriageId * 1000 + i + 1,
    seatNumber: i + 1,
    carriageId,
    isAvailable: Math.random() > 0.3, // 70% availability
  }));
};

// Generate mock beds for a sleeper carriage
export const generateBeds = (carriageId: number, carriageNumber: number): Bed[] => {
  const roomsPerCarriage = 7;
  const bedsPerRoom = 4;
  const beds: Bed[] = [];

  for (let room = 1; room <= roomsPerCarriage; room++) {
    for (let bed = 1; bed <= bedsPerRoom; bed++) {
      beds.push({
        id: carriageId * 1000 + room * 10 + bed,
        bedNumber: (room - 1) * bedsPerRoom + bed,
        floorLevel: bed <= 2 ? 1 : 2,
        roomId: carriageId * 100 + room,
        roomNumber: room,
        carriageId,
        isAvailable: Math.random() > 0.4, // 60% availability
      });
    }
  }

  return beds;
};

// Get trip detail
export const getTripDetail = (tripId: number): TripDetail | null => {
  const trip = mockTrips.find(t => t.id === tripId);
  if (!trip) return null;

  const carriages = generateCarriages(tripId);
  
  let availableSeats = 0;
  let availableBeds = 0;

  carriages.forEach((carriage, index) => {
    if (index < 4) {
      availableSeats += generateSeats(carriage.id, carriage.carriageNumber).filter(s => s.isAvailable).length;
    } else {
      availableBeds += generateBeds(carriage.id, carriage.carriageNumber).filter(b => b.isAvailable).length;
    }
  });

  return {
    trip,
    carriages,
    availableSeats,
    availableBeds,
  };
};

// Get carriage seats/beds
export const getCarriageSeats = (tripId: number, carriageNumber: number): CarriageSeats | null => {
  const carriages = generateCarriages(tripId);
  const carriage = carriages.find(c => c.carriageNumber === carriageNumber);
  if (!carriage) return null;

  const isSleeper = carriageNumber > 4;
  
  return {
    carriage,
    seats: isSleeper ? [] : generateSeats(carriage.id, carriage.carriageNumber),
    beds: isSleeper ? generateBeds(carriage.id, carriage.carriageNumber) : [],
  };
};

// Calculate ticket price
export const calculatePrice = (tripId: number, ticketType: 'SEAT' | 'BED', floorLevel?: number): number => {
  const trip = mockTrips.find(t => t.id === tripId);
  if (!trip) return 0;

  const basePrice = trip.route.totalKilometers * 0.5; // 0.5 per km
  const isLuxury = trip.train.trainType.pricingType === 'LUXURY';
  
  let price = basePrice;
  if (isLuxury) price *= 1.3;
  if (ticketType === 'BED') {
    price *= 1.5;
    if (floorLevel === 1) price *= 1.2; // First floor premium
  }

  return Math.round(price * 1000); // Convert to VND
};

// Mock booked tickets for profile
export const mockBookedTickets: BookedTicket[] = [
  {
    id: 1,
    tripId: 1,
    tripName: 'SE1 - Hà Nội → Sài Gòn',
    departureStation: 'Hà Nội',
    arrivalStation: 'Sài Gòn',
    departureTime: '2026-01-12T10:00:00',
    carriageNumber: 3,
    ticketType: 'SEAT',
    seatOrBedNumber: 24,
    price: 1250000,
    status: 'PAID',
    bookingTime: '2026-01-10T14:30:00',
  },
  {
    id: 2,
    tripId: 6,
    tripName: 'SE2 - Sài Gòn → Hà Nội',
    departureStation: 'Sài Gòn',
    arrivalStation: 'Hà Nội',
    departureTime: '2026-01-14T16:00:00',
    carriageNumber: 5,
    ticketType: 'BED',
    seatOrBedNumber: 12,
    price: 1850000,
    status: 'BOOKED',
    bookingTime: '2026-01-11T09:15:00',
  },
];
