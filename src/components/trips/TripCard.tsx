import { ArrowRight, Clock, MapPin, Train } from 'lucide-react';
import { Trip } from '@/types/railway';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface TripCardProps {
  trip: Trip;
  onViewDetail: (tripId: number) => void;
}

const TripCard = ({ trip, onViewDetail }: TripCardProps) => {
  const departureTime = new Date(trip.departureTime);
  const arrivalTime = new Date(trip.estimatedArrivalTime);
  
  const formatTime = (date: Date) => format(date, 'HH:mm');
  const formatDate = (date: Date) => format(date, 'dd MMM yyyy');

  const isScheduled = trip.status === 'SCHEDULED';

  return (
    <Card className={cn(
      'overflow-hidden transition-all duration-300 hover:shadow-elevated animate-slide-up',
      'border-l-4',
      isScheduled ? 'border-l-success' : 'border-l-muted-foreground'
    )}>
      <CardContent className="p-0">
        <div className="flex flex-col lg:flex-row lg:items-center">
          {/* Route Info */}
          <div className="flex-1 p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Train className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-display font-semibold text-foreground">
                  {trip.train.name}
                </p>
                <p className="text-sm text-muted-foreground">
                  {trip.train.trainType.name}
                </p>
              </div>
              <Badge 
                variant={isScheduled ? 'default' : 'secondary'}
                className={cn(
                  'ml-auto',
                  isScheduled && 'bg-success text-success-foreground'
                )}
              >
                {trip.status}
              </Badge>
            </div>

            {/* Journey */}
            <div className="flex items-center gap-4">
              <div className="text-center">
                <p className="font-display text-2xl font-bold text-foreground">
                  {formatTime(departureTime)}
                </p>
                <p className="text-sm font-medium text-muted-foreground">
                  {trip.departureStation.name}
                </p>
              </div>

              <div className="flex flex-1 items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-primary" />
                <div className="relative h-0.5 flex-1 bg-border">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap">
                    <span className="text-xs text-muted-foreground">
                      {trip.route.totalKilometers} km
                    </span>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                <div className="h-2 w-2 rounded-full bg-accent" />
              </div>

              <div className="text-center">
                <p className="font-display text-2xl font-bold text-foreground">
                  {formatTime(arrivalTime)}
                </p>
                <p className="text-sm font-medium text-muted-foreground">
                  {trip.arrivalStation.name}
                </p>
              </div>
            </div>

            <div className="mt-3 flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {formatDate(departureTime)}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                {trip.totalTickets} seats
              </span>
            </div>
          </div>

          {/* Action */}
          <div className="border-t lg:border-l lg:border-t-0 p-5 lg:w-48 flex items-center justify-center bg-muted/30">
            <Button
              onClick={() => onViewDetail(trip.id)}
              disabled={!isScheduled}
              className={cn(
                'w-full lg:w-auto',
                isScheduled && 'accent-gradient text-accent-foreground hover:opacity-90'
              )}
            >
              {isScheduled ? 'View Details' : 'Completed'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TripCard;
