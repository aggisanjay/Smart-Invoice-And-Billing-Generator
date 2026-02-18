import { useEffect, useState } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';

const EMPTY = { name:'', email:'', phone:'', company:'', address:'', city:'', state:'', country:'', notes:'' };

export default function ClientsPage() {
  const [clients, setClients] = useState([]);
  const [total, setTotal]     = useState(0);
  const [search, setSearch]   = useState('');
  const [modal, setModal]     = useState(null); // null | 'create' | client object
  const [form, setForm]       = useState(EMPTY);
  const [saving, setSaving]   = useState(false);

  const fetch = async () => {
    const { data } = await api.get('/clients', { params: { search, limit: 50 } });
    setClients(data.clients);
    setTotal(data.total);
  };

  useEffect(() => { fetch(); }, []);
  useEffect(() => {
    const t = setTimeout(fetch, 350);
    return () => clearTimeout(t);
  }, [search]);

  const openCreate = () => { setForm(EMPTY); setModal('create'); };
  const openEdit   = (c)  => { setForm({ ...c }); setModal(c); };
  const closeModal = ()   => setModal(null);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (modal === 'create') {
        await api.post('/clients', form);
        toast.success('Client created!');
      } else {
        await api.put(`/clients/${modal._id}`, form);
        toast.success('Client updated!');
      }
      await fetch();
      closeModal();
    } catch (err) { toast.error(err); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this client?')) return;
    await api.delete(`/clients/${id}`);
    toast.success('Client deleted');
    fetch();
  };

  const setF = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Clients</h1>
          <p className="page-subtitle">{total} client{total !== 1 ? 's' : ''}</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>+ Add Client</button>
      </div>

      {/* Search */}
      <div className="search-bar" style={{ marginBottom: 20, maxWidth: 360 }}>
        <span className="search-icon">🔍</span>
        <input className="form-input" placeholder="Search clients…" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="card">
        <div className="table-container">
          <table>
            <thead>
              <tr><th>Name</th><th>Company</th><th>Email</th><th>Phone</th><th>Location</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {clients.length === 0 ? (
                <tr><td colSpan={6}>
                  <div className="empty-state">
                    <div className="empty-state-icon">👥</div>
                    <div className="empty-state-title">No clients yet</div>
                    <div className="empty-state-text">Add your first client to start billing</div>
                    <button className="btn btn-primary" onClick={openCreate}>+ Add Client</button>
                  </div>
                </td></tr>
              ) : clients.map(c => (
                <tr key={c._id}>
                  <td>
                    <div className="flex-center gap-2">
                      <div className="avatar" style={{ width: 32, height: 32, fontSize: 12 }}>
                        {c.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="td-primary">{c.name}</div>
                    </div>
                  </td>
                  <td>{c.company || '—'}</td>
                  <td><a href={`mailto:${c.email}`} style={{ color: 'var(--accent)' }}>{c.email}</a></td>
                  <td>{c.phone || '—'}</td>
                  <td>{[c.city, c.country].filter(Boolean).join(', ') || '—'}</td>
                  <td>
                    <div className="flex-center gap-2">
                      <button className="btn btn-outline btn-sm" onClick={() => openEdit(c)}>Edit</button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(c._id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {modal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="card-title">{modal === 'create' ? 'New Client' : `Edit — ${modal.name}`}</div>
              <button onClick={closeModal} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: 'var(--txt-muted)' }}>✕</button>
            </div>
            <form onSubmit={handleSave}>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Full Name *</label>
                    <input className="form-input" required value={form.name} onChange={e => setF('name', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email *</label>
                    <input className="form-input" type="email" required value={form.email} onChange={e => setF('email', e.target.value)} />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Company</label>
                    <input className="form-input" value={form.company} onChange={e => setF('company', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone</label>
                    <input className="form-input" value={form.phone} onChange={e => setF('phone', e.target.value)} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Address</label>
                  <input className="form-input" value={form.address} onChange={e => setF('address', e.target.value)} />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">City</label>
                    <input className="form-input" value={form.city} onChange={e => setF('city', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">State</label>
                    <input className="form-input" value={form.state} onChange={e => setF('state', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Country</label>
                    <input className="form-input" value={form.country} onChange={e => setF('country', e.target.value)} />
                  </div>
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Notes</label>
                  <textarea className="form-textarea" rows={2} value={form.notes} onChange={e => setF('notes', e.target.value)} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={closeModal}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Save Client'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}