import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import MapPage from './pages/MapPage';
import ReportPage from './pages/ReportPage';
import ReportDetailPage from './pages/ReportDetailPage';
import DonatePage from './pages/DonatePage';
import DonationSuccessPage from './pages/DonationSuccessPage';
import LeaderboardPage from './pages/LeaderboardPage';
import { LoginPage, RegisterPage } from './pages/LoginPage';
import ProfilePage from './pages/ProfilePage';
import AdminDashboard from './pages/AdminDashboard';
import AboutPage from './pages/AboutPage';


function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center h-screen"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-green-500"/></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/" replace />;
  return children;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-gray-950 text-white">
          <Navbar />
          <Routes>
            <Route path="/"                element={<HomePage />} />
            <Route path="/map"             element={<MapPage />} />
            <Route path="/reports/:id"     element={<ReportDetailPage />} />
            <Route path="/donate"          element={<DonatePage />} />
            <Route path="/donation/success" element={<DonationSuccessPage />} />
            <Route path="/leaderboard"     element={<LeaderboardPage />} />
            <Route path="/login"           element={<LoginPage />} />
            <Route path="/register"        element={<RegisterPage />} />
            <Route path="/report"          element={<ProtectedRoute><ReportPage /></ProtectedRoute>} />
            <Route path="/profile"         element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            <Route path="/admin"           element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
            <Route path="/about" element={<AboutPage />} />
          </Routes>
          <Toaster position="top-right" toastOptions={{ style: { background: '#1f2937', color: '#fff' } }} />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
