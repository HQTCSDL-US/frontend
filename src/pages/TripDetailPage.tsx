import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getTripDetail, getCarriageSeats, calculatePrice } from '@/data/mockData';
import type { Seat, Bed, TicketType, TicketInfo } from '@/types/railway';
import CarriageSelector from '@/components/trips/CarriageSelector';
import TicketTypeSelector from '@/components/trips/TicketTypeSelector';
import SeatMap from '@/components/trips/SeatMap';
import Pagination from '@/components/trips/Pagination';
import BookingForm from '@/components/trips/BookingForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ArrowRight, Train, Clock, MapPin, Ticket } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

const ITEMS_PER_PAGE = 32;

const TripDetailPage = () => {
  const { tripId } = useParams<{ tripId: string }>();
  const navigate = useNavigate();
  
  const [selectedCarriage, setSelectedCarriage] = useState(1);
  const [ticketType, setTicketType] = useState<TicketType>('SEAT');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTicket, setSelectedTicket] = useState<TicketInfo | null>(null);

  // Derive trip detail from tripId using useMemo (no useEffect needed)
  const tripDetail = useMemo(() => {
    if (!tripId) return null;
    return getTripDetail(parseInt(tripId));
  }, [tripId]);

  // Derive carriage data from tripId, tripDetail, and selectedCarriage
  const carriageData = useMemo(() => {
    if (!tripId || !tripDetail) return null;
    return getCarriageSeats(parseInt(tripId), selectedCarriage);
  }, [tripId, tripDetail, selectedCarriage]);

  const seats = carriageData?.seats ?? [];
  const beds = carriageData?.beds ?? [];

  // Determine effective ticket type based on available options
  const effectiveTicketType = useMemo(() => {
    if (carriageData) {
      if (ticketType === 'SEAT' && seats.length > 0) return 'SEAT';
      if (ticketType === 'BED' && beds.length > 0) return 'BED';
      if (seats.length > 0) return 'SEAT';
      if (beds.length > 0) return 'BED';
    }
    return ticketType;
  }, [carriageData, ticketType, seats.length, beds.length]);

  if (!tripDetail) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading trip details...</p>
      </div>
    );
  }

  const { trip, carriages } = tripDetail;
  const items = effectiveTicketType === 'SEAT' ? seats : beds;
  const totalPages = Math.ceil(items.length / ITEMS_PER_PAGE);

  const availableSeats = seats.filter(s => s.isAvailable).length;
  const availableBeds = beds.filter(b => b.isAvailable).length;

  const handleCarriageChange = (carriageNumber: number) => {
    setSelectedCarriage(carriageNumber);
    setCurrentPage(1);
  };

  const handleSeatSelect = (item: Seat | Bed) => {
    const isBed = 'floorLevel' in item;
    const price = calculatePrice(trip.id, effectiveTicketType, isBed ? (item as Bed).floorLevel : undefined);
    
    const ticketInfo: TicketInfo = {
      tripId: trip.id,
      carriageId: item.carriageId,
      carriageNumber: selectedCarriage,
      ticketType: effectiveTicketType,
      price,
      seatOrBedNumber: isBed ? (item as Bed).bedNumber : (item as Seat).seatNumber,
      floorLevel: isBed ? (item as Bed).floorLevel : undefined,
      roomNumber: isBed ? (item as Bed).roomNumber : undefined,
    };

    setSelectedTicket(ticketInfo);
  };

  const handleBookingSubmit = () => {
    // TODO: Implement actual booking transaction with SQL Server procedure
    toast.success('Booking submitted successfully!', {
      description: 'Your ticket has been reserved. Please complete payment within 24 hours.',
    });
    setSelectedTicket(null);
    navigate('/profile');
  };

  return (
    <div className="min-h-screen bg-background pb-12">
      {/* Header */}
      <div className="railway-gradient py-8">
        <div className="container mx-auto px-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Trips
          </Button>

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Train className="h-6 w-6 text-accent" />
                <h1 className="font-display text-3xl font-bold text-primary-foreground">
                  {trip.train.name}
                </h1>
                <Badge className="bg-success text-success-foreground">
                  {trip.status}
                </Badge>
              </div>
              
              <div className="flex items-center gap-4 text-primary-foreground/80">
                <span className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  {format(new Date(trip.departureTime), 'dd MMM yyyy, HH:mm')}
                </span>
                <span className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {trip.route.totalKilometers} km
                </span>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="text-center">
                <p className="font-display text-2xl font-bold text-primary-foreground">
                  {format(new Date(trip.departureTime), 'HH:mm')}
                </p>
                <p className="text-sm text-primary-foreground/80">
                  {trip.departureStation.name}
                </p>
              </div>
              <ArrowRight className="h-6 w-6 text-accent" />
              <div className="text-center">
                <p className="font-display text-2xl font-bold text-primary-foreground">
                  {format(new Date(trip.estimatedArrivalTime), 'HH:mm')}
                </p>
                <p className="text-sm text-primary-foreground/80">
                  {trip.arrivalStation.name}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 -mt-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Panel - Selection */}
          <div className="lg:col-span-2 space-y-6">
            {/* Carriage Selector */}
            <Card className="shadow-elevated">
              <CardContent className="pt-6">
                <CarriageSelector
                  carriages={carriages}
                  selectedCarriage={selectedCarriage}
                  onSelect={handleCarriageChange}
                />
              </CardContent>
            </Card>

            {/* Ticket Type & Seat Map */}
            <Card className="shadow-elevated">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-display">
                  <Ticket className="h-5 w-5 text-primary" />
                  Select Your {effectiveTicketType === 'SEAT' ? 'Seat' : 'Bed'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <TicketTypeSelector
                  selectedType={effectiveTicketType}
                  onSelect={setTicketType}
                  seatCount={availableSeats}
                  bedCount={availableBeds}
                />

                <SeatMap
                  seats={seats}
                  beds={beds}
                  ticketType={effectiveTicketType}
                  onSelect={handleSeatSelect}
                  currentPage={currentPage}
                  itemsPerPage={ITEMS_PER_PAGE}
                />

                {totalPages > 1 && (
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                  />
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Panel - Booking Form or Summary */}
          <div className="lg:col-span-1">
            {selectedTicket ? (
              <div className="sticky top-24">
                <BookingForm
                  trip={trip}
                  ticketInfo={selectedTicket}
                  onSubmit={handleBookingSubmit}
                  onClose={() => setSelectedTicket(null)}
                />
              </div>
            ) : (
              <Card className="shadow-elevated sticky top-24">
                <CardHeader className="railway-gradient text-primary-foreground">
                  <CardTitle className="font-display">Trip Summary</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Route</p>
                    <p className="font-medium">{trip.route.name}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Train Type</p>
                    <p className="font-medium">{trip.train.trainType.name}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Available Seats</p>
                      <p className="font-display text-xl font-bold text-success">
                        {tripDetail.availableSeats}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Available Beds</p>
                      <p className="font-display text-xl font-bold text-success">
                        {tripDetail.availableBeds}
                      </p>
                    </div>
                  </div>
                  <div className="pt-4 border-t">
                    <p className="text-sm text-muted-foreground text-center">
                      Select a seat or bed to start booking
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TripDetailPage;
