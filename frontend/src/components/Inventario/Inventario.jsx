import React, { useState, useEffect } from 'react';
import { Package, Plus, Search, Pencil, Trash2, CheckCircle, X } from 'lucide-react';
import { api } from '../../utils/api';

export default function Inventario() {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    nombre: '',
    categoria: '',
    talla: '',
    precio: '',
    cantidad: '',
    stockMinimo: '5',
  });

  const fetchProductos = async () => {
    try {
      const data = await api.get('/productos');
      setProductos(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductos();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      precio: parseFloat(form.precio),
      cantidad: parseInt(form.cantidad),
      stockMinimo: parseInt(form.stockMinimo),
    };

    try {
      if (editing) {
        await api.put(`/productos/${editing.id}`, payload);
      } else {
        await api.post('/productos', payload);
      }
      setModalOpen(false);
      setEditing(null);
      setForm({ nombre: '', categoria: '', talla: '', precio: '', cantidad: '', stockMinimo: '5' });
      fetchProductos();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar este producto?')) return;
    try {
      await api.delete(`/productos/${id}`);
      fetchProductos();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleVendido = async (id) => {
    try {
      await api.patch(`/productos/${id}/vendido`);
      fetchProductos();
    } catch (err) {
      alert(err.message);
    }
  };

  const openEdit = (prod) => {
    setEditing(prod);
    setForm({
      nombre: prod.nombre,
      categoria: prod.categoria,
      talla: prod.talla || '',
      precio: String(prod.precio),
      cantidad: String(prod.cantidad),
      stockMinimo: String(prod.stockMinimo),
    });
    setModalOpen(true);
  };

  const openCreate = () => {
    setEditing(null);
    setForm({ nombre: '', categoria: '', talla: '', precio: '', cantidad: '', stockMinimo: '5' });
    setModalOpen(true);
  };

  const filtered = productos.filter(p =>
    p.nombre?.toLowerCase().includes(search.toLowerCase()) ||
    p.categoria?.toLowerCase().includes(search.toLowerCase())
  );

  const formatMoney = (val) =>
    new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(Number(val));

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1>Inventario</h1>
        <p>Gestiona tus productos de costura</p>
      </div>

      <div className="search-bar">
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={18} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
          <input
            type="text"
            placeholder="Buscar por nombre o categoría..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: 38 }}
          />
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          <Plus size={18} /> Nuevo producto
        </button>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Producto</th>
              <th>Categoría</th>
              <th>Talla</th>
              <th>Precio</th>
              <th>Cant</th>
              <th>Estado</th>
              <th style={{ textAlign: 'right' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="7" style={{ textAlign: 'center', padding: 40 }}>Cargando...</td></tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan="7">
                  <div className="empty-state">
                    <Package size={48} />
                    <p>No hay productos registrados</p>
                  </div>
                </td>
              </tr>
            ) : (
              filtered.map((p) => (
                <tr key={p.id}>
                  <td style={{ fontWeight: 600 }}>{p.nombre}</td>
                  <td>{p.categoria}</td>
                  <td>{p.talla || '-'}</td>
                  <td>{formatMoney(p.precio)}</td>
                  <td>{p.cantidad}</td>
                  <td>
                    {p.estado === 'DISPONIBLE' ? (
                      <span className="badge badge-success">Disponible</span>
                    ) : (
                      <span className="badge badge-secondary">Vendido</span>
                    )}
                  </td>
                  <td>
                    <div className="actions" style={{ justifyContent: 'flex-end' }}>
                      {p.estado === 'DISPONIBLE' && (
                        <button className="btn-icon" title="Marcar vendido" onClick={() => handleVendido(p.id)}>
                          <CheckCircle size={16} />
                        </button>
                      )}
                      <button className="btn-icon" title="Editar" onClick={() => openEdit(p)}>
                        <Pencil size={16} />
                      </button>
                      <button className="btn-icon danger" title="Eliminar" onClick={() => handleDelete(p.id)}>
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
              <h2>{editing ? 'Editar producto' : 'Nuevo producto'}</h2>
              <button className="btn-icon" onClick={() => setModalOpen(false)} style={{ background: 'transparent' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group full">
                  <label>Nombre</label>
                  <input type="text" required value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
                </div>

                <div className="form-group">
                  <label>Categoría</label>
                  <input type="text" required value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value })} placeholder="Ej: Vestidos, Pantalones" />
                </div>

                <div className="form-group">
                  <label>Talla</label>
                  <input type="text" value={form.talla} onChange={(e) => setForm({ ...form, talla: e.target.value })} placeholder="Ej: S, M, L, Única" />
                </div>

                <div className="form-group">
                  <label>Precio ($)</label>
                  <input type="number" required min="0" step="100" value={form.precio} onChange={(e) => setForm({ ...form, precio: e.target.value })} />
                </div>

                <div className="form-group">
                  <label>Cantidad</label>
                  <input type="number" required min="0" value={form.cantidad} onChange={(e) => setForm({ ...form, cantidad: e.target.value })} />
                </div>

                <div className="form-group">
                  <label>Stock mínimo</label>
                  <input type="number" required min="0" value={form.stockMinimo} onChange={(e) => setForm({ ...form, stockMinimo: e.target.value })} />
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">
                  {editing ? 'Guardar cambios' : 'Crear producto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}