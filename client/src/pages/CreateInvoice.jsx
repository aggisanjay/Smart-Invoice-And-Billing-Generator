import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';

const fmtCurrency = (n) => `$${(n || 0).toFixed(2)}`;
const TODAY = new Date().toISOString().split('T')[0];
const DUE30 = new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0];

const emptyLine = () => ({ name: '', description: '', quantity: 1, price: 0, taxRate: 0, unit: 'hrs' });

export default function CreateInvoice() {
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [items, setItems]     = useState([]);
  const [saving, setSaving]   = useState(false);

  const [form, setForm] = useState({
    client: '', invoiceDate: TODAY, dueDate: DUE30, currency: 'USD',
    notes: '', terms: 'Payment due within 30 days.', discountPct: 0,
    lines: [emptyLine()],
  });

  useEffect(() => {
    Promise.all([api.get('/clients'), api.get('/items')])
      .then(([c, i]) => { setClients(c.data.clients); setItems(i.data.items); });
  }, []);

  const setField = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const setLine = (idx, k, v) => {
    setForm(f => {
      const lines = [...f.lines];
      lines[idx] = { ...lines[idx], [k]: v };
      return { ...f, lines };
    });
  };

  const addLine   = () => setForm(f => ({ ...f, lines: [...f.lines, emptyLine()] }));
  const removeLine = (idx) => setForm(f => ({ ...f, lines: f.lines.filter((_, i) => i !== idx) }));

  const fillFromItem = (idx, itemId) => {
    const it = items.find(i => i._id === itemId);
    if (it) setForm(f => {
      const lines = [...f.lines];
      lines[idx] = { ...lines[idx], name: it.name, description: it.description, price: it.price, taxRate: it.taxRate, unit: it.unit };
      return { ...f, lines };
    });
  };

  // Totals
  const subtotal  = form.lines.reduce((s, l) => s + (l.quantity * l.price), 0);
  const taxTotal  = form.lines.reduce((s, l) => s + (l.quantity * l.price * (l.taxRate || 0) / 100), 0);
  const gross     = subtotal + taxTotal;
  const discount  = form.discountPct > 0 ? (gross * form.discountPct / 100) : 0;
  const total     = Math.max(0, gross - discount);

  const handleSubmit = async (e, status = 'draft') => {
    e.preventDefault();
    if (!form.client) return toast.error('Please select a client');
    if (form.lines.some(l => !l.name)) return toast.error('All line items need a name');
    setSaving(true);
    try {
      const payload = { ...form, status };
      const { data } = await api.post('/invoices', payload);
      toast.success(`Invoice ${data.invoice.invoiceNumber} created!`);
      navigate(`/invoices/${data.invoice._id}`);
    } catch (err) {
      toast.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">New Invoice</h1>
          <p className="page-subtitle">Fill in the details below</p>
        </div>
      </div>

      <form onSubmit={(e) => handleSubmit(e, 'draft')}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 24, alignItems: 'start' }}>

          {/* ── LEFT: MAIN FORM ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Client & Dates */}
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

            {/* Line Items */}
            <div className="card">
              <div className="card-header">
                <div className="card-title">Line Items</div>
                <button type="button" className="btn btn-outline btn-sm" onClick={addLine}>+ Add Line</button>
              </div>
              <div className="card-body" style={{ padding: 0 }}>
                <div className="table-container">
                  <table className="lines-table">
                    <thead>
                      <tr>
                        <th style={{ width: 200 }}>Item / Service</th>
                        <th style={{ width: 70  }}>Qty</th>
                        <th style={{ width: 100 }}>Price</th>
                        <th style={{ width: 80  }}>Tax %</th>
                        <th style={{ width: 100 }}>Total</th>
                        <th style={{ width: 40  }}></th>
                      </tr>
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
                            <input className="form-input" placeholder="Description (optional)" value={line.description}
                              onChange={e => setLine(idx, 'description', e.target.value)}
                              style={{ fontSize: 12, marginTop: 4, color: 'var(--txt-muted)' }} />
                          </td>
                          <td>
                            <input type="number" className="form-input" min="0" step="0.01" value={line.quantity}
                              onChange={e => setLine(idx, 'quantity', parseFloat(e.target.value) || 0)} />
                          </td>
                          <td>
                            <input type="number" className="form-input" min="0" step="0.01" value={line.price}
                              onChange={e => setLine(idx, 'price', parseFloat(e.target.value) || 0)} />
                          </td>
                          <td>
                            <input type="number" className="form-input" min="0" max="100" step="0.1" value={line.taxRate}
                              onChange={e => setLine(idx, 'taxRate', parseFloat(e.target.value) || 0)} />
                          </td>
                          <td className="fw-bold mono" style={{ fontSize: 13 }}>
                            {fmtCurrency(line.quantity * line.price * (1 + (line.taxRate || 0) / 100))}
                          </td>
                          <td>
                            {form.lines.length > 1 && (
                              <button type="button" onClick={() => removeLine(idx)}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)', fontSize: 16 }}>✕</button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="card">
              <div className="card-header"><div className="card-title">Notes & Terms</div></div>
              <div className="card-body">
                <div className="form-group">
                  <label className="form-label">Notes (visible to client)</label>
                  <textarea className="form-textarea" rows={3} placeholder="Thank you for your business…"
                    value={form.notes} onChange={e => setField('notes', e.target.value)} />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Terms & Conditions</label>
                  <textarea className="form-textarea" rows={2}
                    value={form.terms} onChange={e => setField('terms', e.target.value)} />
                </div>
              </div>
            </div>
          </div>

          {/* ── RIGHT: SUMMARY ── */}
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
                  <input type="number" className="form-input" min="0" max="100" placeholder="0"
                    value={form.discountPct} onChange={e => setField('discountPct', parseFloat(e.target.value) || 0)} />
                </div>
                {discount > 0 && (
                  <div className="flex-center" style={{ marginBottom: 12 }}>
                    <span style={{ color: 'var(--txt-secondary)', fontSize: 14 }}>Discount</span>
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

            <button type="submit" className="btn btn-outline" style={{ width: '100%', justifyContent: 'center' }} disabled={saving}>
              💾 Save as Draft
            </button>
            <button type="button" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={saving}
              onClick={(e) => handleSubmit(e, 'sent')}>
              {saving ? 'Creating…' : '📤 Create & Send'}
            </button>
          </div>
        </div>
      </form>
    </>
  );
}