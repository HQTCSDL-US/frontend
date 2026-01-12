// src/pages/TripDetailPage.tsx
import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  getTripDetails,
  TripDetailsResponse,
  CarriageInfo,
  SeatInfo,
  BedInfo,
  formatTime,
  formatDate,
  formatPrice,
} from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Train, Loader2, ArrowLeft, MapPin, Clock, ChevronLeft, ChevronRight,
  Armchair, BedDouble, X, ShoppingCart, User, CreditCard, Phone, Mail, Check,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ===========================================
// TYPES
// ===========================================
interface SelectedTicket {
  id: string;
  ticketType: 'SEAT' | 'BED';
  placeId: number;
  carriageId: number;
  carriageNumber: number;
  seatNumber?: number;
  bedNumber?: number;
  floorLevel?: number;
  roomNumber?: number;
  price: number;
}

interface PassengerInfo {
  ticketId: string;
  passengerName: string;
  passengerIdCard: string;
  passengerPhone: string;
  passengerEmail: string;
}

// ===========================================
// CARRIAGE SELECTOR
// ===========================================
function CarriageSelector({
  carriages,
  selectedCarriage,
  onSelect,
  selectedTickets,
}: {
  carriages: CarriageInfo[];
  selectedCarriage: number;
  onSelect: (num: number) => void;
  selectedTickets: SelectedTicket[];
}) {
  const getTicketCount = (num: number) => selectedTickets.filter(t => t.carriageNumber === num).length;

  return (
    <div className="bg-card rounded-xl p-6 shadow-sm border">
      <h3 className="text-sm font-medium text-muted-foreground mb-4">Select Carriage</h3>
      <div className="flex flex-wrap gap-2">
        {carriages.map((c) => {
          const count = getTicketCount(c.carriageNumber);
          return (
            <button
              key={c.carriageId}
              onClick={() => onSelect(c.carriageNumber)}
              className={cn(
                "relative flex flex-col items-center p-3 rounded-lg border-2 transition-all min-w-[80px]",
                selectedCarriage === c.carriageNumber ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"
              )}
            >
              {count > 0 && (
                <span className="absolute -top-2 -right-2 w-5 h-5 bg-orange-500 text-white text-xs rounded-full flex items-center justify-center">
                  {count}
                </span>
              )}
              {c.carriageCategory === 'Seat' ? <Armchair className="w-5 h-5 mb-1" /> : <BedDouble className="w-5 h-5 mb-1" />}
              <span className="font-semibold">#{c.carriageNumber}</span>
              <span className="text-xs text-muted-foreground">{c.carriageCategory}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ===========================================
// SEAT MAP WITH MULTI-SELECT
// ===========================================
function SeatMap({
  seats, beds, ticketType, currentCarriage, selectedTickets, onToggleSelect, onTicketTypeChange, pagination, onPageChange, basePrice,
}: {
  seats: SeatInfo[];
  beds: BedInfo[];
  ticketType: 'SEAT' | 'BED';
  currentCarriage: CarriageInfo | undefined;
  selectedTickets: SelectedTicket[];
  onToggleSelect: (ticket: SelectedTicket) => void;
  onTicketTypeChange: (type: 'SEAT' | 'BED') => void;
  pagination: { currentPage: number; totalPages: number };
  onPageChange: (page: number) => void;
  basePrice: number;
}) {
  const isSelected = (type: 'SEAT' | 'BED', placeId: number) => {
    const key = `${type}-${currentCarriage?.carriageNumber}-${placeId}`;
    return selectedTickets.some(t => t.id === key);
  };

  const calcPrice = (type: 'SEAT' | 'BED', floor?: number) => {
    if (type === 'SEAT') return basePrice;
    return Math.round((basePrice * 1.5 + (floor === 1 ? 50000 : 30000)) / 1000) * 1000;
  };

  const handleSeatClick = (seat: SeatInfo) => {
    if (!seat.isAvailable || !currentCarriage) return;
    onToggleSelect({
      id: `SEAT-${currentCarriage.carriageNumber}-${seat.seatId}`,
      ticketType: 'SEAT',
      placeId: seat.seatId,
      carriageId: currentCarriage.carriageId,
      carriageNumber: currentCarriage.carriageNumber,
      seatNumber: seat.seatNumber,
      price: calcPrice('SEAT'),
    });
  };

  const handleBedClick = (bed: BedInfo) => {
    if (!bed.isAvailable || !currentCarriage) return;
    onToggleSelect({
      id: `BED-${currentCarriage.carriageNumber}-${bed.bedId}`,
      ticketType: 'BED',
      placeId: bed.bedId,
      carriageId: currentCarriage.carriageId,
      carriageNumber: currentCarriage.carriageNumber,
      bedNumber: bed.bedNumber,
      floorLevel: bed.floorLevel,
      roomNumber: bed.roomNumber,
      price: calcPrice('BED', bed.floorLevel),
    });
  };

  return (
    <div className="bg-card rounded-xl p-6 shadow-sm border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-muted-foreground">Select {ticketType === 'SEAT' ? 'Seats' : 'Beds'} (Multi-select)</h3>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-green-100 border-2 border-green-500" /><span>Available</span></div>
          <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-primary" /><span>Selected</span></div>
          <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-gray-200 border-2 border-gray-300" /><span>Booked</span></div>
        </div>
      </div>

      <div className="flex gap-2 mb-6">
        <button onClick={() => onTicketTypeChange('SEAT')} className={cn("flex items-center gap-2 px-4 py-3 rounded-lg border-2 flex-1", ticketType === 'SEAT' ? "border-primary bg-primary/10" : "border-border")}>
          <Armchair className="w-5 h-5" />
          <div className="text-left">
            <div className="font-medium">Seat Ticket</div>
            <div className="text-xs text-green-600">{seats.filter(s => s.isAvailable).length} available</div>
          </div>
        </button>
        <button onClick={() => onTicketTypeChange('BED')} className={cn("flex items-center gap-2 px-4 py-3 rounded-lg border-2 flex-1", ticketType === 'BED' ? "border-primary bg-primary/10" : "border-border")}>
          <BedDouble className="w-5 h-5" />
          <div className="text-left">
            <div className="font-medium">Bed Ticket</div>
            <div className="text-xs text-green-600">{beds.filter(b => b.isAvailable).length} available</div>
          </div>
        </button>
      </div>

      <div className="grid grid-cols-8 gap-2">
        {ticketType === 'SEAT'
          ? seats.map((s) => {
              const sel = isSelected('SEAT', s.seatId);
              return (
                <button key={s.seatId} onClick={() => handleSeatClick(s)} disabled={!s.isAvailable}
                  className={cn("aspect-square rounded-lg flex items-center justify-center text-sm font-medium relative",
                    s.isAvailable ? (sel ? "bg-primary text-primary-foreground" : "bg-green-100 border-2 border-green-500 hover:bg-green-200") : "bg-gray-200 border-2 border-gray-300 cursor-not-allowed text-gray-400")}>
                  {sel && <Check className="absolute top-0.5 right-0.5 w-3 h-3" />}
                  {s.seatNumber}
                </button>
              );
            })
          : beds.map((b) => {
              const sel = isSelected('BED', b.bedId);
              return (
                <button key={b.bedId} onClick={() => handleBedClick(b)} disabled={!b.isAvailable}
                  className={cn("aspect-square rounded-lg flex flex-col items-center justify-center text-xs font-medium relative",
                    b.isAvailable ? (sel ? "bg-primary text-primary-foreground" : "bg-green-100 border-2 border-green-500 hover:bg-green-200") : "bg-gray-200 border-2 border-gray-300 cursor-not-allowed text-gray-400")}>
                  {sel && <Check className="absolute top-0.5 right-0.5 w-3 h-3" />}
                  <span>{b.bedNumber}</span>
                  <span className="text-[10px] opacity-75">F{b.floorLevel}</span>
                </button>
              );
            })}
      </div>

      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-6">
          <Button variant="outline" size="sm" onClick={() => onPageChange(pagination.currentPage - 1)} disabled={pagination.currentPage <= 1}><ChevronLeft className="w-4 h-4" /> Prev</Button>
          <span className="text-sm">Page {pagination.currentPage} of {pagination.totalPages}</span>
          <Button variant="outline" size="sm" onClick={() => onPageChange(pagination.currentPage + 1)} disabled={pagination.currentPage >= pagination.totalPages}>Next <ChevronRight className="w-4 h-4" /></Button>
        </div>
      )}
    </div>
  );
}

// ===========================================
// SIDEBAR
// ===========================================
function SelectedTicketsSidebar({
  tripInfo, selectedTickets, onRemove, onClearAll, onReview,
}: {
  tripInfo: TripDetailsResponse['tripInfo'];
  selectedTickets: SelectedTicket[];
  onRemove: (id: string) => void;
  onClearAll: () => void;
  onReview: () => void;
}) {
  const total = selectedTickets.reduce((s, t) => s + t.price, 0);

  return (
    <Card className="sticky top-4">
      <CardHeader className="bg-primary text-primary-foreground rounded-t-lg">
        <CardTitle className="flex items-center gap-2"><ShoppingCart className="w-5 h-5" /> Selected ({selectedTickets.length})</CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        <div className="text-sm space-y-2 pb-4 border-b">
          <div className="flex justify-between"><span className="text-muted-foreground">Route</span><span className="font-medium">{tripInfo.routeName}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Train</span><span className="font-medium">{tripInfo.trainName}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Departure</span><span className="font-medium">{formatTime(tripInfo.departureTime)}</span></div>
        </div>

        {selectedTickets.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">Click seats/beds to select</p>
        ) : (
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {selectedTickets.map((t) => (
              <div key={t.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  {t.ticketType === 'SEAT' ? <Armchair className="w-4 h-4 text-primary" /> : <BedDouble className="w-4 h-4 text-primary" />}
                  <div>
                    <p className="font-medium text-sm">{t.ticketType === 'SEAT' ? `Seat #${t.seatNumber}` : `Bed #${t.bedNumber} (F${t.floorLevel})`}</p>
                    <p className="text-xs text-muted-foreground">Carriage #{t.carriageNumber}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{formatPrice(t.price)}</span>
                  <button onClick={() => onRemove(t.id)} className="p-1 hover:bg-destructive/10 rounded"><X className="w-4 h-4 text-destructive" /></button>
                </div>
              </div>
            ))}
          </div>
        )}

        {selectedTickets.length > 0 && (
          <div className="pt-4 border-t">
            <div className="flex justify-between items-center mb-4">
              <span className="text-lg font-semibold">Total</span>
              <span className="text-2xl font-bold text-primary">{formatPrice(total)}</span>
            </div>
            <Button className="w-full bg-orange-500 hover:bg-orange-600 mb-2" size="lg" onClick={onReview}>Review & Book ({selectedTickets.length})</Button>
            <Button variant="outline" className="w-full" onClick={onClearAll}>Clear All</Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ===========================================
// BOOKING DIALOG
// ===========================================
function BookingDialog({
  open, onClose, tripInfo, selectedTickets, onSubmit, loading,
}: {
  open: boolean;
  onClose: () => void;
  tripInfo: TripDetailsResponse['tripInfo'];
  selectedTickets: SelectedTicket[];
  onSubmit: (p: PassengerInfo[]) => Promise<void>;
  loading: boolean;
}) {
  const [passengers, setPassengers] = useState<PassengerInfo[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) {
      setPassengers(selectedTickets.map((t) => ({ ticketId: t.id, passengerName: '', passengerIdCard: '', passengerPhone: '', passengerEmail: '' })));
      setErrors({});
    }
  }, [open, selectedTickets]);

  const update = (i: number, f: keyof PassengerInfo, v: string) => {
    setPassengers((p) => { const u = [...p]; u[i] = { ...u[i], [f]: v }; return u; });
    setErrors((e) => { const { [`${i}-${f}`]: _, ...r } = e; return r; });
  };

  const validate = () => {
    const e: Record<string, string> = {};
    passengers.forEach((p, i) => {
      if (!p.passengerName.trim()) e[`${i}-passengerName`] = 'Required';
      if (!p.passengerIdCard.trim()) e[`${i}-passengerIdCard`] = 'Required';
      if (!p.passengerPhone.trim()) e[`${i}-passengerPhone`] = 'Required';
    });
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const total = selectedTickets.reduce((s, t) => s + t.price, 0);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle className="text-2xl">Review & Complete Booking</DialogTitle></DialogHeader>

        <div className="bg-primary/10 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-4 mb-4">
            <Train className="w-8 h-8 text-primary" />
            <div>
              <h3 className="font-bold text-lg">{tripInfo.trainName} - {tripInfo.trainTypeName}</h3>
              <p className="text-sm text-muted-foreground">{tripInfo.routeName}</p>
            </div>
          </div>
          <div className="flex justify-between text-sm">
            <div><p className="font-semibold">{formatTime(tripInfo.departureTime)}</p><p className="text-muted-foreground">{tripInfo.departureStationName}</p></div>
            <div className="flex items-center"><div className="w-16 h-0.5 bg-primary mx-2" /><span className="text-xs">{tripInfo.totalKilometers} km</span><div className="w-16 h-0.5 bg-primary mx-2" /></div>
            <div className="text-right"><p className="font-semibold">{formatTime(tripInfo.estimatedArrivalTime)}</p><p className="text-muted-foreground">{tripInfo.arrivalStationName}</p></div>
          </div>
        </div>

        <div className="space-y-6">
          {selectedTickets.map((t, i) => (
            <div key={t.id} className="border rounded-lg p-4">
              <div className="flex items-center gap-3 mb-4 pb-3 border-b">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">{i + 1}</div>
                <div className="flex-1">
                  <p className="font-semibold">{t.ticketType === 'SEAT' ? `Seat #${t.seatNumber}` : `Bed #${t.bedNumber} (Floor ${t.floorLevel})`}</p>
                  <p className="text-sm text-muted-foreground">Carriage #{t.carriageNumber} • {formatPrice(t.price)}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="flex items-center gap-2"><User className="w-4 h-4" /> Full Name *</Label>
                  <Input placeholder="Enter name" value={passengers[i]?.passengerName || ''} onChange={(e) => update(i, 'passengerName', e.target.value)} className={errors[`${i}-passengerName`] ? 'border-destructive' : ''} />
                  {errors[`${i}-passengerName`] && <p className="text-xs text-destructive mt-1">{errors[`${i}-passengerName`]}</p>}
                </div>
                <div>
                  <Label className="flex items-center gap-2"><CreditCard className="w-4 h-4" /> ID Card *</Label>
                  <Input placeholder="Enter ID" value={passengers[i]?.passengerIdCard || ''} onChange={(e) => update(i, 'passengerIdCard', e.target.value)} className={errors[`${i}-passengerIdCard`] ? 'border-destructive' : ''} />
                  {errors[`${i}-passengerIdCard`] && <p className="text-xs text-destructive mt-1">{errors[`${i}-passengerIdCard`]}</p>}
                </div>
                <div>
                  <Label className="flex items-center gap-2"><Phone className="w-4 h-4" /> Phone *</Label>
                  <Input placeholder="0901234567" value={passengers[i]?.passengerPhone || ''} onChange={(e) => update(i, 'passengerPhone', e.target.value)} className={errors[`${i}-passengerPhone`] ? 'border-destructive' : ''} />
                  {errors[`${i}-passengerPhone`] && <p className="text-xs text-destructive mt-1">{errors[`${i}-passengerPhone`]}</p>}
                </div>
                <div>
                  <Label className="flex items-center gap-2"><Mail className="w-4 h-4" /> Email</Label>
                  <Input placeholder="email@example.com" value={passengers[i]?.passengerEmail || ''} onChange={(e) => update(i, 'passengerEmail', e.target.value)} />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-between items-center py-4 border-t mt-6">
          <div><p className="text-sm text-muted-foreground">{selectedTickets.length} ticket(s)</p><p className="text-2xl font-bold text-primary">{formatPrice(total)}</p></div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button className="bg-orange-500 hover:bg-orange-600" onClick={() => validate() && onSubmit(passengers)} disabled={loading}>
            {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing...</> : <><Check className="w-4 h-4 mr-2" /> Confirm Booking</>}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ===========================================
// MAIN PAGE
// ===========================================
function TripDetailPage() {
  const { tripId } = useParams<{ tripId: string }>();
  const navigate = useNavigate();

  const [data, setData] = useState<TripDetailsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCarriage, setSelectedCarriage] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [ticketType, setTicketType] = useState<'SEAT' | 'BED'>('SEAT');
  const [selectedTickets, setSelectedTickets] = useState<SelectedTicket[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);

  const basePrice = data?.tripInfo ? Math.round((data.tripInfo.totalKilometers * 500) / 1000) * 1000 : 0;

  const fetchData = useCallback(async () => {
    if (!tripId) return;
    setLoading(true);
    try {
      const res = await getTripDetails({ tripId: parseInt(tripId), carriage: selectedCarriage, page: currentPage, size: 32 });
      setData(res);
      const c = res.carriages.find(x => x.carriageNumber === selectedCarriage);
      if (c) setTicketType(c.carriageCategory === 'Sleeper' ? 'BED' : 'SEAT');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, [tripId, selectedCarriage, currentPage]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleToggle = (t: SelectedTicket) => {
    setSelectedTickets((p) => p.find(x => x.id === t.id) ? p.filter(x => x.id !== t.id) : [...p, t]);
  };

  const handleSubmit = async (passengers: PassengerInfo[]) => {
    if (!tripId) return;
    setBookingLoading(true);
    try {
      const tickets = selectedTickets.map((t, i) => ({
        ticketType: t.ticketType, placeId: t.placeId, carriageId: t.carriageId, carriageNumber: t.carriageNumber,
        seatNumber: t.seatNumber, bedNumber: t.bedNumber, floorLevel: t.floorLevel, roomNumber: t.roomNumber,
        passengerName: passengers[i].passengerName, passengerIdCard: passengers[i].passengerIdCard,
        passengerPhone: passengers[i].passengerPhone, passengerEmail: passengers[i].passengerEmail,
      }));
      const res = await fetch('http://localhost:9000/api/booking/multiple', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerId: 1, tripId: parseInt(tripId), tickets }),
      });
      if (!res.ok) throw new Error((await res.json()).message || 'Booking failed');
      alert(`Booked ${selectedTickets.length} ticket(s)!`);
      setShowDialog(false);
      setSelectedTickets([]);
      fetchData();
    } catch (e) {
      alert('Error: ' + (e instanceof Error ? e.message : 'Unknown'));
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading && !data) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin" /><span className="ml-2">Loading...</span></div>;
  if (error && !data) return <div className="min-h-screen flex flex-col items-center justify-center"><p className="text-destructive mb-4">{error}</p><Button onClick={() => navigate('/trips')} variant="outline"><ArrowLeft className="w-4 h-4 mr-2" /> Back</Button></div>;
  if (!data) return null;

  const { tripInfo, carriages, seats, beds, pagination } = data;
  const currentCarr = carriages.find(c => c.carriageNumber === selectedCarriage);

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-to-r from-primary to-primary/80 py-8">
        <div className="container mx-auto px-4">
          <Button variant="ghost" className="text-primary-foreground mb-4" onClick={() => navigate('/trips')}><ArrowLeft className="w-4 h-4 mr-2" /> Back</Button>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-lg bg-white/20 flex items-center justify-center"><Train className="w-8 h-8 text-primary-foreground" /></div>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl font-bold text-primary-foreground">{tripInfo.trainName}</h1>
                  <span className={cn("px-3 py-1 rounded-full text-xs font-medium text-white", tripInfo.status === 'scheduled' ? 'bg-green-500' : 'bg-orange-500')}>{tripInfo.status.toUpperCase()}</span>
                </div>
                <div className="flex items-center gap-2 text-primary-foreground/80"><Clock className="w-4 h-4" /><span>{formatDate(tripInfo.departureTime)}</span><MapPin className="w-4 h-4 ml-2" /><span>{tripInfo.totalKilometers} km</span></div>
              </div>
            </div>
            <div className="flex items-center gap-8 text-primary-foreground">
              <div className="text-center"><p className="text-3xl font-bold">{formatTime(tripInfo.departureTime)}</p><p className="text-sm opacity-80">{tripInfo.departureStationName}</p></div>
              <div className="text-2xl">→</div>
              <div className="text-center"><p className="text-3xl font-bold">{formatTime(tripInfo.estimatedArrivalTime)}</p><p className="text-sm opacity-80">{tripInfo.arrivalStationName}</p></div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <CarriageSelector carriages={carriages} selectedCarriage={selectedCarriage} onSelect={(n) => { setSelectedCarriage(n); setCurrentPage(1); }} selectedTickets={selectedTickets} />
            <SeatMap seats={seats} beds={beds} ticketType={ticketType} currentCarriage={currentCarr} selectedTickets={selectedTickets} onToggleSelect={handleToggle} onTicketTypeChange={setTicketType} pagination={{ currentPage: pagination.currentPage, totalPages: pagination.totalPages }} onPageChange={setCurrentPage} basePrice={basePrice} />
          </div>
          <div><SelectedTicketsSidebar tripInfo={tripInfo} selectedTickets={selectedTickets} onRemove={(id) => setSelectedTickets(p => p.filter(t => t.id !== id))} onClearAll={() => setSelectedTickets([])} onReview={() => setShowDialog(true)} /></div>
        </div>
      </div>

      <BookingDialog open={showDialog} onClose={() => setShowDialog(false)} tripInfo={tripInfo} selectedTickets={selectedTickets} onSubmit={handleSubmit} loading={bookingLoading} />
    </div>
  );
}

export default TripDetailPage;