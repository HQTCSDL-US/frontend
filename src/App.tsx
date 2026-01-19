import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./routes/ProtectedRoute";
import { LoginPage } from "./pages/LoginPage";
import { HomePage } from "./pages/HomePage";
import TripListPage from "./pages/TripListPage";
import BookTripPage from "./pages/BookTripPage";
import MyTicketsPage from "./pages/MyTicketsPage";
import PhantomDemoPage from "./pages/PhantomDemoPage";
import PricingRuleManagementPage from "./pages/PricingRuleManagementPage";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="dark bg-slate-950 min-h-screen">
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <HomePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/trips"
              element={
                <ProtectedRoute>
                  <TripListPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/book-trip/:tripId"
              element={
                <ProtectedRoute>
                  <BookTripPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-tickets"
              element={
                <ProtectedRoute>
                  <MyTicketsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/phantom-demo"
              element={
                <ProtectedRoute>
                  <PhantomDemoPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/pricing-rules"
              element={
                <ProtectedRoute>
                  <PricingRuleManagementPage />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
