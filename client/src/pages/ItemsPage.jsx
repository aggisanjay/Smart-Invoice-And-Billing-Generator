import { useEffect, useState } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';

const EMPTY = { name:'', description:'', price:0, unit:'hrs', taxRate:0, category:'Service' };
const UNITS = ['hrs','pcs','kg','lbs','days','months','flat'];
const CATS  = ['Service','Product','Consulting','Design','Development','Marketing','Other'];

export default function ItemsPage() {
  const [items, setItems]   = useState([]);
  const [modal, setModal]   = useState(null);
  const [form, setForm]     = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const fetch = async () => {
    const { data } = await api.get('/items');
    setItems(data.items);
  };

  useEffect(() => { fetch(); }, []);

  const openCreate = () => { setForm(EMPTY); setModal('create'); };
  const openEdit   = (it) => { setForm({ ...it }); setModal(it); };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (modal === 'create') {
        await api.post('/items', form);
        toast.success('Item created!');
      } else {
        await api.put(`/items/${modal._id}`, form);
        toast.success('Item updated!');
      }
      await fetch();
      setModal(null);
    } catch (err) { toast.error(err); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete item?')) return;
    await api.delete(`/items/${id}`);
    toast.success('Item deleted');
    fetch();
  };

  const setF = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Items & Services</h1>
          <p className="page-subtitle">Reusable catalog for quick invoice line items</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>+ Add Item</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
        {items.length === 0 ? (
          <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
            <div className="empty-state-icon">📦</div>
            <div className="empty-state-title">No items yet</div>
            <div className="empty-state-text">Build a catalog to reuse on invoices</div>
            <button className="btn btn-primary" onClick={openCreate}>+ Add Item</button>
          </div>
        ) : items.map(it => (
          <div key={it._id} className="card" style={{ padding: 20 }}>
            <div className="flex-center gap-2" style={{ marginBottom: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--accent-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>📦</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600 }}>{it.name}</div>
                <div style={{ fontSize: 12, color: 'var(--txt-muted)' }}>{it.category}</div>
              </div>
            </div>
            {it.description && <p style={{ fontSize: 13, color: 'var(--txt-secondary)', marginBottom: 12 }}>{it.description}</p>}
            <div className="flex-center" style={{ marginBottom: 12 }}>
              <span style={{ fontSize: 20, fontWeight: 700, color: 'var(--accent)', fontFamily: 'DM Mono' }}>
                ${it.price.toFixed(2)}
              </span>
              <span style={{ fontSize: 12, color: 'var(--txt-muted)', marginLeft: 4 }}>/{it.unit}</span>
              {it.taxRate > 0 && <span style={{ fontSize: 12, color: 'var(--txt-muted)', marginLeft: 'auto' }}>Tax: {it.taxRate}%</span>}
            </div>
            <div className="flex-center gap-2">
              <button className="btn btn-outline btn-sm" style={{ flex: 1 }} onClick={() => openEdit(it)}>Edit</button>
              <button className="btn btn-danger btn-sm" onClick={() => handleDelete(it._id)}>✕</button>
            </div>
          </div>
        ))}
      </div>

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="card-title">{modal === 'create' ? 'New Item' : `Edit — ${modal.name}`}</div>
              <button onClick={() => setModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: 'var(--txt-muted)' }}>✕</button>
            </div>
            <form onSubmit={handleSave}>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Item Name *</label>
                    <input className="form-input" required value={form.name} onChange={e => setF('name', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <select className="form-select" value={form.category} onChange={e => setF('category', e.target.value)}>
                      {CATS.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <input className="form-input" value={form.description} onChange={e => setF('description', e.target.value)} />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Price *</label>
                    <input type="number" className="form-input" min="0" step="0.01" required value={form.price} onChange={e => setF('price', parseFloat(e.target.value) || 0)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Unit</label>
                    <select className="form-select" value={form.unit} onChange={e => setF('unit', e.target.value)}>
                      {UNITS.map(u => <option key={u}>{u}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Tax Rate (%)</label>
                    <input type="number" className="form-input" min="0" max="100" step="0.1" value={form.taxRate} onChange={e => setF('taxRate', parseFloat(e.target.value) || 0)} />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setModal(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Save Item'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}