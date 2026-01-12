import { Carriage } from '@/types/railway';
import { cn } from '@/lib/utils';
import { Armchair, BedDouble } from 'lucide-react';

interface CarriageSelectorProps {
  carriages: Carriage[];
  selectedCarriage: number;
  onSelect: (carriageNumber: number) => void;
}

const CarriageSelector = ({ carriages, selectedCarriage, onSelect }: CarriageSelectorProps) => {
  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-muted-foreground">
        Select Carriage
      </label>
      <div className="flex gap-2 overflow-x-auto pb-2">
        {carriages.map((carriage) => {
          const isSleeper = carriage.carriageNumber > 4;
          const isSelected = carriage.carriageNumber === selectedCarriage;
          
          return (
            <button
              key={carriage.id}
              onClick={() => onSelect(carriage.carriageNumber)}
              className={cn(
                'flex flex-col items-center gap-1 rounded-lg border-2 px-4 py-3 transition-all min-w-[80px]',
                isSelected
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-card hover:border-primary/50 hover:bg-muted/50'
              )}
            >
              {isSleeper ? (
                <BedDouble className="h-5 w-5" />
              ) : (
                <Armchair className="h-5 w-5" />
              )}
              <span className="font-display font-semibold text-sm">
                #{carriage.carriageNumber}
              </span>
              <span className="text-xs opacity-80">
                {isSleeper ? 'Sleeper' : 'Seat'}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CarriageSelector;
