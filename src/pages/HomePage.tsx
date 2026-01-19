import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Train,
  LogOut,
  Ticket,
  Search,
  ShieldAlert,
  ArrowRight,
  DollarSign,
} from "lucide-react";

export const HomePage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      {/* Navbar */}
      <nav className="border-b border-slate-800 bg-slate-900/50 backdrop-blur sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => navigate("/")}
          >
            <div className="p-2 bg-blue-600 rounded-lg">
              <Train className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-black tracking-tighter text-white">
              RAILWAY<span className="text-blue-500">PRO</span>
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex flex-col items-end mr-2">
              <span className="text-sm font-bold text-slate-200">
                {user?.username}
              </span>
              <span className="text-[10px] text-slate-500 uppercase font-black">
                {user?.role}
              </span>
            </div>
            <Button
              variant="outline"
              onClick={handleLogout}
              className="gap-2 border-slate-800 hover:bg-slate-800"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="container mx-auto py-12 px-4 flex-grow">
        <div className="max-w-5xl mx-auto space-y-12">
          <div className="text-center space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
            <h1 className="text-5xl md:text-6xl font-black text-white tracking-tight">
              Hệ Thống{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
                Quản Lý Vé Tàu
              </span>
            </h1>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              Demo các kịch bản giao tác đồng thời (Concurrency Transactions)
              trong hệ thống đặt vé thực tế.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card
              className="bg-slate-900 border-slate-800 hover:border-blue-500/50 transition-all cursor-pointer group relative overflow-hidden h-64"
              onClick={() => navigate("/trips")}
            >
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                <Search className="h-32 w-32 text-blue-500" />
              </div>
              <CardHeader className="h-full flex flex-col justify-end p-8">
                <div className="p-3 bg-blue-600/10 rounded-xl w-fit group-hover:bg-blue-600 transition-all duration-300 mb-4">
                  <Search className="h-8 w-8 text-blue-500 group-hover:text-white" />
                </div>
                <CardTitle className="text-2xl text-white">
                  Tìm Kiếm & Đặt Vé
                </CardTitle>
                <CardDescription className="text-slate-400 mt-2">
                  Khám phá lộ trình và thực hiện demo đặt vé với các mức cô lập
                  khác nhau.
                </CardDescription>
                <div className="mt-4 flex items-center text-blue-400 font-bold text-sm">
                  Bắt đầu ngay{" "}
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </CardHeader>
            </Card>

            <Card
              className="bg-slate-900 border-slate-800 hover:border-purple-500/50 transition-all cursor-pointer group relative overflow-hidden h-64"
              onClick={() => navigate("/my-tickets")}
            >
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                <Ticket className="h-32 w-32 text-purple-500" />
              </div>
              <CardHeader className="h-full flex flex-col justify-end p-8">
                <div className="p-3 bg-purple-600/10 rounded-xl w-fit group-hover:bg-purple-600 transition-all duration-300 mb-4">
                  <Ticket className="h-8 w-8 text-purple-500 group-hover:text-white" />
                </div>
                <CardTitle className="text-2xl text-white">
                  Vé Của Tôi
                </CardTitle>
                <CardDescription className="text-slate-400 mt-2">
                  Quản lý hành trình của bạn và thực hiện demo kịch bản hủy vé
                  đồng thời.
                </CardDescription>
                <div className="mt-4 flex items-center text-purple-400 font-bold text-sm">
                  Quản lý vé{" "}
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </CardHeader>
            </Card>

            <Card
              className="bg-slate-900 border-slate-800 hover:border-purple-500/50 transition-all cursor-pointer group relative overflow-hidden h-64"
              onClick={() => navigate("/phantom-demo")}
            >
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                <ShieldAlert className="h-32 w-32 text-purple-500" />
              </div>
              <CardHeader className="h-full flex flex-col justify-end p-8">
                <div className="p-3 bg-purple-600/10 rounded-xl w-fit group-hover:bg-purple-600 transition-all duration-300 mb-4">
                  <ShieldAlert className="h-8 w-8 text-purple-500 group-hover:text-white" />
                </div>
                <CardTitle className="text-2xl text-white">
                  Báo Cáo Doanh Thu
                </CardTitle>
                <CardDescription className="text-slate-400 mt-2">
                  Xuất báo cáo doanh thu theo chuyến tàu. Demo Phantom Read với
                  isolation level khác nhau.
                </CardDescription>
                <div className="mt-4 flex items-center text-purple-400 font-bold text-sm">
                  Xem báo cáo{" "}
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </CardHeader>
            </Card>

            <Card
              className="bg-slate-900 border-slate-800 hover:border-green-500/50 transition-all cursor-pointer group relative overflow-hidden h-64"
              onClick={() => navigate("/admin/pricing-rules")}
            >
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                <DollarSign className="h-32 w-32 text-green-500" />
              </div>
              <CardHeader className="h-full flex flex-col justify-end p-8">
                <div className="p-3 bg-green-600/10 rounded-xl w-fit group-hover:bg-green-600 transition-all duration-300 mb-4">
                  <DollarSign className="h-8 w-8 text-green-500 group-hover:text-white" />
                </div>
                <CardTitle className="text-2xl text-white">
                  Quản Lý Giá Vé
                </CardTitle>
                <CardDescription className="text-slate-400 mt-2">
                  Cấu hình quy tắc định giá. Demo Unrepeatable Read khi cập nhật giá trong lúc đặt vé.
                </CardDescription>
                <div className="mt-4 flex items-center text-green-400 font-bold text-sm">
                  Quản lý giá{" "}
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </CardHeader>
            </Card>
          </div>

          {/* Concurrency Info Box */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-amber-500"></div>
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className="p-4 bg-amber-500/10 rounded-2xl">
                <ShieldAlert className="h-10 w-10 text-amber-500" />
              </div>
              <div className="space-y-2 flex-grow">
                <h3 className="text-xl font-bold text-slate-100 uppercase tracking-wider text-amber-500">
                  Hướng Dẫn Demo Concurrency
                </h3>
                <p className="text-slate-400 leading-relaxed">
                  Để mô phỏng hiện tượng{" "}
                  <strong>"Dirty Read" (Double Booking)</strong>, hãy mở ứng
                  dụng trong hai trình duyệt hoặc tab ẩn danh khác nhau. Đăng
                  nhập bằng hai tài khoản (ví dụ:{" "}
                  <code className="text-blue-400">khach1</code> và{" "}
                  <code className="text-blue-400">khach2</code>). Thử thực hiện{" "}
                  <strong>Hủy vé KHÔNG AN TOÀN</strong> ở tab này và đồng thời{" "}
                  <strong>Đặt vé KHÔNG AN TOÀN</strong> cho cùng một ghế đó ở
                  tab kia.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-8 bg-slate-950">
        <div className="container mx-auto px-4 text-center">
          <p className="text-slate-600 text-sm">
            © 2026 Railway Booking Concurrency Demo System. Built with React &
            Spring Boot.
          </p>
        </div>
      </footer>
    </div>
  );
};
