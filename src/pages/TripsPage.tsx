// src/pages/TripsPage.tsx
// Trips listing page with real API integration

import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getTripList, TripListDTO, TripListSummaryDTO, formatTime, formatDate } from '@/services/api';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search, Filter, Train, Loader2, ChevronLeft, ChevronRight, MapPin, Clock, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

// ===========================================
// TRIP CARD COMPONENT
// ===========================================

interface TripCardProps {
  trip: TripListDTO;
  onViewDetail: (tripId: number) => void;
}

const TripCard = ({ trip, onViewDetail }: TripCardProps) => {
  const statusColors: Record<string, string> = {
    scheduled: 'bg-green-500 text-white',
    enroute: 'bg-blue-500 text-white',
    completed: 'bg-orange-500 text-white',
    cancelled: 'bg-red-500 text-white',
  };

  const statusLabels: Record<string, string> = {
    scheduled: 'SCHEDULED',
    enroute: 'EN ROUTE',
    completed: 'COMPLETED',
    cancelled: 'CANCELLED',
  };

  const departureTime = formatTime(trip.departureTime);
  const arrivalTime = formatTime(trip.estimatedArrivalTime);
  const departureDate = formatDate(trip.departureTime);

  return (
    <div className="bg-card rounded-xl shadow-sm border border-border hover:shadow-md transition-shadow overflow-hidden">
      {/* Left accent line */}
      <div className="flex">
        <div className={cn(
          "w-1",
          trip.status === 'scheduled' ? 'bg-green-500' :
          trip.status === 'enroute' ? 'bg-blue-500' :
          trip.status === 'completed' ? 'bg-orange-500' : 'bg-red-500'
        )} />
        
        <div className="flex-1 p-6">
          <div className="flex flex-col lg:flex-row lg:items-center gap-6">
            {/* Train Info */}
            <div className="flex items-center gap-4 min-w-[200px]">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Train className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">{trip.trainName}</h3>
                <p className="text-sm text-muted-foreground">{trip.trainTypeName}</p>
              </div>
            </div>

            {/* Journey Info */}
            <div className="flex-1 flex items-center gap-4">
              {/* Departure */}
              <div className="text-center">
                <p className="text-2xl font-bold">{departureTime}</p>
                <p className="text-sm text-muted-foreground">{trip.departureStationName}</p>
              </div>

              {/* Journey Line */}
              <div className="flex-1 flex items-center gap-2 px-4">
                <div className="w-2 h-2 rounded-full bg-primary" />
                <div className="flex-1 relative">
                  <div className="h-[2px] bg-gradient-to-r from-primary to-orange-500 w-full" />
                  <span className="absolute top-2 left-1/2 -translate-x-1/2 text-xs text-muted-foreground whitespace-nowrap">
                    {trip.totalKilometers} km
                  </span>
                </div>
                <div className="text-muted-foreground">→</div>
                <div className="w-2 h-2 rounded-full bg-orange-500" />
              </div>

              {/* Arrival */}
              <div className="text-center">
                <p className="text-2xl font-bold">{arrivalTime}</p>
                <p className="text-sm text-muted-foreground">{trip.arrivalStationName}</p>
              </div>
            </div>

            {/* Status & Action */}
            <div className="flex flex-col items-end gap-3 min-w-[150px]">
              <span className={cn(
                "px-3 py-1 rounded-full text-xs font-medium",
                statusColors[trip.status] || 'bg-gray-500 text-white'
              )}>
                {statusLabels[trip.status] || trip.status.toUpperCase()}
              </span>
              
              <Button 
                onClick={() => onViewDetail(trip.tripId)}
                variant={trip.status === 'completed' ? 'secondary' : 'default'}
                className={trip.status === 'completed' ? '' : 'bg-orange-500 hover:bg-orange-600'}
              >
                {trip.status === 'completed' ? 'Completed' : 'View Details'}
              </Button>
            </div>
          </div>

          {/* Bottom Info */}
          <div className="flex items-center gap-6 mt-4 pt-4 border-t border-border text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{departureDate}</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>{trip.totalAvailablePlaces} seats available</span>
            </div>
            {trip.availableSeats > 0 && (
              <span className="text-green-600">{trip.availableSeats} seats</span>
            )}
            {trip.availableBeds > 0 && (
              <span className="text-blue-600">{trip.availableBeds} beds</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ===========================================
// PAGINATION COMPONENT
// ===========================================

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination = ({ currentPage, totalPages, onPageChange }: PaginationProps) => {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
      >
        <ChevronLeft className="w-4 h-4" />
        Previous
      </Button>
      
      <div className="flex items-center gap-1">
        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
          let page: number;
          if (totalPages <= 5) {
            page = i + 1;
          } else if (currentPage <= 3) {
            page = i + 1;
          } else if (currentPage >= totalPages - 2) {
            page = totalPages - 4 + i;
          } else {
            page = currentPage - 2 + i;
          }
          
          return (
            <Button
              key={page}
              variant={currentPage === page ? 'default' : 'outline'}
              size="sm"
              onClick={() => onPageChange(page)}
              className="w-10"
            >
              {page}
            </Button>
          );
        })}
      </div>
      
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
      >
        Next
        <ChevronRight className="w-4 h-4" />
      </Button>
    </div>
  );
};

