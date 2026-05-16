import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Homepage from './pages/Homepage';
import Dashboard from './pages/Dashboard';
import CreateEvent from './pages/CreateEvent';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import CustomVault from './pages/CustomVault';
import Chrono from './pages/Chrono';
import Query from './pages/Query';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import Discover from './pages/Discover';
import TermsOfService from './pages/TermsOfService';
import ExploreEvents from './pages/ExploreEvents';
import EventDetail from './pages/EventDetail';
import MyTickets from './pages/MyTickets';
import SavedEventsPage from './pages/SavedEventsPage';
import NotificationsPage from './pages/NotificationsPage';
import DashboardLayout from './components/DashboardLayout';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <AnimatePresence mode="wait">
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Homepage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/discover" element={<Discover />} />
              <Route path="/terms" element={<TermsOfService />} />

              {/* Protected dashboard routes */}
              <Route element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/explore" element={<ExploreEvents />} />
                <Route path="/chrono" element={<Chrono />} />
                <Route path="/vault" element={<CustomVault />} />
                <Route path="/event/:id" element={<EventDetail />} />
                <Route path="/create-event" element={<CreateEvent />} />
                <Route path="/my-tickets" element={<MyTickets />} />
                <Route path="/saved" element={<SavedEventsPage />} />
                <Route path="/notifications" element={<NotificationsPage />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/query" element={<Query />} />
              </Route>
            </Routes>
          </AnimatePresence>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
