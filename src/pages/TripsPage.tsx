import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { mockTrips } from '@/data/mockData';
import TripCard from '@/components/trips/TripCard';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter } from 'lucide-react';

const TripsPage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const filteredTrips = mockTrips.filter((trip) => {
    const matchesSearch =
      trip.departureStation.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trip.arrivalStation.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trip.train.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'ALL' || trip.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleViewDetail = (tripId: number) => {
    navigate(`/trip/${tripId}`);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="railway-gradient py-16">
        <div className="container mx-auto px-4">
          <h1 className="font-display text-4xl md:text-5xl font-bold text-primary-foreground mb-4">
            Find Your Journey
          </h1>
          <p className="text-primary-foreground/80 text-lg max-w-xl">
            Browse available train trips across Vietnam. Book your tickets easily and travel comfortably.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="container mx-auto px-4 -mt-8">
        <div className="bg-card rounded-xl shadow-elevated p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by station or train name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-3 w-full md:w-48">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Trips</SelectItem>
                  <SelectItem value="SCHEDULED">Scheduled</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Trip List */}
      <div className="container mx-auto px-4 pb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-2xl font-semibold">
            Available Trips
          </h2>
          <span className="text-sm text-muted-foreground">
            {filteredTrips.length} trips found
          </span>
        </div>

        <div className="space-y-4">
          {filteredTrips.map((trip, index) => (
            <div key={trip.id} style={{ animationDelay: `${index * 50}ms` }}>
              <TripCard trip={trip} onViewDetail={handleViewDetail} />
            </div>
          ))}

          {filteredTrips.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <p>No trips found matching your criteria.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TripsPage;
