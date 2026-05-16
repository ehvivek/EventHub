import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { DashboardNavbar } from './Navbar';
import Sidebar from './Sidebar';
import FloatingParticles from './FloatingParticles';
import { useAuth } from '../context/AuthContext';
import { useReminderCheck } from '../hooks/useReminderCheck';
import { requestNotificationPermission } from '../lib/pushNotifications';

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();

  // Silently check and send event reminder notifications
  useReminderCheck(user?.id);

  // Ask for browser push notification permission once on first login
  useEffect(() => {
    if (user) {
      requestNotificationPermission();
    }
  }, [user?.id]);

  return (
    <div className="min-h-screen relative">
      <FloatingParticles />

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="lg:ml-60 min-h-screen flex flex-col relative z-10">
        <DashboardNavbar onMenuToggle={() => setSidebarOpen(true)} />
        <main className="flex-1 p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
