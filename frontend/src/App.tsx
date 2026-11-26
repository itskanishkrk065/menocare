import React, { useState, useEffect } from 'react';
import { api, getAuthToken, clearAuthToken, setAuthToken } from './api/client';
import { Navbar } from './components/common/Navbar';
import { PatientDashboard } from './pages/PatientDashboard';
import { DoctorDashboard } from './pages/DoctorDashboard';
import { LoginPage } from './pages/LoginPage';
import { LandingPage } from './pages/LandingPage';

export function App() {
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [view, setView] = useState<'landing' | 'login' | 'register'>('landing');
  const [initialRole, setInitialRole] = useState<'patient' | 'doctor'>('patient');

  useEffect(() => {
    if (window.location.hash === '#login') {
      setView('login');
    } else if (window.location.hash === '#register') {
      setView('register');
    }
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

  const handleQuickDemoLogin = async (email: string, role: 'patient' | 'doctor') => {
    setIsLoading(true);
    try {
      const res = await api.login({ email, password: 'Password123#' });
      setAuthToken(res.access_token);
      localStorage.setItem('menocare_user', JSON.stringify(res));
      setCurrentUser(res);
      window.location.hash = '';
    } catch (err: any) {
      console.error('Quick demo authentication error:', err);
      setInitialRole(role);
      setView('login');
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
    if (view === 'landing') {
      return (
        <LandingPage
          onGetStarted={() => {
            setInitialRole('patient');
            setView('register');
            window.location.hash = '#register';
          }}
          onSignIn={(role) => {
            setInitialRole(role || 'patient');
            setView('login');
            window.location.hash = '#login';
          }}
          onQuickDemoLogin={handleQuickDemoLogin}
        />
      );
    }

    return (
      <LoginPage
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          window.location.hash = '';
        }}
        onBackToHome={() => {
          setView('landing');
          window.location.hash = '';
        }}
        initialMode={view}
        initialRole={initialRole}
      />
    );
  }

  return (
    <div className="min-h-screen bg-ivory text-charcoal flex flex-col font-sans">
      <Navbar
        user={currentUser}
        onLogout={() => {
          setCurrentUser(null);
          setView('landing');
          window.location.hash = '';
        }}
      />
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
