// import { useEffect, useState } from 'react';
// import { Link } from 'react-router-dom';
// import api from '../utils/api';
// import toast from 'react-hot-toast';

// const fmtCurrency = (n, c = 'USD') => new Intl.NumberFormat('en-US', { style: 'currency', currency: c, minimumFractionDigits: 0 }).format(n || 0);
// const statusBadge = (s) => <span className={`badge badge-${s}`}>{s}</span>;
// const STATUSES = ['', 'draft', 'sent', 'paid', 'overdue', 'cancelled'];

// export default function InvoicesPage() {
//   const [invoices, setInvoices] = useState([]);
//   const [total, setTotal]       = useState(0);
//   const [loading, setLoading]   = useState(true);
//   const [status, setStatus]     = useState('');
//   const [search, setSearch]     = useState('');
//   const [page, setPage]         = useState(1);
//   const LIMIT = 15;

//   const fetchInvoices = async () => {
//     setLoading(true);
//     try {
//       const params = { page, limit: LIMIT };
//       if (status) params.status = status;
//       if (search) params.search = search;
//       const { data } = await api.get('/invoices', { params });
//       setInvoices(data.invoices);
//       setTotal(data.total);
//     } catch { toast.error('Failed to load invoices'); }
//     finally  { setLoading(false); }
//   };

//   useEffect(() => { fetchInvoices(); }, [status, page]);
//   useEffect(() => {
//     const t = setTimeout(fetchInvoices, 350);
//     return () => clearTimeout(t);
//   }, [search]);

//   const handleDelete = async (id) => {
//     if (!window.confirm('Delete this invoice?')) return;
//     await api.delete(`/invoices/${id}`);
//     toast.success('Invoice deleted');
//     fetchInvoices();
//   };

//   const handleStatusChange = async (id, newStatus) => {
//     await api.patch(`/invoices/${id}/status`, { status: newStatus });
//     toast.success(`Status updated to ${newStatus}`);
//     fetchInvoices();
//   };

//   return (
//     <>
//       <div className="page-header">
//         <div>
//           <h1 className="page-title">Invoices</h1>
//           <p className="page-subtitle">{total} invoice{total !== 1 ? 's' : ''} total</p>
//         </div>
//         <Link to="/invoices/new" className="btn btn-primary">+ New Invoice</Link>
//       </div>

//       {/* Filters */}
//       <div className="flex-center gap-3 mb-4" style={{ flexWrap: 'wrap', marginBottom: 20 }}>
//         <div className="search-bar">
//           <span className="search-icon">🔍</span>
//           <input
//             className="form-input"
//             placeholder="Search by invoice number…"
//             value={search}
//             onChange={e => setSearch(e.target.value)}
//           />
//         </div>
//         <div className="flex-center gap-2" style={{ flexWrap: 'wrap' }}>
//           {STATUSES.map(s => (
//             <button key={s}
//               className={`btn btn-sm ${status === s ? 'btn-primary' : 'btn-outline'}`}
//               onClick={() => { setStatus(s); setPage(1); }}>
//               {s || 'All'}
//             </button>
//           ))}
//         </div>
//       </div>