// ===========================================
// MAIN TRIPS PAGE
// ===========================================

const TripsPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // State
  const [trips, setTrips] = useState<TripListDTO[]>([]);
  const [summary, setSummary] = useState<TripListSummaryDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filters from URL params
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'ALL');
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page') || '1'));
  const pageSize = 10;

  // Debounced search
  const [debouncedSearch, setDebouncedSearch] = useState(searchTerm);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch trips
  const fetchTrips = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await getTripList({
        status: statusFilter === 'ALL' ? null : statusFilter,
        search: debouncedSearch || undefined,
        page: currentPage,
        size: pageSize,
      });
      
      setTrips(response.trips || []);
      setSummary(response.summary || null);
    } catch (err) {
      console.error('Error fetching trips:', err);
      setError(err instanceof Error ? err.message : 'Failed to load trips');
      setTrips([]);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, debouncedSearch, currentPage]);

  useEffect(() => {
    fetchTrips();
  }, [fetchTrips]);

  // Update URL params
  useEffect(() => {
    const params = new URLSearchParams();
    if (statusFilter !== 'ALL') params.set('status', statusFilter);
    if (debouncedSearch) params.set('search', debouncedSearch);
    if (currentPage > 1) params.set('page', currentPage.toString());
    setSearchParams(params);
  }, [statusFilter, debouncedSearch, currentPage, setSearchParams]);

  // Handlers
  const handleViewDetail = (tripId: number) => {
    navigate(`/trip/${tripId}`);
  };

  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary to-primary/80 py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold text-primary-foreground mb-4">
            Find Your Journey
          </h1>
          <p className="text-primary-foreground/80 text-lg max-w-xl">
            Browse available train trips across Vietnam. Book your tickets easily and travel comfortably.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="container mx-auto px-4 -mt-8">
        <div className="bg-card rounded-xl shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by station or train name..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>
            
            {/* Status Filter */}
            <div className="flex items-center gap-3 w-full md:w-56">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={statusFilter} onValueChange={handleStatusChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Trips</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="enroute">En Route</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Summary Stats */}
          {summary && (
            <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-border">
              <span className="text-sm">
                <span className="font-medium">{summary.totalTrips}</span> total
              </span>
              <span className="text-sm text-green-600">
                <span className="font-medium">{summary.scheduledTrips}</span> scheduled
              </span>
              {summary.enrouteTrips > 0 && (
                <span className="text-sm text-blue-600">
                  <span className="font-medium">{summary.enrouteTrips}</span> en route
                </span>
              )}
              <span className="text-sm text-orange-600">
                <span className="font-medium">{summary.completedTrips}</span> completed
              </span>
              {summary.cancelledTrips > 0 && (
                <span className="text-sm text-red-600">
                  <span className="font-medium">{summary.cancelledTrips}</span> cancelled
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Trip List */}
      <div className="container mx-auto px-4 pb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold">Available Trips</h2>
          <span className="text-sm text-muted-foreground">
            {trips.length} trips found
            {summary && summary.totalPages > 1 && (
              <span> (Page {summary.currentPage} of {summary.totalPages})</span>
            )}
          </span>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">Loading trips...</span>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="text-center py-12">
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={fetchTrips} variant="outline">
              Try Again
            </Button>
          </div>
        )}

        {/* Trip Cards */}
        {!loading && !error && (
          <>
            <div className="space-y-4">
              {trips.map((trip, index) => (
                <div 
                  key={trip.tripId} 
                  className="animate-in fade-in slide-in-from-bottom-4"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <TripCard trip={trip} onViewDetail={handleViewDetail} />
                </div>
              ))}
            </div>

            {/* Empty State */}
            {trips.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <Train className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No trips found matching your criteria.</p>
                <Button 
                  variant="link" 
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('ALL');
                    setCurrentPage(1);
                  }}
                >
                  Clear filters
                </Button>
              </div>
            )}

            {/* Pagination */}
            {summary && (
              <Pagination
                currentPage={summary.currentPage}
                totalPages={summary.totalPages}
                onPageChange={handlePageChange}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default TripsPage;