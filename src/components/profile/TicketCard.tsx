import { BookedTicket } from '@/types/railway';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Armchair, BedDouble, Calendar, MapPin, Train } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface TicketCardProps {
  ticket: BookedTicket;
}

const TicketCard = ({ ticket }: TicketCardProps) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const statusColors = {
    BOOKED: 'bg-warning text-warning-foreground',
    PAID: 'bg-success text-success-foreground',
    CANCELLED: 'bg-destructive text-destructive-foreground',
  };

  return (
    <Card className="overflow-hidden transition-all hover:shadow-elevated animate-slide-up">
      <CardContent className="p-0">
        <div className="flex flex-col md:flex-row">
          {/* Ticket visual */}
          <div className="railway-gradient p-6 text-primary-foreground md:w-48 flex flex-col justify-center items-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-foreground/20 mb-3">
              {ticket.ticketType === 'SEAT' ? (
                <Armchair className="h-7 w-7" />
              ) : (
                <BedDouble className="h-7 w-7" />
              )}
            </div>
            <p className="font-display text-2xl font-bold">
              #{ticket.seatOrBedNumber}
            </p>
            <p className="text-sm opacity-80">
              Carriage {ticket.carriageNumber}
            </p>
          </div>

          {/* Ticket details */}
          <div className="flex-1 p-5">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Train className="h-4 w-4 text-primary" />
                  <span className="font-display font-semibold">{ticket.tripName}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5" />
                  {ticket.departureStation} → {ticket.arrivalStation}
                </div>
              </div>
              <Badge className={cn(statusColors[ticket.status])}>
                {ticket.status}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Departure</p>
                <p className="font-medium flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  {format(new Date(ticket.departureTime), 'dd MMM yyyy, HH:mm')}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Booked at</p>
                <p className="font-medium">
                  {format(new Date(ticket.bookingTime), 'dd MMM yyyy, HH:mm')}
                </p>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {ticket.ticketType === 'SEAT' ? 'Seat Ticket' : 'Bed Ticket'}
              </span>
              <span className="font-display text-xl font-bold text-accent">
                {formatPrice(ticket.price)}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TicketCard;
