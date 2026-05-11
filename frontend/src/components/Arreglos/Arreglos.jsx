import React, { useState, useEffect } from 'react';
import { Scissors, Plus, Search, Pencil, Trash2, DollarSign, X, CheckCircle } from 'lucide-react';
import { api } from '../../utils/api';

export default function Arreglos() {
  const [arreglos, setArreglos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    cliente: '',
    tipoArreglo: '',
    valor: '',
    descripcion: '',
  });

  const fetchArreglos = async () => {
    try {
      const data = await api.get('/arreglos');
      setArreglos(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArreglos();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      valor: parseFloat(form.valor),
    };

    try {
      if (editing) {
        await api.put(`/arreglos/${editing.id}`, payload);
      } else {
        await api.post('/arreglos', payload);
      }
      setModalOpen(false);
      setEditing(null);
      setForm({ cliente: '', tipoArreglo: '', valor: '', descripcion: '' });
      fetchArreglos();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar este arreglo?')) return;
    try {
      await api.delete(`/arreglos/${id}`);
      fetchArreglos();
    } catch (err) {
      alert(err.message);
    }
  };

  const handlePagado = async (id) => {
    try {
      await api.patch(`/arreglos/${id}/pagado`);
      fetchArreglos();
    } catch (err) {
      alert(err.message);
    }
  };

  const openEdit = (arr) => {
    setEditing(arr);
    setForm({
      cliente: arr.cliente,
      tipoArreglo: arr.tipoArreglo,
      valor: String(arr.valor),
      descripcion: arr.descripcion || '',
    });
    setModalOpen(true);
  };

  const openCreate = () => {
    setEditing(null);
    setForm({ cliente: '', tipoArreglo: '', valor: '', descripcion: '' });
    setModalOpen(true);
  };

  const filtered = arreglos.filter(a =>
    a.cliente?.toLowerCase().includes(search.toLowerCase()) ||
    a.tipoArreglo?.toLowerCase().includes(search.toLowerCase())
  );

  const formatMoney = (val) =>
    new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(Number(val));

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1>Arreglos</h1>
        <p>Control de arreglos de costura</p>
      </div>

      <div className="search-bar">
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={18} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
          <input
            type="text"
            placeholder="Buscar por cliente o tipo de arreglo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: 38 }}
          />
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          <Plus size={18} /> Nuevo arreglo
        </button>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Cliente</th>
              <th>Tipo</th>
              <th>Valor</th>
              <th>Fecha</th>
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
                    <Scissors size={48} />
                    <p>No hay arreglos registrados</p>
                  </div>
                </td>
              </tr>
            ) : (
              filtered.map((a) => (
                <tr key={a.id}>
                  <td style={{ fontWeight: 600 }}>{a.cliente}</td>
                  <td>{a.tipoArreglo}</td>
                  <td>{formatMoney(a.valor)}</td>
                  <td>{formatDate(a.fecha)}</td>
                  <td>
                    {a.estado === 'PENDIENTE' ? (
                      <span className="badge badge-warning">Pendiente</span>
                    ) : (
                      <span className="badge badge-success">Pagado</span>
                    )}
                  </td>
                  <td>
                    <div className="actions" style={{ justifyContent: 'flex-end' }}>
                      {a.estado === 'PENDIENTE' && (
                        <button className="btn-icon" title="Marcar pagado" onClick={() => handlePagado(a.id)} style={{ color: '#0D7377' }}>
                          <DollarSign size={16} />
                        </button>
                      )}
                      <button className="btn-icon" title="Editar" onClick={() => openEdit(a)}>
                        <Pencil size={16} />
                      </button>
                      <button className="btn-icon danger" title="Eliminar" onClick={() => handleDelete(a.id)}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2>{editing ? 'Editar arreglo' : 'Nuevo arreglo'}</h2>
              <button className="btn-icon" onClick={() => setModalOpen(false)} style={{ background: 'transparent' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group full">
                  <label>Cliente</label>
                  <input type="text" required value={form.cliente} onChange={(e) => setForm({ ...form, cliente: e.target.value })} placeholder="Nombre del cliente" />
                </div>

                <div className="form-group full">
                  <label>Tipo de arreglo</label>
                  <input type="text" required value={form.tipoArreglo} onChange={(e) => setForm({ ...form, tipoArreglo: e.target.value })} placeholder="Ej: Ajuste de pantalón, Cierre, etc." />
                </div>

                <div className="form-group">
                  <label>Valor ($)</label>
                  <input type="number" required min="0" step="100" value={form.valor} onChange={(e) => setForm({ ...form, valor: e.target.value })} />
                </div>

                <div className="form-group full">
                  <label>Descripción (opcional)</label>
                  <textarea rows="3" value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} placeholder="Detalles del arreglo..." />
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">
                  {editing ? 'Guardar cambios' : 'Crear arreglo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}