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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Train, Loader2, ArrowLeft, MapPin, Clock, ChevronLeft, ChevronRight,
  Armchair, BedDouble, X, ShoppingCart, User, CreditCard, Phone, Check, GraduationCap, AlertTriangle, Ticket,
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
  fullName: string;
  idCard: string;
  phoneNumber: string;
  customerTypeId: number;
  studentId: string | null;
  studentCardNumber: string | null;
}

// Customer types - match your backend
const CUSTOMER_TYPES = [
  { id: 1, name: 'Adult', requiresStudent: false },
  { id: 2, name: 'Student', requiresStudent: true },
  { id: 3, name: 'Child', requiresStudent: false },
  { id: 4, name: 'Senior', requiresStudent: false },
];

// ===========================================
// TICKETS REMAINING DISPLAY COMPONENT
// ===========================================
function TicketsRemainingBanner({ totalTickets, lastBooking }: { totalTickets: number | null; lastBooking: { booked: number; case: string } | null }) {
  return (
    <div className={cn(
      "rounded-xl p-4 shadow-sm border mb-6",
      lastBooking?.case === 'error' ? "bg-red-50 border-red-300" : 
      lastBooking?.case === 'success' ? "bg-green-50 border-green-300" : 
      "bg-yellow-50 border-yellow-300"
    )}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-12 h-12 rounded-full flex items-center justify-center",
            lastBooking?.case === 'error' ? "bg-red-100" : 
            lastBooking?.case === 'success' ? "bg-green-100" : 
            "bg-yellow-100"
          )}>
            <Ticket className={cn(
              "w-6 h-6",
              lastBooking?.case === 'error' ? "text-red-600" : 
              lastBooking?.case === 'success' ? "text-green-600" : 
              "text-yellow-600"
            )} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Total Tickets Remaining</p>
            {lastBooking && (
              <p className={cn(
                "text-xs",
                lastBooking.case === 'error' ? "text-red-600" : "text-green-600"
              )}>
                Last booking: {lastBooking.booked} tickets ({lastBooking.case.toUpperCase()} CASE)
              </p>
            )}
          </div>
        </div>
        <div className="text-right">
          <p className={cn(
            "text-4xl font-bold",
            lastBooking?.case === 'error' ? "text-red-700" : 
            lastBooking?.case === 'success' ? "text-green-700" : 
            "text-yellow-700"
          )}>
            {totalTickets !== null ? totalTickets : 'N/A'}
          </p>
          <p className="text-xs text-gray-500">tickets</p>
        </div>
      </div>
    </div>
  );
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
  seats, beds, ticketType, currentCarriage, selectedTickets, onToggleSelect, onTicketTypeChange, pagination, onPageChange, basePrice, availableSeatsCount, availableBedsCount,  totalTickets
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
  availableSeatsCount: number;
  availableBedsCount: number;
  totalTickets: number | null;
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
        <h3 className="text-sm font-medium text-muted-foreground">Select {ticketType === 'SEAT' ? 'Seats' : 'Beds'}</h3>
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
            {/* THAY ĐỔI: Hiển thị totalTickets thay vì đếm seats */}
            <div className="text-xs text-green-600 font-semibold">
              {availableSeatsCount} available
            </div>
          </div>
        </button>
        <button onClick={() => onTicketTypeChange('BED')} className={cn("flex items-center gap-2 px-4 py-3 rounded-lg border-2 flex-1", ticketType === 'BED' ? "border-primary bg-primary/10" : "border-border")}>
          <BedDouble className="w-5 h-5" />
          <div className="text-left">
            <div className="font-medium">Bed Ticket</div>
            {/* THAY ĐỔI: Hiển thị totalTickets thay vì đếm beds */}
            <div className="text-xs text-green-600 font-semibold">
              {availableBedsCount} available
            </div>
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
  tripInfo, selectedTickets, onRemove, onClearAll, onReview, totalTickets,
}: {
  tripInfo: TripDetailsResponse['tripInfo'];
  selectedTickets: SelectedTicket[];
  onRemove: (id: string) => void;
  onClearAll: () => void;
  onReview: () => void;
  totalTickets: number | null;
}) {
  const total = selectedTickets.reduce((s, t) => s + t.price, 0);

  return (
    <Card className="sticky top-4">
      <CardHeader className="bg-primary text-primary-foreground rounded-t-lg">
        <CardTitle className="flex items-center gap-2"><ShoppingCart className="w-5 h-5" /> Selected ({selectedTickets.length})</CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        {/* THÊM: Hiển thị Total Tickets */}
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-300 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Ticket className="w-5 h-5 text-yellow-600" />
              <span className="text-sm font-medium text-yellow-800">Tickets Remaining</span>
            </div>
            <span className="text-3xl font-bold text-yellow-900">
              {totalTickets !== null ? totalTickets : 'N/A'}
            </span>
          </div>
        </div>

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
  onSubmit: (p: PassengerInfo[], employeeId: number, deptStationId: number, arrStationId: number, demoCase: 'error' | 'success') => Promise<void>;
  loading: boolean;
}) {
  const [passengers, setPassengers] = useState<PassengerInfo[]>([]);
  const [employeeId, setEmployeeId] = useState<string>('1');
  const [departureStationId, setDepartureStationId] = useState<string>('1');
  const [arrivalStationId, setArrivalStationId] = useState<string>('2');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) {
      setPassengers(selectedTickets.map((t) => ({
        ticketId: t.id,
        fullName: '',
        idCard: '',
        phoneNumber: '',
        customerTypeId: 1,
        studentId: null,
        studentCardNumber: null,
      })));
      setErrors({});
    }
  }, [open, selectedTickets]);

  const update = (i: number, f: keyof PassengerInfo, v: string | number | null) => {
    setPassengers((p) => {
      const u = [...p];
      u[i] = { ...u[i], [f]: v };
      
      if (f === 'customerTypeId') {
        const customerType = CUSTOMER_TYPES.find(ct => ct.id === v);
        if (customerType && !customerType.requiresStudent) {
          u[i].studentId = null;
          u[i].studentCardNumber = null;
        }
      }
      
      return u;
    });
    setErrors((e) => { const { [`${i}-${f}`]: _, ...r } = e; return r; });
  };

  const validate = () => {
    const e: Record<string, string> = {};
    
    if (!employeeId.trim()) e['employeeId'] = 'Required';
    if (!departureStationId.trim()) e['departureStationId'] = 'Required';
    if (!arrivalStationId.trim()) e['arrivalStationId'] = 'Required';
    
    passengers.forEach((p, i) => {
      if (!p.fullName.trim()) e[`${i}-fullName`] = 'Required';
      if (!p.idCard.trim()) e[`${i}-idCard`] = 'Required';
      if (!p.phoneNumber.trim()) e[`${i}-phoneNumber`] = 'Required';
      
      const customerType = CUSTOMER_TYPES.find(ct => ct.id === p.customerTypeId);
      if (customerType?.requiresStudent) {
        if (!p.studentId?.trim()) e[`${i}-studentId`] = 'Required for students';
        if (!p.studentCardNumber?.trim()) e[`${i}-studentCardNumber`] = 'Required for students';
      }
    });
    
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const total = selectedTickets.reduce((s, t) => s + t.price, 0);
  
  const isStudentType = (customerTypeId: number) => {
    return CUSTOMER_TYPES.find(ct => ct.id === customerTypeId)?.requiresStudent || false;
  };

  const handleSubmit = (demoCase: 'error' | 'success') => {
    if (validate()) {
      onSubmit(passengers, parseInt(employeeId), parseInt(departureStationId), parseInt(arrivalStationId), demoCase);
    }
  };

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

        {/* Employee & Station Info */}
        <div className="border rounded-lg p-4 mb-4 bg-muted/30">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <User className="w-4 h-4" /> Booking Information
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Employee ID *</Label>
              <Input
                placeholder="Employee ID"
                value={employeeId}
                onChange={(e) => {
                  setEmployeeId(e.target.value);
                  setErrors(prev => { const { employeeId: _, ...rest } = prev; return rest; });
                }}
                className={errors['employeeId'] ? 'border-destructive' : ''}
              />
              {errors['employeeId'] && <p className="text-xs text-destructive mt-1">{errors['employeeId']}</p>}
            </div>
            <div>
              <Label>Departure Station ID *</Label>
              <Input
                placeholder="Station ID"
                value={departureStationId}
                onChange={(e) => {
                  setDepartureStationId(e.target.value);
                  setErrors(prev => { const { departureStationId: _, ...rest } = prev; return rest; });
                }}
                className={errors['departureStationId'] ? 'border-destructive' : ''}
              />
              {errors['departureStationId'] && <p className="text-xs text-destructive mt-1">{errors['departureStationId']}</p>}
            </div>
            <div>
              <Label>Arrival Station ID *</Label>
              <Input
                placeholder="Station ID"
                value={arrivalStationId}
                onChange={(e) => {
                  setArrivalStationId(e.target.value);
                  setErrors(prev => { const { arrivalStationId: _, ...rest } = prev; return rest; });
                }}
                className={errors['arrivalStationId'] ? 'border-destructive' : ''}
              />
              {errors['arrivalStationId'] && <p className="text-xs text-destructive mt-1">{errors['arrivalStationId']}</p>}
            </div>
          </div>
        </div>

        {/* Passengers */}
        <div className="space-y-6">
          {selectedTickets.map((t, i) => (
            <div key={t.id} className="border rounded-lg p-4">
              <div className="flex items-center gap-3 mb-4 pb-3 border-b">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">{i + 1}</div>
                <div className="flex-1">
                  <p className="font-semibold">{t.ticketType === 'SEAT' ? `Seat #${t.seatNumber}` : `Bed #${t.bedNumber} (Floor ${t.floorLevel})`}</p>
                  <p className="text-sm text-muted-foreground">Carriage #{t.carriageNumber} • Carriage ID: {t.carriageId} • {formatPrice(t.price)}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="flex items-center gap-2"><User className="w-4 h-4" /> Customer Type *</Label>
                  <Select
                    value={passengers[i]?.customerTypeId.toString() || '1'}
                    onValueChange={(value) => update(i, 'customerTypeId', parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {CUSTOMER_TYPES.map((type) => (
                        <SelectItem key={type.id} value={type.id.toString()}>
                          {type.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="flex items-center gap-2"><User className="w-4 h-4" /> Full Name *</Label>
                  <Input placeholder="Enter full name" value={passengers[i]?.fullName || ''} onChange={(e) => update(i, 'fullName', e.target.value)} className={errors[`${i}-fullName`] ? 'border-destructive' : ''} />
                  {errors[`${i}-fullName`] && <p className="text-xs text-destructive mt-1">{errors[`${i}-fullName`]}</p>}
                </div>

                <div>
                  <Label className="flex items-center gap-2"><CreditCard className="w-4 h-4" /> ID Card *</Label>
                  <Input placeholder="Enter ID card" value={passengers[i]?.idCard || ''} onChange={(e) => update(i, 'idCard', e.target.value)} className={errors[`${i}-idCard`] ? 'border-destructive' : ''} />
                  {errors[`${i}-idCard`] && <p className="text-xs text-destructive mt-1">{errors[`${i}-idCard`]}</p>}
                </div>

                <div>
                  <Label className="flex items-center gap-2"><Phone className="w-4 h-4" /> Phone Number *</Label>
                  <Input placeholder="0901234567" value={passengers[i]?.phoneNumber || ''} onChange={(e) => update(i, 'phoneNumber', e.target.value)} className={errors[`${i}-phoneNumber`] ? 'border-destructive' : ''} />
                  {errors[`${i}-phoneNumber`] && <p className="text-xs text-destructive mt-1">{errors[`${i}-phoneNumber`]}</p>}
                </div>

                {isStudentType(passengers[i]?.customerTypeId) && (
                  <>
                    <div>
                      <Label className="flex items-center gap-2"><GraduationCap className="w-4 h-4" /> Student ID *</Label>
                      <Input placeholder="Enter student ID" value={passengers[i]?.studentId || ''} onChange={(e) => update(i, 'studentId', e.target.value)} className={errors[`${i}-studentId`] ? 'border-destructive' : ''} />
                      {errors[`${i}-studentId`] && <p className="text-xs text-destructive mt-1">{errors[`${i}-studentId`]}</p>}
                    </div>

                    <div>
                      <Label className="flex items-center gap-2"><CreditCard className="w-4 h-4" /> Student Card Number *</Label>
                      <Input placeholder="Enter card number" value={passengers[i]?.studentCardNumber || ''} onChange={(e) => update(i, 'studentCardNumber', e.target.value)} className={errors[`${i}-studentCardNumber`] ? 'border-destructive' : ''} />
                      {errors[`${i}-studentCardNumber`] && <p className="text-xs text-destructive mt-1">{errors[`${i}-studentCardNumber`]}</p>}
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-between items-center py-4 border-t mt-6">
          <div><p className="text-sm text-muted-foreground">{selectedTickets.length} ticket(s)</p><p className="text-2xl font-bold text-primary">{formatPrice(total)}</p></div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button 
            variant="destructive" 
            onClick={() => handleSubmit('error')} 
            disabled={loading}
            className="bg-red-500 hover:bg-red-600"
          >
            {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing...</> : <><AlertTriangle className="w-4 h-4 mr-2" /> Test Error Case</>}
          </Button>
          <Button 
            className="bg-green-500 hover:bg-green-600" 
            onClick={() => handleSubmit('success')} 
            disabled={loading}
          >
            {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing...</> : <><Check className="w-4 h-4 mr-2" /> Test Success Case</>}
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
  
  // NEW: State để lưu totalTickets và last booking info
  const [totalTickets, setTotalTickets] = useState<number | null>(null);
  const [lastBooking, setLastBooking] = useState<{ booked: number; case: string } | null>(null);

  const basePrice = data?.tripInfo ? Math.round((data.tripInfo.totalKilometers * 500) / 1000) * 1000 : 0;

  const fetchData = useCallback(async () => {
    if (!tripId) return;
    setLoading(true);
    try {
      const res = await getTripDetails({ tripId: parseInt(tripId), carriage: selectedCarriage, page: currentPage, size: 32 });
      setData(res);
      // Cập nhật totalTickets từ API
      setTotalTickets(res.tripInfo.totalTickets);
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

  const handleSubmit = async (
    passengers: PassengerInfo[], 
    employeeId: number, 
    departureStationId: number, 
    arrivalStationId: number,
    demoCase: 'error' | 'success'
  ) => {
    if (!tripId || !data) return;
    setBookingLoading(true);
    
    try {
      const tickets = selectedTickets.map((t, i) => ({
        fullName: passengers[i].fullName,
        idCard: passengers[i].idCard,
        customerTypeId: passengers[i].customerTypeId,
        phoneNumber: passengers[i].phoneNumber,
        studentId: passengers[i].studentId,
        studentCardNumber: passengers[i].studentCardNumber,
        carriageId: t.carriageId,
        ticketType: t.ticketType === 'SEAT' ? 'Seat' : 'Room',
        seatTicketId: t.ticketType === 'SEAT' ? t.placeId : null,
        roomTicketId: t.ticketType === 'BED' ? t.placeId : null,
      }));

      const requestBody = {
        tripId: parseInt(tripId),
        employeeId: employeeId,
        departureStationId: departureStationId,
        arrivalStationId: arrivalStationId,
        tickets: tickets,
      };

      const endpoint = demoCase === 'error' 
        ? 'http://localhost:9000/api/employee/booking/error-case'
        : 'http://localhost:9000/api/employee/booking/success-case';

      console.log(`Booking ${demoCase} case:`, requestBody);

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      const result = await res.json();
      
      // Cập nhật totalTickets và lastBooking từ response
      if (result.totalTickets !== undefined) {
        setTotalTickets(result.totalTickets);
        setLastBooking({ booked: result.ticketsBooked || selectedTickets.length, case: demoCase });
      }
      
      if (result.success) {
        alert(`✅ ${demoCase.toUpperCase()} CASE\n\n${result.message}\n\n🎫 Tickets booked: ${result.ticketsBooked}\n📊 Remaining: ${result.totalTickets}`);
        setShowDialog(false);
        setSelectedTickets([]);
        fetchData(); // Refresh data
      } else {
        alert(`❌ ${demoCase.toUpperCase()} CASE\n\n${result.message}\n\n📊 Remaining: ${result.totalTickets || 'N/A'}`);
      }
      
    } catch (e) {
      console.error('Booking error:', e);
      alert('❌ Booking Error: ' + (e instanceof Error ? e.message : 'Unknown error'));
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading && !data) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin" /><span className="ml-2">Loading...</span></div>;
  if (error && !data) return <div className="min-h-screen flex flex-col items-center justify-center"><p className="text-destructive mb-4">{error}</p><Button onClick={() => navigate('/trips')} variant="outline"><ArrowLeft className="w-4 h-4 mr-2" /> Back</Button></div>;
  if (!data) return null;

  const { tripInfo, carriages, seats, beds, pagination } = data;
  const currentCarr = carriages.find(c => c.carriageNumber === selectedCarriage);

  // Tính số ghế/giường available
  const availableSeatsCount = seats.filter(s => s.isAvailable).length;
  const availableBedsCount = beds.filter(b => b.isAvailable).length;

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
        {/* THÊM: Banner hiển thị Total Tickets */}
        <TicketsRemainingBanner totalTickets={totalTickets} lastBooking={lastBooking} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <CarriageSelector carriages={carriages} selectedCarriage={selectedCarriage} onSelect={(n) => { setSelectedCarriage(n); setCurrentPage(1); }} selectedTickets={selectedTickets} />
            <SeatMap 
              seats={seats} 
              beds={beds} 
              ticketType={ticketType} 
              currentCarriage={currentCarr} 
              selectedTickets={selectedTickets} 
              onToggleSelect={handleToggle} 
              onTicketTypeChange={setTicketType} 
              pagination={{ currentPage: pagination.currentPage, totalPages: pagination.totalPages }} 
              onPageChange={setCurrentPage} 
              basePrice={basePrice}
              availableSeatsCount={availableSeatsCount}
              availableBedsCount={availableBedsCount}
              totalTickets={totalTickets}
            />
          </div>
          <div>
            <SelectedTicketsSidebar 
              tripInfo={tripInfo} 
              selectedTickets={selectedTickets} 
              onRemove={(id) => setSelectedTickets(p => p.filter(t => t.id !== id))} 
              onClearAll={() => setSelectedTickets([])} 
              onReview={() => setShowDialog(true)}
              totalTickets={totalTickets}
            />
          </div>
        </div>
      </div>

      <BookingDialog open={showDialog} onClose={() => setShowDialog(false)} tripInfo={tripInfo} selectedTickets={selectedTickets} onSubmit={handleSubmit} loading={bookingLoading} />
    </div>
  );
}

export default TripDetailPage;