import { Seat, Bed } from '@/types/railway';
import { cn } from '@/lib/utils';

interface SeatMapProps {
  seats: Seat[];
  beds: Bed[];
  ticketType: 'SEAT' | 'BED';
  onSelect: (item: Seat | Bed) => void;
  currentPage: number;
  itemsPerPage: number;
}

const SeatMap = ({ seats, beds, ticketType, onSelect, currentPage, itemsPerPage }: SeatMapProps) => {
  const items = ticketType === 'SEAT' ? seats : beds;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedItems = items.slice(startIndex, startIndex + itemsPerPage);

  if (ticketType === 'SEAT') {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded bg-success" />
            <span>Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded bg-muted" />
            <span>Booked</span>
          </div>
        </div>
        
        <div className="grid grid-cols-8 gap-2 max-w-lg mx-auto">
          {paginatedItems.map((seat) => {
            const s = seat as Seat;
            return (
              <button
                key={s.id}
                onClick={() => s.isAvailable && onSelect(s)}
                disabled={!s.isAvailable}
                className={cn(
                  'aspect-square rounded-lg flex items-center justify-center font-medium text-sm transition-all',
                  s.isAvailable
                    ? 'bg-success/20 text-success border-2 border-success hover:bg-success hover:text-success-foreground cursor-pointer'
                    : 'bg-muted text-muted-foreground cursor-not-allowed'
                )}
              >
                {s.seatNumber}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // Bed layout - grouped by rooms
  const bedItems = paginatedItems as Bed[];
  const rooms = bedItems.reduce((acc, bed) => {
    if (!acc[bed.roomNumber]) {
      acc[bed.roomNumber] = [];
    }
    acc[bed.roomNumber].push(bed);
    return acc;
  }, {} as Record<number, Bed[]>);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded bg-success" />
          <span>Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded bg-muted" />
          <span>Booked</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-6 rounded bg-primary/50" />
          <span>1st Floor</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-6 rounded bg-accent/50" />
          <span>2nd Floor</span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
        {Object.entries(rooms).map(([roomNum, roomBeds]) => (
          <div key={roomNum} className="border rounded-lg p-3 bg-card">
            <p className="text-xs font-medium text-muted-foreground mb-2 text-center">
              Room {roomNum}
            </p>
            <div className="space-y-2">
              {/* Second floor beds */}
              <div className="flex gap-1">
                {roomBeds.filter(b => b.floorLevel === 2).map((bed) => (
                  <button
                    key={bed.id}
                    onClick={() => bed.isAvailable && onSelect(bed)}
                    disabled={!bed.isAvailable}
                    className={cn(
                      'flex-1 py-2 rounded text-xs font-medium transition-all border-2',
                      bed.isAvailable
                        ? 'bg-accent/10 border-accent text-accent-foreground hover:bg-accent cursor-pointer'
                        : 'bg-muted border-muted text-muted-foreground cursor-not-allowed'
                    )}
                  >
                    {bed.bedNumber}
                  </button>
                ))}
              </div>
              {/* First floor beds */}
              <div className="flex gap-1">
                {roomBeds.filter(b => b.floorLevel === 1).map((bed) => (
                  <button
                    key={bed.id}
                    onClick={() => bed.isAvailable && onSelect(bed)}
                    disabled={!bed.isAvailable}
                    className={cn(
                      'flex-1 py-2 rounded text-xs font-medium transition-all border-2',
                      bed.isAvailable
                        ? 'bg-primary/10 border-primary text-primary hover:bg-primary hover:text-primary-foreground cursor-pointer'
                        : 'bg-muted border-muted text-muted-foreground cursor-not-allowed'
                    )}
                  >
                    {bed.bedNumber}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SeatMap;
