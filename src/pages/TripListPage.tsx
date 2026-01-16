import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { tripService } from "../services/tripService";
import type { TripListItem } from "../types/trip";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Train,
  MapPin,
  Calendar,
  Users,
  ArrowRight,
  Search,
  Loader2,
} from "lucide-react";

const TripListPage: React.FC = () => {
  const [trips, setTrips] = useState<TripListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const fetchTrips = useCallback(async () => {
    setLoading(true);
    try {
      const response = await tripService.getTrips({ search });
      if (response.success && response.data) {
        setTrips(response.data.trips);
      }
    } catch (error) {
      console.error("Error fetching trips:", error);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchTrips();
  }, [fetchTrips]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTrips();
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-100">
            Tìm Kiếm Chuyến Tàu
          </h1>
          <p className="text-slate-400">
            Chọn một chuyến tàu để khám phá và đặt vé
          </p>
        </div>
        <form onSubmit={handleSearch} className="relative w-full md:w-96">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo ga đi hoặc ga đến..."
            className="pl-10 bg-slate-900 border-slate-700 text-slate-100"
          />
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-slate-500" />
          <Button
            type="submit"
            className="absolute right-1 top-1 h-8 bg-blue-600 hover:bg-blue-700"
          >
            Tìm
          </Button>
        </form>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 grayscale brightness-125">
          <Loader2 className="h-12 w-12 animate-spin text-blue-500 mb-4" />
          <p className="text-slate-400">Đang tải danh sách chuyến tàu...</p>
        </div>
      ) : trips.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trips.map((trip) => (
            <Card
              key={trip.tripId}
              className="bg-slate-900 border-slate-800 hover:border-blue-500/50 transition-all cursor-pointer group flex flex-col overflow-hidden"
              onClick={() => navigate(`/book-trip/${trip.tripId}`)}
            >
              <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 p-4 border-b border-slate-800">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-blue-600 rounded-lg">
                      <Train className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-100">
                        {trip.trainName}
                      </h3>
                      <p className="text-xs text-slate-400 capitalize">
                        {trip.trainTypeName}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span
                      className={`px-2 py-1 rounded text-[10px] uppercase font-bold ${
                        trip.status === "scheduled"
                          ? "bg-green-500/10 text-green-500"
                          : "bg-slate-500/10 text-slate-500"
                      }`}
                    >
                      {trip.status === "scheduled" ? "Sắp chạy" : trip.status}
                    </span>
                  </div>
                </div>
              </div>

              <CardContent className="p-6 flex-grow">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex flex-col items-center w-full">
                    <div className="flex items-center justify-between w-full relative mb-4">
                      <div className="z-10 bg-slate-900 pr-2">
                        <MapPin className="h-4 w-4 text-blue-500 mb-1 mx-auto" />
                        <span className="text-sm font-semibold text-slate-200 block text-center truncate max-w-[80px]">
                          {trip.departureStationName}
                        </span>
                      </div>

                      <div className="absolute top-2 w-full border-t-2 border-dashed border-slate-700 -z-0"></div>

                      <ArrowRight className="z-10 bg-slate-900 px-2 h-5 w-5 text-slate-500" />

                      <div className="z-10 bg-slate-900 pl-2">
                        <MapPin className="h-4 w-4 text-purple-500 mb-1 mx-auto" />
                        <span className="text-sm font-semibold text-slate-200 block text-center truncate max-w-[80px]">
                          {trip.arrivalStationName}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-3 text-sm text-slate-300">
                    <Calendar className="h-4 w-4 text-slate-500" />
                    <span>{formatDate(trip.departureTime)}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-300">
                    <Users className="h-4 w-4 text-slate-500" />
                    <span>{trip.totalAvailablePlaces} chỗ trống</span>
                  </div>
                </div>

                <div className="flex gap-2 text-[10px]">
                  <span className="bg-slate-800 text-slate-400 px-2 py-1 rounded">
                    Ghế: {trip.availableSeats}
                  </span>
                  <span className="bg-slate-800 text-slate-400 px-2 py-1 rounded">
                    Giường: {trip.availableBeds}
                  </span>
                </div>
              </CardContent>

              <div className="p-4 mt-auto border-t border-slate-800 bg-slate-900 group-hover:bg-slate-800 transition-colors text-center">
                <span className="text-sm text-blue-400 font-semibold group-hover:text-blue-300 flex items-center justify-center gap-2">
                  Xem chi tiết & Đặt vé
                  <ArrowRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-slate-900/50 rounded-2xl border border-dashed border-slate-700">
          <Train className="h-16 w-16 text-slate-700 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-slate-300">
            Không tìm thấy chuyến tàu nào
          </h2>
          <p className="text-slate-500">
            Hãy thử tìm kiếm với các từ khóa khác
          </p>
        </div>
      )}
    </div>
  );
};

export default TripListPage;
