import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Label } from "../components/ui/label";
import { Alert, AlertDescription } from "../components/ui/alert";
import { ArrowLeft, FileText, TrendingUp } from "lucide-react";
import { phantomService } from "../services/phantomService";
import { tripService } from "../services/tripService";

export default function PhantomDemoPage() {
    const navigate = useNavigate();
    const [trips, setTrips] = useState<any[]>([]);
    const [selectedTripId, setSelectedTripId] = useState<string>("");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<{
        tickets: any[];
        reportedTickets: number;
        reportedRevenue: number;
        actualTicketsNow: number;
        message: string;
    } | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchTrips();
    }, []);

    const fetchTrips = async () => {
        try {
            const response = await tripService.getTrips({ size: 50 });
            if (response.success && response.data?.trips) {
                setTrips(response.data.trips);
                // Auto-select first trip
                if (response.data.trips.length > 0) {
                    setSelectedTripId(String(response.data.trips[0].tripId));
                }
            }
        } catch (err) {
            console.error("Error fetching trips:", err);
        }
    };

    const handleGenerateReport = async (useSafeMode: boolean) => {
        if (!selectedTripId || isNaN(parseInt(selectedTripId))) {
            setError("Vui lòng chọn chuyến tàu");
            return;
        }

        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const response = useSafeMode
                ? await phantomService.exportRevenueReportSafe({ tripId: parseInt(selectedTripId) })
                : await phantomService.exportRevenueReportUnsafe({ tripId: parseInt(selectedTripId) });

            if (response.success && response.data) {
                setResult({
                    tickets: response.data.tickets || [],
                    reportedTickets: response.data.reportedTickets,
                    reportedRevenue: response.data.reportedRevenue,
                    actualTicketsNow: response.data.actualTicketsNow,
                    message: response.message,
                });
            } else {
                setError(response.message || "Không thể tạo báo cáo");
            }
        } catch (err: any) {
            setError(err.response?.data?.message || "Lỗi khi tạo báo cáo doanh thu");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
            {/* Header */}
            <div className="border-b border-slate-800 bg-slate-950/50 backdrop-blur-sm sticky top-0 z-10">
                <div className="container mx-auto px-6 py-4">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate("/")}
                            className="text-slate-400 hover:text-white"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Quay lại
                        </Button>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                                <FileText className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-white">Báo Cáo Doanh Thu</h1>
                                <p className="text-sm text-slate-400">Xuất báo cáo doanh thu theo chuyến tàu</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-6 py-8 max-w-4xl">
                {/* Demo Info Banner */}
                <Alert className="mb-6 bg-blue-950/30 border-blue-800">
                    <AlertDescription className="text-blue-200">
                        <strong>💡 Demo Phantom Read:</strong> Chức năng này minh họa vấn đề "Phantom Read" trong database concurrency.
                        Trong khi báo cáo đang được tạo (10 giây), nếu có khách hàng đặt vé mới, dữ liệu có thể bị không nhất quán.
                    </AlertDescription>
                </Alert>

                {/* Report Generation Form */}
                <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                            <TrendingUp className="w-5 h-5" />
                            Tạo Báo Cáo Doanh Thu
                        </CardTitle>
                        <CardDescription>Chọn chuyến tàu để xuất báo cáo doanh thu</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Trip Selector */}
                        <div className="space-y-2">
                            <Label htmlFor="tripSelect" className="text-slate-200">
                                Chọn Chuyến Tàu
                            </Label>
                            <select
                                id="tripSelect"
                                value={selectedTripId}
                                onChange={(e) => setSelectedTripId(e.target.value)}
                                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                            >
                                <option value="">-- Chọn chuyến tàu --</option>
                                {trips.map((trip) => (
                                    <option key={trip.tripId} value={String(trip.tripId)}>
                                        Chuyến #{trip.tripId} - {trip.routeName} ({new Date(trip.departureTime).toLocaleDateString("vi-VN")})
                                    </option>
                                ))}

                            </select>
                            {trips.length === 0 && (
                                <p className="text-xs text-slate-400">Đang tải danh sách chuyến tàu...</p>
                            )}
                        </div>

                        {/* Action Buttons */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Button
                                onClick={() => handleGenerateReport(false)}
                                disabled={loading || !selectedTripId}
                                className="bg-red-600 hover:bg-red-700 text-white disabled:opacity-50"
                            >
                                {loading ? "Đang xử lý..." : "⚠️ Unsafe Mode (READ COMMITTED)"}
                            </Button>
                            <Button
                                onClick={() => handleGenerateReport(true)}
                                disabled={loading || !selectedTripId}
                                className="bg-green-600 hover:bg-green-700 text-white disabled:opacity-50"
                            >
                                {loading ? "Đang xử lý..." : "✓ Safe Mode (SERIALIZABLE)"}
                            </Button>
                        </div>

                        <div className="text-xs text-slate-400 space-y-1">
                            <p>• <strong>Unsafe Mode:</strong> Có thể xảy ra Phantom Read khi có giao dịch đồng thời</p>
                            <p>• <strong>Safe Mode:</strong> Ngăn chặn Phantom Read bằng SERIALIZABLE isolation level</p>
                        </div>

                        {/* Error Display */}
                        {error && (
                            <Alert className="bg-red-950/30 border-red-800">
                                <AlertDescription className="text-red-200">
                                    <strong>Lỗi:</strong> {error}
                                </AlertDescription>
                            </Alert>
                        )}

                        {/* Loading State */}
                        {loading && (
                            <Alert className="bg-yellow-950/30 border-yellow-800">
                                <AlertDescription className="text-yellow-200">
                                    ⏳ Đang tạo báo cáo... (10 giây)
                                    <br />
                                    <span className="text-xs">
                                        Trong thời gian này, khách hàng có thể đặt vé đồng thời để tạo ra Phantom Read trong Unsafe Mode
                                    </span>
                                </AlertDescription>
                            </Alert>
                        )}

                        {/* Result Display */}
                        {result && !loading && (
                            <Card className="bg-slate-800/50 border-slate-700">
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle className="text-white text-lg">Kết Quả Báo Cáo</CardTitle>
                                            <CardDescription>{result.message}</CardDescription>
                                        </div>
                                        {result.reportedTickets !== result.actualTicketsNow && (
                                            <div className="bg-red-500/20 border border-red-500 px-3 py-1 rounded-md">
                                                <span className="text-red-300 font-bold text-sm">⚠️ PHANTOM DETECTED!</span>
                                            </div>
                                        )}
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700">
                                            <p className="text-slate-400 text-xs mb-1">Số vé trong báo cáo</p>
                                            <p className="text-2xl font-bold text-blue-400">{result.reportedTickets}</p>
                                            <p className="text-xs text-slate-500 mt-1">Từ table variable</p>
                                        </div>
                                        <div className={`bg-slate-900/50 p-4 rounded-lg border ${result.reportedTickets !== result.actualTicketsNow
                                            ? 'border-red-500 bg-red-950/20'
                                            : 'border-green-500 bg-green-950/20'
                                            }`}>
                                            <p className="text-slate-400 text-xs mb-1">Số vé thực tế hiện tại</p>
                                            <p className={`text-2xl font-bold ${result.reportedTickets !== result.actualTicketsNow
                                                ? 'text-red-400'
                                                : 'text-green-400'
                                                }`}>
                                                {result.actualTicketsNow}
                                            </p>
                                            <p className="text-xs text-slate-500 mt-1">Từ database</p>
                                        </div>
                                        <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700">
                                            <p className="text-slate-400 text-xs mb-1">Tổng doanh thu</p>
                                            <p className="text-2xl font-bold text-green-400">
                                                {result.reportedRevenue.toLocaleString("vi-VN")}
                                            </p>
                                            <p className="text-xs text-slate-500 mt-1">VNĐ</p>
                                        </div>
                                    </div>

                                    {/* Ticket List Table */}
                                    <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700">
                                        <h4 className="text-white font-semibold mb-3">Danh Sách Vé (Từ Table Variable)</h4>
                                        <div className="max-h-64 overflow-y-auto">
                                            <table className="w-full text-sm">
                                                <thead className="sticky top-0 bg-slate-800 text-slate-300">
                                                    <tr>
                                                        <th className="text-left p-2 border-b border-slate-700">STT</th>
                                                        <th className="text-left p-2 border-b border-slate-700">Mã Vé</th>
                                                        <th className="text-right p-2 border-b border-slate-700">Giá Vé (VNĐ)</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="text-slate-300">
                                                    {result.tickets.map((ticket, index) => (
                                                        <tr key={ticket.ticketId} className="border-b border-slate-800 hover:bg-slate-800/50">
                                                            <td className="p-2">{index + 1}</td>
                                                            <td className="p-2">#{ticket.ticketId}</td>
                                                            <td className="p-2 text-right font-mono text-green-400">
                                                                {ticket.price.toLocaleString("vi-VN")}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                                <tfoot className="bg-slate-800 font-semibold text-white">
                                                    <tr>
                                                        <td colSpan={2} className="p-2 border-t border-slate-600">Tổng cộng</td>
                                                        <td className="p-2 text-right border-t border-slate-600 font-mono text-green-400">
                                                            {result.reportedRevenue.toLocaleString("vi-VN")}
                                                        </td>
                                                    </tr>
                                                </tfoot>
                                            </table>
                                        </div>
                                        <p className="text-xs text-slate-500 mt-2">
                                            📋 {result.tickets.length} vé được đọc vào table variable lúc đầu transaction
                                        </p>
                                    </div>

                                    {result.reportedTickets !== result.actualTicketsNow && (
                                        <Alert className="bg-red-950/30 border-red-800">
                                            <AlertDescription className="text-red-200">
                                                <strong>🔴 Phát hiện Phantom Read!</strong>
                                                <br />
                                                Báo cáo đếm <strong>{result.reportedTickets} vé</strong> trong table variable,
                                                nhưng hiện tại database có <strong>{result.actualTicketsNow} vé</strong>.
                                                <br />
                                                Chênh lệch: <strong className="text-red-300">
                                                    {result.actualTicketsNow - result.reportedTickets} vé "phantom"
                                                </strong> đã được thêm vào trong khi transaction đang chạy!
                                            </AlertDescription>
                                        </Alert>
                                    )}

                                    {result.reportedTickets === result.actualTicketsNow && (
                                        <Alert className="bg-green-950/30 border-green-800">
                                            <AlertDescription className="text-green-200">
                                                <strong>✅ Không có Phantom Read</strong>
                                                <br />
                                                Báo cáo nhất quán: {result.reportedTickets} vé trong báo cáo = {result.actualTicketsNow} vé trong database.
                                                Isolation level SERIALIZABLE đã ngăn chặn thành công phantom rows!
                                            </AlertDescription>
                                        </Alert>
                                    )}
                                </CardContent>
                            </Card>
                        )}
                    </CardContent>
                </Card>

                {/* Instructions */}
                <Card className="mt-6 bg-slate-900/30 border-slate-800">
                    <CardHeader>
                        <CardTitle className="text-white text-lg">Cách Sử Dụng</CardTitle>
                    </CardHeader>
                    <CardContent className="text-slate-300 space-y-3 text-sm">
                        <div>
                            <strong className="text-white">Bước 1:</strong> Chọn chuyến tàu cần xuất báo cáo
                        </div>
                        <div>
                            <strong className="text-white">Bước 2:</strong> Chọn chế độ:
                            <ul className="list-disc list-inside ml-4 mt-2 space-y-1 text-slate-400">
                                <li><strong>Unsafe Mode:</strong> Báo cáo có thể có Phantom Read nếu khách đặt vé đồng thời</li>
                                <li><strong>Safe Mode:</strong> Báo cáo đảm bảo chính xác, khách đặt vé sẽ bị chờ cho đến khi báo cáo hoàn tất</li>
                            </ul>
                        </div>
                        <div>
                            <strong className="text-white">Để demo Phantom Read:</strong>
                            <ul className="list-disc list-inside ml-4 mt-2 space-y-1 text-slate-400">
                                <li>Click "Unsafe Mode" → trong 10 giây chờ, vào trang "Tìm Kiếm & Đặt Vé" và đặt thêm 1 vé cho cùng chuyến</li>
                                <li>Kết quả báo cáo sẽ không bao gồm vé mới đặt (Phantom!)</li>
                                <li>Thử lại với "Safe Mode" → vé sẽ bị chờ đến khi báo cáo xong</li>
                            </ul>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
