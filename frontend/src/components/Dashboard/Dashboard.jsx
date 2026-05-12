import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Scissors, 
  Users, 
  CreditCard, 
  AlertTriangle,
  DollarSign,
  ScissorsLineDashed,
  Clock,
  ChevronRight
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

        const disponibles = productos?.filter?.(p => p.estado === 'DISPONIBLE') || [];
        const bajoStock = disponibles.filter(p => p.cantidad <= p.stockMinimo);
        
        const pendientes = arreglos?.filter?.(a => a.estado === 'PENDIENTE') || [];
        const arreglosDelMes = (arreglos || []).filter(a => {
          const f = new Date(a.fecha);
          return f.getMonth() === mesActual && f.getFullYear() === anioActual;
        });
        
        const clientesDelMes = (clientes || []).filter(c => {
          const f = new Date(c.createdAt);
          return f.getMonth() === mesActual && f.getFullYear() === anioActual;
        });

        const deudasPendientes = deudas?.filter?.(d => d.estado === 'PENDIENTE') || [];
        const totalDeuda = deudasPendientes.reduce((sum, d) => sum + (Number(d.montoTotal) - Number(d.montoPagado)), 0);

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
      label: 'Productos', 
      value: stats.productos, 
      color: 'turquesa',
      sub: `${stats.productosBajoStock} con stock bajo`
    },
    { 
      icon: Scissors, 
      label: 'Arreglos pendientes', 
      value: stats.arreglosPendientes, 
      color: 'naranja',
      sub: `${stats.arreglosMes} este mes`
    },
    { 
      icon: Users, 
      label: 'Clientes', 
      value: stats.clientes, 
      color: 'morado',
      sub: `${stats.clientesNuevosMes} nuevos`
    },
    { 
      icon: CreditCard, 
      label: 'Deudas activas', 
      value: stats.deudasActivas, 
      color: 'amarillo',
      sub: formatMoney(stats.deudaTotal)
    },
    { 
      icon: DollarSign, 
      label: 'Ingresos del mes', 
      value: formatMoney(stats.ingresosMes), 
      color: 'verde',
      sub: 'Este mes'
    },
  ];

  return (
    <div className="dashboard-pro animate-fade-in">
      {/* HEADER */}
      <div className="dash-header-pro">
        <div className="dash-brand">
          <div className="dash-brand-icon">
            <ScissorsLineDashed size={32} />
          </div>
          <div>
            <h1>Creaciones JAKD</h1>
            <span>Panel de Control</span>
          </div>
        </div>
        <div className="dash-date">
          <Clock size={16} />
          <span>{new Date().toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
        </div>
      </div>

      {/* WELCOME */}
      <div className="dash-welcome">
        <h2>¡Hola, Administrador! 👋</h2>
        <p>Este es el resumen de tu negocio hoy</p>
      </div>

      {/* STATS GRID */}
      <div className="dash-stats-grid">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div key={i} className={`dash-stat-card dash-${card.color}`}>
              <div className="dash-stat-top">
                <div className="dash-stat-icon">
                  <Icon size={22} />
                </div>
                <span className="dash-stat-label">{card.label}</span>
              </div>
              <div className="dash-stat-value">
                {loading ? '...' : card.value}
              </div>
              <div className="dash-stat-sub">
                {card.sub}
              </div>
            </div>
          );
        })}
      </div>

      {/* BOTTOM SECTION */}
      <div className="dash-bottom-grid">
        {/* ALERTAS */}
        <div className="dash-card-pro">
          <div className="dash-card-header-pro">
            <div className="dash-card-title">
              <AlertTriangle size={18} />
              <h3>Alertas de inventario</h3>
            </div>
            {lowStock.length > 0 && (
              <span className="dash-badge-alert">{lowStock.length} alertas</span>
            )}
          </div>
          
          <div className="dash-card-body">
            {loading ? (
              <p className="dash-loading">Cargando...</p>
            ) : lowStock.length === 0 ? (
              <div className="dash-empty-pro">
                <Package size={36} />
                <p>Todo en orden. No hay productos con stock bajo.</p>
              </div>
            ) : (
              <div className="dash-list-pro">
                {lowStock.map((p) => (
                  <div key={p.id} className="dash-list-item-pro alert">
                    <div className="dash-item-left">
                      <div className="dash-item-dot alert-dot" />
                      <div className="dash-item-info">
                        <span className="dash-item-name">{p.nombre}</span>
                        <span className="dash-item-meta">{p.categoria} • {p.talla || 'Única'}</span>
                      </div>
                    </div>
                    <span className="dash-item-badge">{p.cantidad} unid.</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ARREGLOS RECIENTES */}
        <div className="dash-card-pro">
          <div className="dash-card-header-pro">
            <div className="dash-card-title">
              <Scissors size={18} />
              <h3>Últimos arreglos</h3>
            </div>
            <button className="dash-see-all">
              Ver todos <ChevronRight size={14} />
            </button>
          </div>
          
          <div className="dash-card-body">
            {loading ? (
              <p className="dash-loading">Cargando...</p>
            ) : recentRepairs.length === 0 ? (
              <div className="dash-empty-pro">
                <Scissors size={36} />
                <p>No hay arreglos registrados aún.</p>
              </div>
            ) : (
              <div className="dash-list-pro">
                {recentRepairs.map((a) => (
                  <div key={a.id} className="dash-list-item-pro">
                    <div className="dash-item-left">
                      <div className={`dash-item-dot ${a.estado === 'PENDIENTE' ? 'pending-dot' : 'paid-dot'}`} />
                      <div className="dash-item-info">
                        <span className="dash-item-name">{a.cliente}</span>
                        <span className="dash-item-meta">{a.tipoArreglo}</span>
                      </div>
                    </div>
                    <div className="dash-item-right">
                      <span className="dash-item-price">{formatMoney(a.valor)}</span>
                      <span className={`dash-item-status ${a.estado === 'PENDIENTE' ? 'status-pending' : 'status-paid'}`}>
                        {a.estado === 'PENDIENTE' ? 'Pendiente' : 'Pagado'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}