//       <div className="card">
//         <div className="table-container">
//           <table>
//             <thead>
//               <tr>
//                 <th>Invoice #</th><th>Client</th><th>Issue Date</th><th>Due Date</th>
//                 <th className="text-right">Amount</th><th>Status</th><th>Actions</th>
//               </tr>
//             </thead>
//             <tbody>
//               {loading ? (
//                 <tr><td colSpan={7} className="text-center text-muted" style={{ padding: 32 }}>Loading…</td></tr>
//               ) : invoices.length === 0 ? (
//                 <tr>
//                   <td colSpan={7}>
//                     <div className="empty-state">
//                       <div className="empty-state-icon">📄</div>
//                       <div className="empty-state-title">No invoices found</div>
//                       <div className="empty-state-text">Create your first invoice to get started</div>
//                       <Link to="/invoices/new" className="btn btn-primary">+ Create Invoice</Link>
//                     </div>
//                   </td>
//                 </tr>
//               ) : invoices.map(inv => (
//                 <tr key={inv._id}>
//                   <td><Link to={`/invoices/${inv._id}`} className="text-accent fw-bold mono">{inv.invoiceNumber}</Link></td>
//                   <td>
//                     <div style={{ fontWeight: 500 }}>{inv.client?.name}</div>
//                     <div style={{ fontSize: 12, color: 'var(--txt-muted)' }}>{inv.client?.email}</div>
//                   </td>
//                   <td>{new Date(inv.invoiceDate).toLocaleDateString()}</td>
//                   <td>
//                     <span style={{ color: new Date(inv.dueDate) < new Date() && inv.status !== 'paid' ? 'var(--danger)' : 'inherit' }}>
//                       {new Date(inv.dueDate).toLocaleDateString()}
//                     </span>
//                   </td>
//                   <td className="text-right fw-bold mono">{fmtCurrency(inv.total, inv.currency)}</td>
//                   <td>{statusBadge(inv.status)}</td>
//                   <td>
//                     <div className="flex-center gap-2">
//                       <Link to={`/invoices/${inv._id}`} className="btn btn-ghost btn-sm">View</Link>
//                       {inv.status !== 'paid' && inv.status !== 'cancelled' && (
//                         <Link to={`/invoices/${inv._id}/edit`} className="btn btn-outline btn-sm">Edit</Link>
//                       )}
//                       <select
//                         className="form-select"
//                         style={{ padding: '5px 8px', fontSize: 12, width: 'auto', borderRadius: 6 }}
//                         value={inv.status}
//                         onChange={e => handleStatusChange(inv._id, e.target.value)}
//                       >
//                         {['draft','sent','paid','overdue','cancelled'].map(s => <option key={s}>{s}</option>)}
//                       </select>
//                       <button className="btn btn-danger btn-sm" onClick={() => handleDelete(inv._id)}>✕</button>
//                     </div>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>

//         {/* Pagination */}
//         {total > LIMIT && (
//           <div className="flex-center gap-2" style={{ padding: '16px 24px', borderTop: '1px solid var(--border)', justifyContent: 'space-between' }}>
//             <span style={{ fontSize: 13, color: 'var(--txt-muted)' }}>
//               Showing {(page - 1) * LIMIT + 1}–{Math.min(page * LIMIT, total)} of {total}
//             </span>
//             <div className="flex-center gap-2">
//               <button className="btn btn-outline btn-sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
//               <button className="btn btn-outline btn-sm" disabled={page * LIMIT >= total} onClick={() => setPage(p => p + 1)}>Next →</button>
//             </div>
//           </div>
//         )}
//       </div>
//     </>
//   );
// }

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';

