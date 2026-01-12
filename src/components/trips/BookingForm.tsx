import { TicketInfo, Trip } from '@/types/railway';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Train, MapPin, Armchair, BedDouble, CreditCard, X } from 'lucide-react';
import { format } from 'date-fns';

interface BookingFormProps {
  trip: Trip;
  ticketInfo: TicketInfo;
  onSubmit: () => void;
  onClose: () => void;
}

const BookingForm = ({ trip, ticketInfo, onSubmit, onClose }: BookingFormProps) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  return (
    <Card className="w-full max-w-md shadow-elevated animate-slide-up">
      <CardHeader className="railway-gradient text-primary-foreground relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1 rounded-full hover:bg-primary-foreground/20 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
        <CardTitle className="flex items-center gap-2 font-display">
          <Train className="h-5 w-5" />
          Book Ticket
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {/* Trip Info */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Train className="h-4 w-4" />
            <span>Trip</span>
          </div>
          <Input
            value={`${trip.train.name} - ${trip.departureStation.name} → ${trip.arrivalStation.name}`}
            readOnly
            className="bg-muted/50"
          />
        </div>

        {/* Departure Time */}
        <div className="space-y-3">
          <Label className="text-muted-foreground">Departure Time</Label>
          <Input
            value={format(new Date(trip.departureTime), 'dd MMM yyyy, HH:mm')}
            readOnly
            className="bg-muted/50"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Carriage */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>Carriage</span>
            </div>
            <Input
              value={`#${ticketInfo.carriageNumber}`}
              readOnly
              className="bg-muted/50"
            />
          </div>

          {/* Ticket Type */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {ticketInfo.ticketType === 'SEAT' ? (
                <Armchair className="h-4 w-4" />
              ) : (
                <BedDouble className="h-4 w-4" />
              )}
              <span>Type</span>
            </div>
            <Input
              value={ticketInfo.ticketType === 'SEAT' ? 'Seat Ticket' : 'Bed Ticket'}
              readOnly
              className="bg-muted/50"
            />
          </div>
        </div>

        {/* Seat/Bed Number */}
        <div className="space-y-3">
          <Label className="text-muted-foreground">
            {ticketInfo.ticketType === 'SEAT' ? 'Seat Number' : 'Bed Number'}
          </Label>
          <Input
            value={ticketInfo.ticketType === 'BED' && ticketInfo.roomNumber
              ? `Bed #${ticketInfo.seatOrBedNumber} (Room ${ticketInfo.roomNumber}, Floor ${ticketInfo.floorLevel})`
              : `Seat #${ticketInfo.seatOrBedNumber}`
            }
            readOnly
            className="bg-muted/50"
          />
        </div>

        <Separator />

        {/* Price */}
        <div className="flex items-center justify-between py-2">
          <div className="flex items-center gap-2 text-muted-foreground">
            <CreditCard className="h-5 w-5" />
            <span className="font-medium">Total Price</span>
          </div>
          <span className="font-display text-2xl font-bold text-accent">
            {formatPrice(ticketInfo.price)}
          </span>
        </div>

        {/* Submit Button */}
        <Button
          onClick={onSubmit}
          className="w-full accent-gradient text-accent-foreground hover:opacity-90 font-semibold py-6"
        >
          Confirm Booking
        </Button>

        <p className="text-xs text-center text-muted-foreground">
          By clicking confirm, you agree to our terms and conditions.
          Payment will be processed separately.
        </p>
      </CardContent>
    </Card>
  );
};

export default BookingForm;
