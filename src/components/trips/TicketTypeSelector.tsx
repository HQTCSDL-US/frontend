import { TicketType } from '@/types/railway';
import { cn } from '@/lib/utils';
import { Armchair, BedDouble } from 'lucide-react';

interface TicketTypeSelectorProps {
  selectedType: TicketType;
  onSelect: (type: TicketType) => void;
  seatCount: number;
  bedCount: number;
}

const TicketTypeSelector = ({ selectedType, onSelect, seatCount, bedCount }: TicketTypeSelectorProps) => {
  const options = [
    { type: 'SEAT' as TicketType, label: 'Seat Ticket', icon: Armchair, count: seatCount },
    { type: 'BED' as TicketType, label: 'Bed Ticket', icon: BedDouble, count: bedCount },
  ];

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-muted-foreground">
        Ticket Type
      </label>
      <div className="flex gap-3">
        {options.map(({ type, label, icon: Icon, count }) => {
          const isSelected = selectedType === type;
          
          return (
            <button
              key={type}
              onClick={() => onSelect(type)}
              className={cn(
                'flex flex-1 items-center gap-3 rounded-lg border-2 p-4 transition-all',
                isSelected
                  ? 'border-accent bg-accent/10'
                  : 'border-border bg-card hover:border-accent/50'
              )}
            >
              <div className={cn(
                'flex h-10 w-10 items-center justify-center rounded-lg',
                isSelected ? 'bg-accent text-accent-foreground' : 'bg-muted text-muted-foreground'
              )}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="text-left">
                <p className={cn(
                  'font-medium',
                  isSelected ? 'text-foreground' : 'text-muted-foreground'
                )}>
                  {label}
                </p>
                <p className="text-sm text-success">
                  {count} available
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default TicketTypeSelector;
