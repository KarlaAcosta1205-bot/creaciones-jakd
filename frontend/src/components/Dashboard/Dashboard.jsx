import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Scissors, 
  Users, 
  CreditCard, 
  AlertTriangle,
  DollarSign,
  ScissorsLineDashed
} from 'lucide-react';
import { api } from '../../utils/api';
import './Dashboard.css';

export default function Dashboard() {
  const [stats, setStats] = useState({
    productos: 0,
    productosBajoStock: 0,
    arreglosPendientes: 0,
    arreglosMes: 0,
    clientes: 0,
    clientesNuevosMes: 0,
    deudasActivas: 0,
    deudaTotal: 0,
    ingresosMes: 0,
  });
  const [loading, setLoading] = useState(true);
  const [lowStock, setLowStock] = useState([]);
  const [recentRepairs, setRecentRepairs] = useState([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [productos, arreglos, clientes, deudas] = await Promise.all([
          api.get('/productos'),
          api.get('/arreglos'),
          api.get('/clientes'),
          api.get('/deudas'),
        ]);

        const hoy = new Date();
        const mesActual = hoy.getMonth();
        const anioActual = hoy.getFullYear();

        // Productos
        const disponibles = productos?.filter?.(p => p.estado === 'DISPONIBLE') || [];
        const bajoStock = disponibles.filter(p => p.cantidad <= p.stockMinimo);
        
        // Arreglos
        const pendientes = arreglos?.filter?.(a => a.estado === 'PENDIENTE') || [];
        const arreglosDelMes = (arreglos || []).filter(a => {
          const f = new Date(a.fecha);
          return f.getMonth() === mesActual && f.getFullYear() === anioActual;
        });
        
        // Clientes
        const clientesDelMes = (clientes || []).filter(c => {
          const f = new Date(c.createdAt);
          return f.getMonth() === mesActual && f.getFullYear() === anioActual;
        });

        // Deudas
        const deudasPendientes = deudas?.filter?.(d => d.estado === 'PENDIENTE') || [];
        const totalDeuda = deudasPendientes.reduce((sum, d) => sum + (Number(d.montoTotal) - Number(d.montoPagado)), 0);

        // Ingresos del mes (arreglos pagados/completados de este mes)
        const ingresos = arreglosDelMes
          .filter(a => a.estado !== 'PENDIENTE')
          .reduce((sum, a) => sum + (Number(a.valor) || 0), 0);

        setStats({
          productos: disponibles.length,
          productosBajoStock: bajoStock.length,
          arreglosPendientes: pendientes.length,
          arreglosMes: arreglosDelMes.length,
          clientes: clientes?.length || 0,
          clientesNuevosMes: clientesDelMes.length,
          deudasActivas: deudasPendientes.length,
          deudaTotal: totalDeuda,
          ingresosMes: ingresos,
        });

        setLowStock(bajoStock.slice(0, 5));
        setRecentRepairs((arreglos || []).slice(0, 5));
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

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('es-CO', { 
      day: 'numeric', 
      month: 'short'
    });
  };

  const statCards = [
    { 
      icon: Package, 
      label: 'Productos disponibles', 
      value: stats.productos, 
      color: 'turquesa',
      trend: null
    },
    { 
      icon: Scissors, 
      label: 'Arreglos pendientes', 
      value: stats.arreglosPendientes, 
      color: 'naranja',
      trend: stats.arreglosMes > 0 ? `+${stats.arreglosMes} este mes` : null
    },
    { 
      icon: Users, 
      label: 'Clientes registrados', 
      value: stats.clientes, 
      color: 'morado',
      trend: stats.clientesNuevosMes > 0 ? `+${stats.clientesNuevosMes} nuevos` : null
    },
    { 
      icon: CreditCard, 
      label: 'Deudas activas', 
      value: stats.deudasActivas, 
      color: 'amarillo',
      trend: stats.deudaTotal > 0 ? formatMoney(stats.deudaTotal) + ' total' : null
    },
    { 
      icon: DollarSign, 
      label: 'Ingresos del mes', 
      value: formatMoney(stats.ingresosMes), 
      color: 'verde',
      trend: null
    },
    { 
      icon: AlertTriangle, 
      label: 'Stock bajo', 
      value: stats.productosBajoStock, 
      color: 'rojo',
      trend: stats.productosBajoStock > 0 ? 'Requiere atención' : 'Todo bien'
    },
  ];

  return (
    <div className="dashboard-page animate-fade-in">
      {/* HEADER CON BRANDING */}
      <div className="dashboard-header">
        <div className="brand-showcase">
          <div className="brand-logo-large">
            <ScissorsLineDashed size={40} />
          </div>
          <div className="brand-text-large">
            <h1>Creaciones JAKD</h1>
            <p>Sistema Administrativo</p>
          </div>
        </div>
        <div className="welcome-text">
          <h2>¡Hola, Administrador!</h2>
          <p>Este es el resumen de tu negocio hoy, {new Date().toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
        </div>
      </div>

      {/* STATS GRID */}
      <div className="stats-grid">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div key={i} className={`stat-card stat-${card.color}`}>
              <div className="stat-card-header">
                <div className={`stat-icon-bg ${card.color}`}>
                  <Icon size={22} />
                </div>
                {card.trend && (
                  <span className={`stat-trend ${card.color === 'rojo' ? 'trend-down' : 'trend-up'}`}>
                    {card.trend}
                  </span>
                )}
              </div>
              <div className="stat-info">
                <span className="stat-value">{loading ? '...' : card.value}</span>
                <span className="stat-label">{card.label}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* SECCIÓN INFERIOR: 2 COLUMNAS */}
      <div className="dashboard-bottom">
        {/* Alertas de stock */}
        <div className="dash-card">
          <div className="dash-card-header">
            <AlertTriangle size={18} />
            <h3>Alertas de inventario</h3>
          </div>
          {loading ? (
            <p className="dash-loading">Cargando...</p>
          ) : lowStock.length === 0 ? (
            <div className="dash-empty">
              <Package size={32} />
              <p>Todo en orden. No hay productos con stock bajo.</p>
            </div>
          ) : (
            <div className="dash-list">
              {lowStock.map((p) => (
                <div key={p.id} className="dash-list-item alert-item">
                  <div className="dash-item-info">
                    <span className="dash-item-name">{p.nombre}</span>
                    <span className="dash-item-meta">{p.categoria} • Talla {p.talla || 'N/A'}</span>
                  </div>
                  <div className="dash-item-badge">
                    <span className="stock-alert">{p.cantidad} unidades</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Últimos arreglos */}
        <div className="dash-card">
          <div className="dash-card-header">
            <Scissors size={18} />
            <h3>Últimos arreglos</h3>
          </div>
          {loading ? (
            <p className="dash-loading">Cargando...</p>
          ) : recentRepairs.length === 0 ? (
            <div className="dash-empty">
              <Scissors size={32} />
              <p>No hay arreglos registrados aún.</p>
            </div>
          ) : (
            <div className="dash-list">
              {recentRepairs.map((a) => (
                <div key={a.id} className="dash-list-item">
                  <div className="dash-item-info">
                    <span className="dash-item-name">{a.cliente}</span>
                    <span className="dash-item-meta">{a.tipoArreglo} • {formatDate(a.fecha)}</span>
                  </div>
                  <div className="dash-item-badge">
                    <span className={`status-badge ${a.estado === 'PENDIENTE' ? 'pending' : 'paid'}`}>
                      {a.estado === 'PENDIENTE' ? 'Pendiente' : 'Pagado'}
                    </span>
                    <span className="dash-price">{formatMoney(a.valor)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}