const fmtCurrency = (n, c = 'USD') => new Intl.NumberFormat('en-US', { style: 'currency', currency: c, minimumFractionDigits: 0 }).format(n || 0);
const statusBadge = (s) => <span className={`badge badge-${s}`}>{s}</span>;
const STATUSES = ['', 'draft', 'sent', 'paid', 'overdue', 'cancelled'];

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState([]);
  const [total, setTotal]       = useState(0);
  const [loading, setLoading]   = useState(true);
  const [status, setStatus]     = useState('');
  const [search, setSearch]     = useState('');
  const [page, setPage]         = useState(1);
  const LIMIT = 15;

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const params = { page, limit: LIMIT };
      if (status) params.status = status;
      if (search) params.search = search;
      const { data } = await api.get('/invoices', { params });
      setInvoices(data.invoices);
      setTotal(data.total);
    } catch { toast.error('Failed to load invoices'); }
    finally  { setLoading(false); }
  };

  useEffect(() => { fetchInvoices(); }, [status, page]);
  useEffect(() => {
    const t = setTimeout(fetchInvoices, 350);
    return () => clearTimeout(t);
  }, [search]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this invoice?')) return;
    await api.delete(`/invoices/${id}`);
    toast.success('Invoice deleted');
    fetchInvoices();
  };

  const handleStatusChange = async (id, newStatus) => {
    // Optimistic update: change the badge immediately so the user sees instant feedback
    setInvoices(prev =>
      prev.map(inv =>
        inv._id === id
          ? {
              ...inv,
              status: newStatus,
              // When marking paid, zero out the balance shown in the list
              balanceDue:  newStatus === 'paid' ? 0 : inv.balanceDue,
              amountPaid:  newStatus === 'paid' ? inv.total : inv.amountPaid,
            }
          : inv
      )
    );

    try {
      const amountPaid = newStatus === 'paid' ? undefined : undefined; // server handles full payment
      await api.patch(`/invoices/${id}/status`, { status: newStatus, ...(newStatus === 'paid' ? { amountPaid: null } : {}) });
      toast.success(`Status → ${newStatus}`);
      // Re-fetch in background to sync exact server values (balanceDue, paidAt, etc.)
      fetchInvoices();
    } catch (err) {
      toast.error(typeof err === 'string' ? err : 'Failed to update status');
      // Rollback optimistic update on failure
      fetchInvoices();
    }
  };

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Invoices</h1>
          <p className="page-subtitle">{total} invoice{total !== 1 ? 's' : ''} total</p>
        </div>
        <Link to="/invoices/new" className="btn btn-primary">+ New Invoice</Link>
      </div>

      {/* Filters */}
      <div className="flex-center gap-3 mb-4" style={{ flexWrap: 'wrap', marginBottom: 20 }}>
        <div className="search-bar">
          <span className="search-icon">🔍</span>
          <input
            className="form-input"
            placeholder="Search by invoice number…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="flex-center gap-2" style={{ flexWrap: 'wrap' }}>
          {STATUSES.map(s => (
            <button key={s}
              className={`btn btn-sm ${status === s ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => { setStatus(s); setPage(1); }}>
              {s || 'All'}
            </button>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Invoice #</th><th>Client</th><th>Issue Date</th><th>Due Date</th>
                <th className="text-right">Amount</th><th>Status</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="text-center text-muted" style={{ padding: 32 }}>Loading…</td></tr>
              ) : invoices.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <div className="empty-state">
                      <div className="empty-state-icon">📄</div>
                      <div className="empty-state-title">No invoices found</div>
                      <div className="empty-state-text">Create your first invoice to get started</div>
                      <Link to="/invoices/new" className="btn btn-primary">+ Create Invoice</Link>
                    </div>
                  </td>
                </tr>
              ) : invoices.map(inv => (
                <tr key={inv._id}>
                  <td><Link to={`/invoices/${inv._id}`} className="text-accent fw-bold mono">{inv.invoiceNumber}</Link></td>
                  <td>
                    <div style={{ fontWeight: 500 }}>{inv.client?.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--txt-muted)' }}>{inv.client?.email}</div>
                  </td>
                  <td>{new Date(inv.invoiceDate).toLocaleDateString()}</td>
                  <td>
                    <span style={{ color: new Date(inv.dueDate) < new Date() && inv.status !== 'paid' ? 'var(--danger)' : 'inherit' }}>
                      {new Date(inv.dueDate).toLocaleDateString()}
                    </span>
                  </td>
                  <td className="text-right fw-bold mono">{fmtCurrency(inv.total, inv.currency)}</td>
                  <td>{statusBadge(inv.status)}</td>
                  <td>
                    <div className="flex-center gap-2">
                      <Link to={`/invoices/${inv._id}`} className="btn btn-ghost btn-sm">View</Link>
                      {inv.status !== 'paid' && inv.status !== 'cancelled' && (
                        <Link to={`/invoices/${inv._id}/edit`} className="btn btn-outline btn-sm">Edit</Link>
                      )}
                      <select
                        className="form-select"
                        style={{ padding: '5px 8px', fontSize: 12, width: 'auto', borderRadius: 6 }}
                        value={inv.status}
                        onChange={e => handleStatusChange(inv._id, e.target.value)}
                      >
                        {['draft','sent','paid','overdue','cancelled'].map(s => <option key={s}>{s}</option>)}
                      </select>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(inv._id)}>✕</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {total > LIMIT && (
          <div className="flex-center gap-2" style={{ padding: '16px 24px', borderTop: '1px solid var(--border)', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 13, color: 'var(--txt-muted)' }}>
              Showing {(page - 1) * LIMIT + 1}–{Math.min(page * LIMIT, total)} of {total}
            </span>
            <div className="flex-center gap-2">
              <button className="btn btn-outline btn-sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
              <button className="btn btn-outline btn-sm" disabled={page * LIMIT >= total} onClick={() => setPage(p => p + 1)}>Next →</button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}