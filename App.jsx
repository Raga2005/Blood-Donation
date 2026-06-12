import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Welcome from './pages/Welcome';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import RequestFeed from './pages/RequestFeed';
import RequestDetails from './pages/RequestDetails';
import HospitalDashboard from './pages/HospitalDashboard';
import { api, logout } from './services/api';
import AiAssistant from './components/AiAssistant';

export default function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState('welcome'); // 'welcome', 'login', 'register', 'dashboard', 'feed', 'details'
  const [selectedRequestId, setSelectedRequestId] = useState(null);
  const [appLoading, setAppLoading] = useState(true);

  useEffect(() => {
    // Check if user token exists and fetch user profile to authenticate
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');

    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
      setView('dashboard');
      
      // Verify token with backend
      api.auth.me()
        .then(freshUser => {
          setUser(freshUser);
        })
        .catch(() => {
          // Token invalid/expired
          logout();
          setUser(null);
          setView('welcome');
        })
        .finally(() => {
          setAppLoading(false);
        });
    } else {
      setAppLoading(false);
    }

    // Listen for auth failures from API
    const handleAuthChange = () => {
      setUser(null);
      setView('welcome');
    };
    
    window.addEventListener('auth-change', handleAuthChange);
    return () => {
      window.removeEventListener('auth-change', handleAuthChange);
    };
  }, []);

  const handleAuthSuccess = (loggedUser) => {
    setUser(loggedUser);
    setView('dashboard');
  };

  const handleUpdateUser = (updatedUser) => {
    setUser(updatedUser);
  };

  const handleViewChange = (v, requestId = null) => {
    if (requestId) {
      setSelectedRequestId(requestId);
    }
    setView(v);
  };

  if (appLoading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        backgroundColor: '#0a0a0f',
        color: '#f5f5fa',
        fontFamily: 'Outfit, sans-serif'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid rgba(255,255,255,0.05)',
          borderTopColor: '#ff3355',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          marginBottom: '16px'
        }}></div>
        <p>Connecting to LifeFlow Network...</p>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <>
      <Navbar 
        user={user} 
        onViewChange={(v) => handleViewChange(v)} 
        currentView={view} 
      />

      <main style={{ flex: 1, paddingBottom: '40px' }}>
        {view === 'welcome' && !user && (
          <Welcome onViewChange={handleViewChange} />
        )}
        {view === 'login' && !user && (
          <Login onAuthSuccess={handleAuthSuccess} onViewChange={handleViewChange} />
        )}
        {view === 'register' && !user && (
          <Register onAuthSuccess={handleAuthSuccess} onViewChange={handleViewChange} />
        )}
        {user && view === 'dashboard' && (
          user.role === 'HOSPITAL' ? (
            <HospitalDashboard 
              user={user} 
              onUpdateUser={handleUpdateUser} 
              onViewChange={handleViewChange}
            />
          ) : (
            <Dashboard 
              user={user} 
              onUpdateUser={handleUpdateUser} 
              onViewChange={handleViewChange}
            />
          )
        )}
        {user && view === 'feed' && (
          <RequestFeed 
            currentUser={user} 
            onUpdateUser={handleUpdateUser}
            onSelectRequest={(id) => handleViewChange('details', id)}
          />
        )}
        {user && view === 'details' && selectedRequestId && (
          <RequestDetails 
            requestId={selectedRequestId}
            currentUser={user}
            onBack={() => handleViewChange('dashboard')}
            onUpdateUser={handleUpdateUser}
          />
        )}
      </main>

      <footer style={{
        padding: '24px',
        textAlign: 'center',
        fontSize: '0.8rem',
        color: '#6c7093',
        borderTop: '1px solid rgba(255,255,255,0.04)',
        background: 'rgba(10, 10, 15, 0.5)'
      }}>
        <div>&copy; {new Date().getFullYear()} LifeFlow. All rights reserved. Every drop counts.</div>
        <div style={{ marginTop: '4px', opacity: 0.6 }}>Designed with high-fidelity React + Spring Boot + MongoDB.</div>
      </footer>
      <AiAssistant />
    </>
  );
}
