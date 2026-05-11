import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/Layout/Sidebar';
import Login from './components/Login/Login';
import Dashboard from './components/Dashboard/Dashboard';
import Inventario from './components/Inventario/Inventario';
import Arreglos from './components/Arreglos/Arreglos';
import Clientes from './components/Clientes/Clientes';
import Deudas from './components/Deudas/Deudas';
import './App.css';

function PrivateRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: '#F5F5F5'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            width: 40, 
            height: 40, 
            border: '3px solid #E0E0E0', 
            borderTop: '3px solid #0D7377',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }} />
          <p style={{ color: '#666' }}>Cargando...</p>
        </div>
      </div>
    );
  }
  
  return isAuthenticated ? children : <Navigate to="/login" />;
}

function AppLayout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  
  return (
    <div className="app">
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      <main className="main-content">
        {children}
      </main>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={
          <PrivateRoute>
            <AppLayout><Dashboard /></AppLayout>
          </PrivateRoute>
        } />
        <Route path="/inventario" element={
          <PrivateRoute>
            <AppLayout><Inventario /></AppLayout>
          </PrivateRoute>
        } />
        <Route path="/arreglos" element={
          <PrivateRoute>
            <AppLayout><Arreglos /></AppLayout>
          </PrivateRoute>
        } />
        <Route path="/clientes" element={
          <PrivateRoute>
            <AppLayout><Clientes /></AppLayout>
          </PrivateRoute>
        } />
        <Route path="/deudas" element={
          <PrivateRoute>
            <AppLayout><Deudas /></AppLayout>
          </PrivateRoute>
        } />
      </Routes>
    </AuthProvider>
  );
}

export default App;