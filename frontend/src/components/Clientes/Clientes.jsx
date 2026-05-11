import React, { useState, useEffect } from 'react';
import { Users, Plus, Search, Pencil, Trash2, Phone, Mail, MapPin, X } from 'lucide-react';
import { api } from '../../utils/api';

export default function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    nombre: '',
    telefono: '',
    email: '',
    direccion: '',
  });

  const fetchClientes = async () => {
    try {
      const data = await api.get('/clientes');
      setClientes(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClientes();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editing) {
        await api.put(`/clientes/${editing.id}`, form);
      } else {
        await api.post('/clientes', form);
      }
      setModalOpen(false);
      setEditing(null);
      setForm({ nombre: '', telefono: '', email: '', direccion: '' });
      fetchClientes();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar este cliente?')) return;
    try {
      await api.delete(`/clientes/${id}`);
      fetchClientes();
    } catch (err) {
      alert(err.message);
    }
  };

  const openEdit = (c) => {
    setEditing(c);
    setForm({
      nombre: c.nombre,
      telefono: c.telefono || '',
      email: c.email || '',
      direccion: c.direccion || '',
    });
    setModalOpen(true);
  };

  const openCreate = () => {
    setEditing(null);
    setForm({ nombre: '', telefono: '', email: '', direccion: '' });
    setModalOpen(true);
  };

  const filtered = clientes.filter(c =>
    c.nombre?.toLowerCase().includes(search.toLowerCase()) ||
    c.telefono?.includes(search)
  );

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1>Clientes</h1>
        <p>Base de datos de clientes</p>
      </div>

      <div className="search-bar">
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={18} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
          <input
            type="text"
            placeholder="Buscar por nombre o teléfono..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: 38 }}
          />
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          <Plus size={18} /> Nuevo cliente
        </button>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Cliente</th>
              <th>Teléfono</th>
              <th>Email</th>
              <th>Dirección</th>
              <th style={{ textAlign: 'right' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="5" style={{ textAlign: 'center', padding: 40 }}>Cargando...</td></tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan="5">
                  <div className="empty-state">
                    <Users size={48} />
                    <p>No hay clientes registrados</p>
                  </div>
                </td>
              </tr>
            ) : (
              filtered.map((c) => (
                <tr key={c.id}>
                  <td style={{ fontWeight: 600 }}>{c.nombre}</td>
                  <td>
                    {c.telefono ? (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Phone size={14} color="#0D7377" />
                        {c.telefono}
                      </span>
                    ) : '-'}
                  </td>
                  <td>
                    {c.email ? (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Mail size={14} color="#0D7377" />
                        {c.email}
                      </span>
                    ) : '-'}
                  </td>
                  <td>
                    {c.direccion ? (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <MapPin size={14} color="#0D7377" />
                        {c.direccion}
                      </span>
                    ) : '-'}
                  </td>
                  <td>
                    <div className="actions" style={{ justifyContent: 'flex-end' }}>
                      <button className="btn-icon" title="Editar" onClick={() => openEdit(c)}>
                        <Pencil size={16} />
                      </button>
                      <button className="btn-icon danger" title="Eliminar" onClick={() => handleDelete(c.id)}>
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
              <h2>{editing ? 'Editar cliente' : 'Nuevo cliente'}</h2>
              <button className="btn-icon" onClick={() => setModalOpen(false)} style={{ background: 'transparent' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group full">
                  <label>Nombre completo</label>
                  <input type="text" required value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} placeholder="Nombre del cliente" />
                </div>

                <div className="form-group">
                  <label>Teléfono</label>
                  <input type="tel" value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} placeholder="Ej: 3001234567" />
                </div>

                <div className="form-group">
                  <label>Email</label>
                  <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="correo@ejemplo.com" />
                </div>

                <div className="form-group full">
                  <label>Dirección</label>
                  <input type="text" value={form.direccion} onChange={(e) => setForm({ ...form, direccion: e.target.value })} placeholder="Dirección del cliente" />
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">
                  {editing ? 'Guardar cambios' : 'Crear cliente'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}