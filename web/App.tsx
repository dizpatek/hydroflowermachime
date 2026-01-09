import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';
import Control from './pages/Control';
import GrowthPhasePage from './pages/GrowthPhase';
import Reports from './pages/Reports';
import Backup from './pages/Backup';

// Protected Route Component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('token');

  console.log('ProtectedRoute check:', { hasToken: !!token, token: token?.substring(0, 20) });

  if (!token) {
    console.log('No token found, redirecting to login');
    return <Navigate to="/" replace />;
  }

  console.log('Token found, rendering protected content');
  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/control"
          element={
            <ProtectedRoute>
              <Control />
            </ProtectedRoute>
          }
        />
        <Route
          path="/growth-phase"
          element={
            <ProtectedRoute>
              <GrowthPhasePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports"
          element={
            <ProtectedRoute>
              <Reports />
            </ProtectedRoute>
          }
        />
        <Route
          path="/backup"
          element={
            <ProtectedRoute>
              <Backup />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}