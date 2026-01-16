import React, { useEffect, useState, useCallback } from "react";
import { ticketService } from "../services/ticketService";
import { concurrencyService } from "../services/concurrencyService";
import type { TicketListItem } from "../types/ticket";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import {
  Ticket,
  Train,
  Calendar,
  Trash2,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  Loader2,
  RefreshCw,
} from "lucide-react";

const MyTicketsPage: React.FC = () => {
  const [tickets, setTickets] = useState<TicketListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submittingId, setSubmittingId] = useState<number | null>(null);
  const [demoStatus, setDemoStatus] = useState<{
    id: number;
    type: "success" | "error" | "pending";
    message: string;
    details?: Record<string, unknown>;
  } | null>(null);

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    try {
      const response = await ticketService.getMyTickets(1, 100);
      if (response.success && response.data) {
        setTickets(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching tickets:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const handleCancel = async (ticketId: number, safe: boolean) => {
    setSubmittingId(ticketId);
    setDemoStatus({
      id: ticketId,
      type: "pending",
      message: `Đang thực hiện hủy vé ${
        safe ? "AN TOÀN" : "KHÔNG AN TOÀN"
      } (backend đang xử lý 2s delay)...`,
    });

    try {
      const res = safe
        ? await concurrencyService.cancelTicketSafe({ ticketId })
        : await concurrencyService.cancelTicketUnsafe({ ticketId });

      if (res.success) {
        setDemoStatus({
          id: ticketId,
          type: "success",
          message: res.message,
          details: res.data as unknown as Record<string, unknown>,
        });
        // Remove from list after short delay if it was actually cancelled
        // Note: In unsafe demo, it might SUCCESS but then rollback
        setTimeout(fetchTickets, 3000);
      } else {
        setDemoStatus({ id: ticketId, type: "error", message: res.message });
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      setDemoStatus({
        id: ticketId,
        type: "error",
        message: err.response?.data?.message || "Lỗi hệ thống khi hủy vé.",
      });
    } finally {
      setSubmittingId(null);
    }
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
    <div className="container mx-auto py-8 px-4 max-w-5xl">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-100 flex items-center gap-3">
            <Ticket className="h-8 w-8 text-blue-500" />
            Vé Của Tôi
          </h1>
          <p className="text-slate-400">Quản lý và thực hiện demo hủy vé</p>
        </div>
        <Button
          variant="outline"
          onClick={fetchTickets}
          disabled={loading}
          className="border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800"
        >
          <RefreshCw
            className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`}
          />
          Làm mới
        </Button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 grayscale">
          <Loader2 className="h-12 w-12 animate-spin text-blue-500 mb-4" />
          <p className="text-slate-400">Đang tải danh sách vé...</p>
        </div>
      ) : tickets.length > 0 ? (
        <div className="grid grid-cols-1 gap-6">
          {tickets.map((ticket) => (
            <Card
              key={ticket.ticketId}
              className="bg-slate-900 border-slate-800 overflow-hidden hover:border-slate-700 transition-colors"
            >
              <CardContent className="p-0">
                <div className="flex flex-col md:flex-row">
                  {/* Left: Ticket Core Info */}
                  <div className="flex-grow p-6 flex flex-col md:flex-row gap-6 border-b md:border-b-0 md:border-r border-slate-800">
                    <div className="flex flex-col items-center justify-center bg-blue-600/10 rounded-lg p-4 min-w-[140px]">
                      <span className="text-xs text-blue-400 font-bold uppercase tracking-tight mb-1">
                        {ticket.ticketType === "BED" ? "Giường" : "Chỗ Ngồi"}
                      </span>
                      <span className="text-3xl font-black text-blue-500">
                        {ticket.ticketType === "BED"
                          ? ticket.bedNumber
                          : ticket.seatNumber}
                      </span>
                      <div className="flex flex-col items-center mt-1">
                        <span className="text-[10px] text-blue-400/70 font-semibold uppercase">
                          Toa {ticket.carriageNumber}
                        </span>
                        <span className="text-[9px] text-slate-500 italic">
                          {ticket.carriageTypeName}
                        </span>
                        {ticket.ticketType === "BED" && (
                          <div className="flex flex-col items-center mt-0.5 border-t border-blue-500/20 pt-1 w-full text-[9px] text-blue-300">
                            <span>Phòng {ticket.roomNumber}</span>
                            <span>Tầng {ticket.floorLevel}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex-grow space-y-4">
                      <div className="flex items-center gap-2">
                        <Train className="h-4 w-4 text-slate-500" />
                        <h3 className="font-bold text-slate-100">
                          {ticket.tripName}
                        </h3>
                        {ticket.status === "paid" && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-green-500/10 text-green-500 border border-green-500/20 ml-2">
                            Paid
                          </span>
                        )}
                        {ticket.status === "unpaid" && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-500/10 text-amber-500 border border-amber-500/20 ml-2">
                            Unpaid
                          </span>
                        )}
                        {ticket.status === "cancelled" && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-red-500/10 text-red-500 border border-red-500/20 ml-2">
                            Cancelled
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex items-center gap-3 text-sm text-slate-300">
                          <Calendar className="h-4 w-4 text-slate-500" />
                          <div>
                            <p className="text-[10px] text-slate-500 uppercase">
                              Khởi hành
                            </p>
                            <span>{formatDate(ticket.departureTime)}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-slate-300">
                          <CheckCircle2 className="h-4 w-4 text-slate-500" />
                          <div>
                            <p className="text-[10px] text-slate-500 uppercase">
                              Ngày đặt
                            </p>
                            <span>{formatDate(ticket.bookingDate)}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col justify-center text-right border-t md:border-t-0 pt-4 md:pt-0">
                      <span className="text-xs text-slate-500">Giá Vé</span>
                      <span className="text-xl font-bold text-slate-100">
                        {new Intl.NumberFormat("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        }).format(ticket.price)}
                      </span>
                      <span className="text-[10px] text-slate-500 mt-1">
                        ID: #{ticket.ticketId}
                      </span>
                    </div>
                  </div>

                  {/* Right: Demo Controls */}
                  <div className="p-6 bg-slate-950/50 flex flex-col justify-center gap-3 min-w-[220px]">
                    <Button
                      disabled={submittingId !== null}
                      variant="outline"
                      className="w-full bg-slate-900 border-amber-500/30 text-amber-500 hover:bg-amber-500 hover:text-white"
                      onClick={() => handleCancel(ticket.ticketId, false)}
                    >
                      <ShieldAlert className="mr-2 h-4 w-4" />
                      Unsafe Cancel
                    </Button>
                    <Button
                      disabled={submittingId !== null}
                      variant="outline"
                      className="w-full bg-slate-900 border-green-500/30 text-green-500 hover:bg-green-500 hover:text-white"
                      onClick={() => handleCancel(ticket.ticketId, true)}
                    >
                      <ShieldCheck className="mr-2 h-4 w-4" />
                      Safe Cancel
                    </Button>
                  </div>
                </div>

                {demoStatus && demoStatus.id === ticket.ticketId && (
                  <div
                    className={`m-4 p-4 rounded-lg border flex items-start gap-3 animate-in slide-in-from-top-2 ${
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
                      <p className="font-semibold text-sm">
                        {demoStatus.message}
                      </p>
                      {demoStatus.details && (
                        <div className="mt-2 text-[10px] font-mono bg-black/30 p-2 rounded max-h-32 overflow-auto">
                          {JSON.stringify(demoStatus.details, null, 2)}
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => setDemoStatus(null)}
                      className="opacity-50 hover:opacity-100"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-slate-900/50 rounded-2xl border border-dashed border-slate-700">
          <Ticket className="h-16 w-16 text-slate-700 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-slate-300">
            Bạn chưa có vé nào
          </h2>
          <p className="text-slate-500">
            Hãy chuyển sang mục đặt vé để trải nghiệm hệ thống
          </p>
        </div>
      )}
    </div>
  );
};

export default MyTicketsPage;
