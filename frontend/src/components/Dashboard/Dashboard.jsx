import React, { useState, useEffect } from 'react';
import { Package, Scissors, Users, CreditCard, TrendingUp } from 'lucide-react';
import { api } from '../../utils/api';
import './Dashboard.css';

export default function Dashboard() {
  const [stats, setStats] = useState({
    productos: 0,
    arreglosPendientes: 0,
    clientes: 0,
    deudasActivas: 0,
    ingresosMes: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [productos, arreglos, clientes, deudas] = await Promise.all([
          api.get('/productos'),
          api.get('/arreglos'),
          api.get('/clientes'),
          api.get('/deudas'),
        ]);

        const disponibles = productos?.filter?.(p => p.estado === 'DISPONIBLE')?.length || 0;
        const pendientes = arreglos?.filter?.(a => a.estado === 'PENDIENTE')?.length || 0;
        const deudasPendientes = deudas?.filter?.(d => d.estado === 'PENDIENTE')?.length || 0;

        // Ingresos de arreglos completados (no pendientes)
        const ingresos = arreglos
          ?.filter?.(a => a.estado !== 'PENDIENTE')
          ?.reduce?.((sum, a) => sum + (Number(a.valor) || 0), 0) || 0;

        setStats({
          productos: disponibles,
          arreglosPendientes: pendientes,
          clientes: clientes?.length || 0,
          deudasActivas: deudasPendientes,
          ingresosMes: ingresos,
        });
      } catch (err) {
        console.error('Error cargando stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const formatMoney = (val) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(val);
  };

  const cards = [
    { icon: Package, label: 'Productos disponibles', value: stats.productos, color: 'products' },
    { icon: Scissors, label: 'Arreglos pendientes', value: stats.arreglosPendientes, color: 'repairs' },
    { icon: Users, label: 'Clientes registrados', value: stats.clientes, color: 'clients' },
    { icon: CreditCard, label: 'Deudas activas', value: stats.deudasActivas, color: 'debts' },
    { icon: TrendingUp, label: 'Ingresos del mes', value: formatMoney(stats.ingresosMes), color: 'products', isMoney: true },
  ];

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1>Dashboard</h1>
        <p>Resumen de tu negocio en tiempo real</p>
      </div>

      <div className="stats-grid">
        {cards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div key={i} className="stat-card">
              <div className={`stat-icon ${card.color}`}>
                <Icon size={22} />
              </div>
              <div className="stat-info">
                <span className="stat-value">
                  {loading ? '...' : card.value}
                </span>
                <span className="stat-label">{card.label}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
