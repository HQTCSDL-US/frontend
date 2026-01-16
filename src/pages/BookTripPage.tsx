import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { tripService } from "../services/tripService";
import { concurrencyService } from "../services/concurrencyService";
import type { TripDetails, AvailableTicket } from "../types/trip";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import {
  Train,
  CreditCard,
  ShieldCheck,
  ShieldAlert,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Clock,
  Trash2,
  ArrowLeft,
} from "lucide-react";

const BookTripPage: React.FC = () => {
  const { tripId } = useParams<{ tripId: string }>();
  const navigate = useNavigate();

  const [tripDetails, setTripDetails] = useState<TripDetails | null>(null);
  const [availableTickets, setAvailableTickets] = useState<AvailableTicket[]>(
    []
  );
  const [selectedCarriage, setSelectedCarriage] = useState<number>(1);
  const [selectedSeat, setSelectedSeat] = useState<AvailableTicket | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [demoStatus, setDemoStatus] = useState<{
    type: "success" | "error" | "pending";
    message: string;
    details?: Record<string, unknown>;
  } | null>(null);

  const fetchInitialData = useCallback(async () => {
    if (!tripId) return;
    try {
      // Fetch details without carriage filter to get ALL carriages
      const res = await tripService.getTripDetails(parseInt(tripId));
      if (res.success && res.data) {
        setTripDetails(res.data);
      }
    } catch (error) {
      console.error("Error fetching initial trip data:", error);
    }
  }, [tripId]);

  const fetchCarriageData = useCallback(
    async (carriageNum: number) => {
      if (!tripId) return;
      setLoading(true);
      try {
        const [detailsRes, ticketsRes] = await Promise.all([
          tripService.getTripDetails(parseInt(tripId), carriageNum),
          tripService.getAvailableTickets(parseInt(tripId), {
            carriageNumber: carriageNum,
          }),
        ]);

        if (detailsRes.success && detailsRes.data) {
          // Merge seats and beds for display
          setTripDetails((prev) => {
            if (!prev) return detailsRes.data as TripDetails;
            return {
              ...detailsRes.data,
              carriages: prev.carriages, // Keep the full carriages list from initial fetch
            } as TripDetails;
          });
        }
        if (ticketsRes.success && ticketsRes.data) {
          setAvailableTickets(ticketsRes.data.tickets);
        }
      } catch (error) {
        console.error("Error fetching carriage data:", error);
      } finally {
        setLoading(false);
      }
    },
    [tripId]
  );

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  useEffect(() => {
    fetchCarriageData(selectedCarriage);
  }, [fetchCarriageData, selectedCarriage]);

  const handleBook = async (safe: boolean) => {
    if (!selectedSeat || !tripId) return;

    setSubmitting(true);
    setDemoStatus({
      type: "pending",
      message: `Đang thực hiện đặt vé ${safe ? "AN TOÀN" : "KHÔNG AN TOÀN"}...`,
    });

    try {
      const request = {
        tripId: parseInt(tripId),
        seatId: selectedSeat.placeId, // Backend uses place_id for seat/bed
        fromStationId: tripDetails?.tripInfo.departureStationId || 0,
        toStationId: tripDetails?.tripInfo.arrivalStationId || 0,
      };

      const res = safe
        ? await concurrencyService.bookTicketSafe(request)
        : await concurrencyService.bookTicketUnsafe(request);

      if (res.success) {
        setDemoStatus({
          type: "success",
          message: res.message,
          details: res.data as unknown as Record<string, unknown>,
        });
        // Refresh availability
        fetchCarriageData(selectedCarriage);
      } else {
        setDemoStatus({ type: "error", message: res.message });
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      setDemoStatus({
        type: "error",
        message: err.response?.data?.message || "Lỗi hệ thống khi đặt vé.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading && !tripDetails) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-slate-100">
        <Loader2 className="h-12 w-12 animate-spin text-blue-500 mb-4" />
        <p>Đang tải thông tin chuyến tàu...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <Button
        variant="ghost"
        className="mb-6 text-slate-400 hover:text-slate-100 group"
        onClick={() => navigate("/trips")}
      >
        <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
        Quay lại tìm kiếm
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Trip Info & Carriage Selection */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="bg-slate-900 border-slate-800 overflow-hidden">
            <CardHeader className="bg-blue-600/10 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <Train className="h-6 w-6 text-blue-500" />
                <CardTitle className="text-xl text-slate-100">
                  {tripDetails?.tripInfo.trainName}
                </CardTitle>
              </div>
              <CardDescription className="text-slate-400">
                {tripDetails?.tripInfo.routeName}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <div className="w-0.5 h-10 border-l-2 border-dashed border-slate-700 mx-[3px] my-1"></div>
                  <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                </div>
                <div className="space-y-6">
                  <div>
                    <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">
                      Khởi hành
                    </p>
                    <p className="font-semibold text-slate-200">
                      {tripDetails?.tripInfo.departureStationName}
                    </p>
                    <p className="text-sm text-slate-400">
                      {formatDate(tripDetails?.tripInfo.departureTime)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">
                      Đến nơi
                    </p>
                    <p className="font-semibold text-slate-200">
                      {tripDetails?.tripInfo.arrivalStationName}
                    </p>
                    <p className="text-sm text-slate-400">
                      {formatDate(tripDetails?.tripInfo.estimatedArrivalTime)}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-lg text-slate-200 px-1">
                Chọn Toa Tàu
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-4 gap-2">
              {tripDetails?.carriages.map((carriage) => (
                <Button
                  key={carriage.carriageId}
                  variant={
                    selectedCarriage === carriage.carriageNumber
                      ? "default"
                      : "outline"
                  }
                  className={`h-12 flex flex-col items-center justify-center gap-0.5 ${
                    selectedCarriage === carriage.carriageNumber
                      ? "bg-blue-600 hover:bg-blue-700 border-blue-600"
                      : "bg-slate-800 border-slate-700 hover:bg-slate-700"
                  }`}
                  onClick={() => setSelectedCarriage(carriage.carriageNumber)}
                >
                  <span className="text-xs font-bold">
                    Toa {carriage.carriageNumber}
                  </span>
                  <span className="text-[9px] opacity-70">
                    {carriage.availableSeats > 0
                      ? `${carriage.availableSeats} ghế`
                      : `${carriage.availableBeds} giường`}
                  </span>
                </Button>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Middle Column: Seat Map */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-slate-900 border-slate-800 min-h-[500px]">
            <CardHeader className="flex flex-row items-center justify-between border-b border-slate-800 pb-6">
              <div>
                <CardTitle className="text-xl text-slate-100">
                  Sơ đồ Toa {selectedCarriage}
                </CardTitle>
                <CardDescription className="text-slate-400">
                  {
                    tripDetails?.carriages.find(
                      (c) => c.carriageNumber === selectedCarriage
                    )?.carriageTypeName
                  }
                </CardDescription>
              </div>
              <div className="flex gap-4 text-xs">
                <div className="flex items-center gap-1.5 text-slate-400">
                  <div className="w-4 h-4 rounded bg-slate-800 border border-slate-700"></div>
                  <span>Trống</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-400">
                  <div className="w-4 h-4 rounded bg-blue-600"></div>
                  <span>Đang chọn</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-400">
                  <div className="w-4 h-4 rounded bg-slate-800 border border-slate-700 relative">
                    <div className="absolute inset-0 flex items-center justify-center text-[10px] text-slate-400 font-bold">
                      X
                    </div>
                  </div>
                  <span>Đã đặt</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-10">
              {loading ? (
                <div className="flex justify-center items-center py-20">
                  <Loader2 className="h-10 w-10 animate-spin text-slate-700" />
                </div>
              ) : (
                <>
                  {tripDetails?.carriages.find(
                    (c) => c.carriageNumber === selectedCarriage
                  )?.carriageCategory === "Sleeper" ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
                      {/* Group beds by Room */}
                      {Object.entries(
                        (tripDetails?.beds || []).reduce((acc, bed) => {
                          if (!acc[bed.roomNumber]) acc[bed.roomNumber] = [];
                          acc[bed.roomNumber].push(bed);
                          return acc;
                        }, {} as Record<number, typeof tripDetails.beds>)
                      )
                        .sort(([numA], [numB]) => Number(numA) - Number(numB))
                        .map(([roomNumber, beds]) => (
                          <div
                            key={roomNumber}
                            className="bg-slate-800/40 rounded-lg p-4 border border-slate-800"
                          >
                            <h4 className="text-xs font-semibold text-slate-500 mb-3 uppercase tracking-wider">
                              Phòng {roomNumber}
                            </h4>
                            <div className="grid grid-cols-2 gap-3">
                              {beds
                                .sort((a, b) => a.bedNumber - b.bedNumber)
                                .map((bed) => {
                                  const availableInfo = availableTickets.find(
                                    (t) =>
                                      t.bedNumber === bed.bedNumber &&
                                      t.roomNumber === bed.roomNumber
                                  );
                                  const isAvailable = bed.isAvailable;

                                  return (
                                    <button
                                      key={bed.bedId}
                                      disabled={!isAvailable}
                                      className={`relative h-14 rounded-md flex flex-col items-center justify-center font-bold transition-all ${
                                        selectedSeat?.placeId ===
                                          availableInfo?.placeId &&
                                        selectedSeat?.placeId !== undefined
                                          ? "bg-blue-600 text-white ring-2 ring-blue-400 ring-offset-2 ring-offset-slate-900"
                                          : isAvailable
                                          ? "bg-slate-800 text-slate-300 border border-slate-700 hover:border-blue-500 hover:text-blue-400"
                                          : "bg-slate-800/20 text-slate-600 cursor-not-allowed border border-slate-800/50"
                                      }`}
                                      onClick={() =>
                                        setSelectedSeat(availableInfo || null)
                                      }
                                    >
                                      <span className="text-sm">
                                        {bed.bedNumber}
                                      </span>
                                      <span className="text-[10px] font-normal opacity-70">
                                        Tầng {bed.floorLevel}
                                      </span>
                                      {!isAvailable && (
                                        <div className="absolute inset-0 flex items-center justify-center opacity-30">
                                          <Trash2 className="h-5 w-5" />
                                        </div>
                                      )}
                                    </button>
                                  );
                                })}
                            </div>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4 max-w-3xl mx-auto">
                      {/* Map over only seats for the current carriage */}
                      {(tripDetails?.seats || [])
                        .sort((a, b) => a.seatNumber - b.seatNumber)
                        .map((seat) => {
                          const availableInfo = availableTickets.find(
                            (t) => t.seatNumber === seat.seatNumber
                          );
                          const isAvailable = seat.isAvailable;

                          return (
                            <button
                              key={seat.seatId}
                              disabled={!isAvailable}
                              className={`relative h-12 w-full rounded-md flex items-center justify-center font-bold transition-all ${
                                selectedSeat?.placeId ===
                                  availableInfo?.placeId &&
                                selectedSeat?.placeId !== undefined
                                  ? "bg-blue-600 text-white ring-2 ring-blue-400 ring-offset-2 ring-offset-slate-900"
                                  : isAvailable
                                  ? "bg-slate-800 text-slate-300 border border-slate-700 hover:border-blue-500 hover:text-blue-400"
                                  : "bg-slate-800/20 text-slate-600 cursor-not-allowed border border-slate-800/50"
                              }`}
                              onClick={() =>
                                setSelectedSeat(availableInfo || null)
                              }
                            >
                              {seat.seatNumber}
                              {!isAvailable && (
                                <div className="absolute inset-0 flex items-center justify-center opacity-40">
                                  <Trash2 className="h-5 w-5" />
                                </div>
                              )}
                            </button>
                          );
                        })}
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* Booking & Concurrency Controls */}
          {selectedSeat && (
            <Card className="bg-slate-900 border-slate-800 border-l-4 border-l-blue-600 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                  <div className="space-y-1 text-center md:text-left">
                    <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                      <CreditCard className="h-5 w-5 text-blue-500" />
                      Xác nhận đặt vé
                    </h3>
                    <p className="text-sm text-slate-400">
                      Chuyến <strong>{tripDetails?.tripInfo.trainName}</strong>{" "}
                      • Toa <strong>{selectedCarriage}</strong> • Ghế{" "}
                      <strong>
                        {selectedSeat.seatNumber || selectedSeat.bedNumber}
                      </strong>
                    </p>
                    <div className="pt-2">
                      <span className="text-2xl font-black text-blue-400">
                        {new Intl.NumberFormat("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        }).format(selectedSeat.totalPrice)}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                    <Button
                      disabled={submitting}
                      variant="outline"
                      className="border-amber-500/50 text-amber-500 hover:bg-amber-500 hover:text-white bg-slate-900"
                      onClick={() => handleBook(false)}
                    >
                      <ShieldAlert className="mr-2 h-4 w-4" />
                      Unsafe Book (Demo)
                    </Button>
                    <Button
                      disabled={submitting}
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => handleBook(true)}
                    >
                      <ShieldCheck className="mr-2 h-4 w-4" />
                      Safe Book (Demo)
                    </Button>
                  </div>
                </div>

                {demoStatus && (
                  <div
                    className={`mt-6 p-4 rounded-lg border flex items-start gap-3 animate-in shake-in duration-300 ${
                      demoStatus.type === "success"
                        ? "bg-green-500/10 border-green-500 text-green-400"
                        : demoStatus.type === "error"
                        ? "bg-red-500/10 border-red-500 text-red-400"
                        : "bg-amber-500/10 border-amber-500 text-amber-400"
                    }`}
                  >
                    {demoStatus.type === "success" ? (
                      <CheckCircle2 className="h-5 w-5 mt-0.5 shrink-0" />
                    ) : demoStatus.type === "error" ? (
                      <AlertCircle className="h-5 w-5 mt-0.5 shrink-0" />
                    ) : (
                      <Clock className="h-5 w-5 mt-0.5 animate-pulse shrink-0" />
                    )}

                    <div className="flex-grow">
                      <p className="font-semibold">{demoStatus.message}</p>
                      {demoStatus.details && (
                        <div className="mt-2 text-xs font-mono bg-black/30 p-2 rounded max-h-32 overflow-auto">
                          {JSON.stringify(demoStatus.details, null, 2)}
                        </div>
                      )}
                    </div>

                    {demoStatus.type !== "pending" && (
                      <button
                        onClick={() => setDemoStatus(null)}
                        className="opacity-50 hover:opacity-100"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookTripPage;
