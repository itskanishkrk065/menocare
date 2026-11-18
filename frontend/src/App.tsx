import React, { useState, useEffect } from 'react';
import { api, getAuthToken, clearAuthToken } from './api/client';
import { Navbar } from './components/common/Navbar';
import { PatientDashboard } from './pages/PatientDashboard';
import { DoctorDashboard } from './pages/DoctorDashboard';
import { LoginPage } from './pages/LoginPage';

export function App() {
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = getAuthToken();
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      const user = await api.getMe();
      setCurrentUser(user);
    } catch (err) {
      console.warn('Authentication token expired or backend unavailable:', err);
      clearAuthToken();
      setCurrentUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-ivory flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-sage border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-charcoal-muted font-medium">Initializing secure clinical platform...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <LoginPage onLoginSuccess={(user) => setCurrentUser(user)} />;
  }

  return (
    <div className="min-h-screen bg-ivory text-charcoal flex flex-col font-sans">
      <Navbar user={currentUser} onLogout={() => setCurrentUser(null)} />
      <main className="flex-1 w-full bg-ivory">
        {currentUser.role === 'doctor' ? (
          <DoctorDashboard user={currentUser} />
        ) : (
          <PatientDashboard user={currentUser} />
        )}
      </main>
    </div>
  );
}

export default App;
