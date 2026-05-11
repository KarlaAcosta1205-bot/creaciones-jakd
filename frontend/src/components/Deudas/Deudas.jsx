import React, { useState, useEffect } from 'react';
import { CreditCard, Plus, Search, Trash2, DollarSign, MessageCircle, X, CheckCircle } from 'lucide-react';
import { api } from '../../utils/api';

export default function Deudas() {
  const [deudas, setDeudas] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [pagoModal, setPagoModal] = useState(null);
  const [form, setForm] = useState({
    clienteId: '',
    montoTotal: '',
    descripcion: '',
  });
  const [pagoForm, setPagoForm] = useState({ monto: '', metodo: 'EFECTIVO' });

  const fetchData = async () => {
    try {
      const [d, c] = await Promise.all([api.get('/deudas'), api.get('/clientes')]);
      setDeudas(d || []);
      setClientes(c || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/deudas', {
        ...form,
        montoTotal: parseFloat(form.montoTotal),
      });
      setModalOpen(false);
      setForm({ clienteId: '', montoTotal: '', descripcion: '' });
      fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handlePago = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/deudas/${pagoModal.id}/pago`, {
        monto: parseFloat(pagoForm.monto),
        metodo: pagoForm.metodo,
      });
      setPagoModal(null);
      setPagoForm({ monto: '', metodo: 'EFECTIVO' });
      fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar esta deuda?')) return;
    try {
      await api.delete(`/deudas/${id}`);
      fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  const copyWhatsApp = async (deuda) => {
    const cliente = clientes.find(c => c.id === deuda.clienteId);
    const nombre = cliente?.nombre || 'Cliente';
    const saldo = Number(deuda.montoTotal) - Number(deuda.montoPagado);
    
    const mensaje = `Hola ${nombre}, te escribo de *Creaciones JAKD* 👗✂️\n\nTienes un saldo pendiente de *${formatMoney(saldo)}*.\n\n¿Podrías realizar el pago? Quedo atenta. ¡Gracias! 🙏`;
    
    try {
      await navigator.clipboard.writeText(mensaje);
      alert('¡Mensaje copiado! Pégalo en WhatsApp.');
    } catch {
      alert('No se pudo copiar automáticamente. Mensaje:\n\n' + mensaje);
    }
  };

  const filtered = deudas.filter(d => {
    const cliente = clientes.find(c => c.id === d.clienteId);
    return cliente?.nombre?.toLowerCase().includes(search.toLowerCase());
  });

  const formatMoney = (val) =>
    new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(Number(val));

  const getSaldo = (d) => Number(d.montoTotal) - Number(d.montoPagado);

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1>Deudas</h1>
        <p>Seguimiento de pagos pendientes</p>
      </div>

      <div className="search-bar">
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={18} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
          <input
            type="text"
            placeholder="Buscar por cliente..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: 38 }}
          />
        </div>
        <button className="btn btn-primary" onClick={() => setModalOpen(true)}>
          <Plus size={18} /> Nueva deuda
        </button>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Cliente</th>
              <th>Total</th>
              <th>Pagado</th>
              <th>Saldo</th>
              <th>Estado</th>
              <th style={{ textAlign: 'right' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="6" style={{ textAlign: 'center', padding: 40 }}>Cargando...</td></tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan="6">
                  <div className="empty-state">
                    <CreditCard size={48} />
                    <p>No hay deudas registradas</p>
                  </div>
                </td>
              </tr>
            ) : (
              filtered.map((d) => {
                const cliente = clientes.find(c => c.id === d.clienteId);
                const saldo = getSaldo(d);
                return (
                  <tr key={d.id}>
                    <td style={{ fontWeight: 600 }}>{cliente?.nombre || 'Desconocido'}</td>
                    <td>{formatMoney(d.montoTotal)}</td>
                    <td>{formatMoney(d.montoPagado)}</td>
                    <td style={{ fontWeight: 700, color: saldo > 0 ? '#dc3545' : '#0D7377' }}>
                      {formatMoney(saldo)}
                    </td>
                    <td>
                      {d.estado === 'PENDIENTE' ? (
                        <span className="badge badge-warning">Pendiente</span>
                      ) : (
                        <span className="badge badge-success">Pagada</span>
                      )}
                    </td>
                    <td>
                      <div className="actions" style={{ justifyContent: 'flex-end' }}>
                        {saldo > 0 && (
                          <>
                            <button className="btn-icon" title="Registrar pago" onClick={() => setPagoModal(d)} style={{ color: '#0D7377' }}>
                              <DollarSign size={16} />
                            </button>
                            <button className="btn-icon" title="Copiar mensaje WhatsApp" onClick={() => copyWhatsApp(d)} style={{ color: '#25D366' }}>
                              <MessageCircle size={16} />
                            </button>
                          </>
                        )}
                        <button className="btn-icon danger" title="Eliminar" onClick={() => handleDelete(d.id)}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modal nueva deuda */}
      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2>Nueva deuda</h2>
              <button className="btn-icon" onClick={() => setModalOpen(false)} style={{ background: 'transparent' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group full">
                  <label>Cliente</label>
                  <select required value={form.clienteId} onChange={(e) => setForm({ ...form, clienteId: e.target.value })}>
                    <option value="">Seleccionar cliente</option>
                    {clientes.map(c => (
                      <option key={c.id} value={c.id}>{c.nombre}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Monto total ($)</label>
                  <input type="number" required min="0" step="100" value={form.montoTotal} onChange={(e) => setForm({ ...form, montoTotal: e.target.value })} />
                </div>

                <div className="form-group full">
                  <label>Descripción</label>
                  <input type="text" value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} placeholder="Ej: Vestido de fiesta, 2 pantalones" />
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">Crear deuda</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal registrar pago */}
      {pagoModal && (
        <div className="modal-overlay" onClick={() => setPagoModal(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2>Registrar pago</h2>
              <button className="btn-icon" onClick={() => setPagoModal(null)} style={{ background: 'transparent' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ marginBottom: 16, padding: 12, background: '#F5F5F5', borderRadius: 8 }}>
              <p style={{ fontSize: '0.9rem', color: '#666' }}>
                Saldo pendiente: <strong style={{ color: '#dc3545' }}>{formatMoney(getSaldo(pagoModal))}</strong>
              </p>
            </div>

            <form onSubmit={handlePago}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Monto a pagar ($)</label>
                  <input type="number" required min="1" max={getSaldo(pagoModal)} step="100" value={pagoForm.monto} onChange={(e) => setPagoForm({ ...pagoForm, monto: e.target.value })} />
                </div>

                <div className="form-group">
                  <label>Método</label>
                  <select value={pagoForm.metodo} onChange={(e) => setPagoForm({ ...pagoForm, metodo: e.target.value })}>
                    <option value="EFECTIVO">Efectivo</option>
                    <option value="TRANSFERENCIA">Transferencia</option>
                    <option value="NEQUI">Nequi</option>
                    <option value="DAVIPLATA">Daviplata</option>
                  </select>
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setPagoModal(null)}>Cancelar</button>
                <button type="submit" className="btn btn-success">
                  <CheckCircle size={16} /> Registrar pago
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}