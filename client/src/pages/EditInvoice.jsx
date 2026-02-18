import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';

const fmtDate = (d) => d ? new Date(d).toISOString().split('T')[0] : '';
const fmtCurrency = (n) => `$${(n || 0).toFixed(2)}`;
const emptyLine = () => ({ name: '', description: '', quantity: 1, price: 0, taxRate: 0, unit: 'hrs' });

export default function EditInvoice() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [items, setItems]     = useState([]);
  const [saving, setSaving]   = useState(false);
  const [invoiceNumber, setInvoiceNumber] = useState('');

  const [form, setForm] = useState({
    client: '', invoiceDate: '', dueDate: '', currency: 'USD',
    notes: '', terms: '', discountPct: 0, lines: [emptyLine()],
  });

  useEffect(() => {
    Promise.all([
      api.get(`/invoices/${id}`),
      api.get('/clients'),
      api.get('/items'),
    ]).then(([inv, c, it]) => {
      const inv_data = inv.data.invoice;
      setInvoiceNumber(inv_data.invoiceNumber);
      setForm({
        client: inv_data.client?._id || '',
        invoiceDate: fmtDate(inv_data.invoiceDate),
        dueDate: fmtDate(inv_data.dueDate),
        currency: inv_data.currency,
        notes: inv_data.notes,
        terms: inv_data.terms,
        discountPct: inv_data.discountPct || 0,
        lines: inv_data.lines.length ? inv_data.lines.map(l => ({
          name: l.name, description: l.description || '', quantity: l.quantity,
          price: l.price, taxRate: l.taxRate || 0, unit: l.unit || 'hrs',
        })) : [emptyLine()],
      });
      setClients(c.data.clients);
      setItems(it.data.items);
    }).catch(() => { toast.error('Failed to load invoice'); navigate('/invoices'); });
  }, [id]);

  const setField = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const setLine  = (idx, k, v) => setForm(f => {
    const lines = [...f.lines]; lines[idx] = { ...lines[idx], [k]: v }; return { ...f, lines };
  });
  const addLine    = () => setForm(f => ({ ...f, lines: [...f.lines, emptyLine()] }));
  const removeLine = (idx) => setForm(f => ({ ...f, lines: f.lines.filter((_, i) => i !== idx) }));

  const fillFromItem = (idx, itemId) => {
    const it = items.find(i => i._id === itemId);
    if (it) setForm(f => {
      const lines = [...f.lines];
      lines[idx] = { ...lines[idx], name: it.name, description: it.description, price: it.price, taxRate: it.taxRate, unit: it.unit };
      return { ...f, lines };
    });
  };

  const subtotal  = form.lines.reduce((s, l) => s + (l.quantity * l.price), 0);
  const taxTotal  = form.lines.reduce((s, l) => s + (l.quantity * l.price * (l.taxRate || 0) / 100), 0);
  const gross     = subtotal + taxTotal;
  const discount  = form.discountPct > 0 ? (gross * form.discountPct / 100) : 0;
  const total     = Math.max(0, gross - discount);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put(`/invoices/${id}`, form);
      toast.success('Invoice updated!');
      navigate(`/invoices/${id}`);
    } catch (err) { toast.error(err); }
    finally { setSaving(false); }
  };

  return (
    <>
      <div className="page-header">
        <div className="flex-center gap-3">
          <Link to={`/invoices/${id}`} className="btn btn-ghost btn-sm">← Back</Link>
          <div>
            <h1 className="page-title">Edit Invoice</h1>
            <p className="page-subtitle">{invoiceNumber}</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 24, alignItems: 'start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            <div className="card">
              <div className="card-header"><div className="card-title">Invoice Details</div></div>
              <div className="card-body">
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Client *</label>
                    <select className="form-select" value={form.client} onChange={e => setField('client', e.target.value)} required>
                      <option value="">Select client…</option>
                      {clients.map(c => <option key={c._id} value={c._id}>{c.name}{c.company ? ` — ${c.company}` : ''}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Currency</label>
                    <select className="form-select" value={form.currency} onChange={e => setField('currency', e.target.value)}>
                      {['USD','EUR','GBP','INR','CAD','AUD','JPY'].map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Invoice Date</label>
                    <input type="date" className="form-input" value={form.invoiceDate} onChange={e => setField('invoiceDate', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Due Date *</label>
                    <input type="date" className="form-input" value={form.dueDate} onChange={e => setField('dueDate', e.target.value)} required />
                  </div>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <div className="card-title">Line Items</div>
                <button type="button" className="btn btn-outline btn-sm" onClick={addLine}>+ Add Line</button>
              </div>
              <div className="card-body" style={{ padding: 0 }}>
                <div className="table-container">
                  <table className="lines-table">
                    <thead>
                      <tr><th>Item</th><th>Qty</th><th>Price</th><th>Tax %</th><th>Total</th><th></th></tr>
                    </thead>
                    <tbody>
                      {form.lines.map((line, idx) => (
                        <tr key={idx}>
                          <td>
                            {items.length > 0 && (
                              <select className="form-select" style={{ marginBottom: 6, fontSize: 12 }}
                                onChange={e => fillFromItem(idx, e.target.value)} defaultValue="">
                                <option value="">Quick fill…</option>
                                {items.map(it => <option key={it._id} value={it._id}>{it.name}</option>)}
                              </select>
                            )}
                            <input className="form-input" placeholder="Item name *" value={line.name}
                              onChange={e => setLine(idx, 'name', e.target.value)} style={{ fontSize: 13 }} />
                          </td>
                          <td><input type="number" className="form-input" min="0" step="0.01" value={line.quantity} onChange={e => setLine(idx, 'quantity', parseFloat(e.target.value) || 0)} /></td>
                          <td><input type="number" className="form-input" min="0" step="0.01" value={line.price} onChange={e => setLine(idx, 'price', parseFloat(e.target.value) || 0)} /></td>
                          <td><input type="number" className="form-input" min="0" max="100" value={line.taxRate} onChange={e => setLine(idx, 'taxRate', parseFloat(e.target.value) || 0)} /></td>
                          <td className="fw-bold mono" style={{ fontSize: 13 }}>{fmtCurrency(line.quantity * line.price * (1 + (line.taxRate || 0) / 100))}</td>
                          <td>
                            {form.lines.length > 1 && (
                              <button type="button" onClick={() => removeLine(idx)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)', fontSize: 16 }}>✕</button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-header"><div className="card-title">Notes & Terms</div></div>
              <div className="card-body">
                <div className="form-group">
                  <label className="form-label">Notes</label>
                  <textarea className="form-textarea" rows={3} value={form.notes} onChange={e => setField('notes', e.target.value)} />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Terms</label>
                  <textarea className="form-textarea" rows={2} value={form.terms} onChange={e => setField('terms', e.target.value)} />
                </div>
              </div>
            </div>
          </div>

          <div style={{ position: 'sticky', top: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="card">
              <div className="card-header"><div className="card-title">Summary</div></div>
              <div className="card-body">
                {[['Subtotal', fmtCurrency(subtotal)], ['Tax', fmtCurrency(taxTotal)]].map(([l, v]) => (
                  <div key={l} className="flex-center" style={{ marginBottom: 12 }}>
                    <span style={{ color: 'var(--txt-secondary)', fontSize: 14 }}>{l}</span>
                    <span className="ml-auto mono fw-bold">{v}</span>
                  </div>
                ))}
                <div className="form-group">
                  <label className="form-label">Discount (%)</label>
                  <input type="number" className="form-input" min="0" max="100" value={form.discountPct}
                    onChange={e => setField('discountPct', parseFloat(e.target.value) || 0)} />
                </div>
                {discount > 0 && (
                  <div className="flex-center" style={{ marginBottom: 12 }}>
                    <span style={{ fontSize: 14, color: 'var(--txt-secondary)' }}>Discount</span>
                    <span className="ml-auto mono text-danger">-{fmtCurrency(discount)}</span>
                  </div>
                )}
                <div className="divider" />
                <div className="flex-center">
                  <span style={{ fontWeight: 700, fontSize: 16 }}>Total</span>
                  <span className="ml-auto mono fw-bold" style={{ fontSize: 22, color: 'var(--accent)' }}>{fmtCurrency(total)}</span>
                </div>
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={saving}>
              {saving ? 'Saving…' : '💾 Update Invoice'}
            </button>
            <Link to={`/invoices/${id}`} className="btn btn-outline" style={{ width: '100%', justifyContent: 'center', textAlign: 'center' }}>
              Cancel
            </Link>
          </div>
        </div>
      </form>
    </>
  );
}