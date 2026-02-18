// import { useEffect, useState } from 'react';
// import { useParams, useNavigate, Link } from 'react-router-dom';
// import api from '../utils/api';
// import toast from 'react-hot-toast';

// const fmtCurrency = (n, c = 'USD') => new Intl.NumberFormat('en-US', { style: 'currency', currency: c }).format(n || 0);
// const statusBadge = (s) => <span className={`badge badge-${s}`}>{s}</span>;

// export default function InvoiceDetail() {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const [invoice, setInvoice] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [emailing, setEmailing] = useState(false);

//   useEffect(() => {
//     api.get(`/invoices/${id}`)
//       .then(r => setInvoice(r.data.invoice))
//       .catch(() => { toast.error('Invoice not found'); navigate('/invoices'); })
//       .finally(() => setLoading(false));
//   }, [id]);

//   const handleEmail = async () => {
//     setEmailing(true);
//     try {
//       const { data } = await api.post(`/invoices/${id}/email`);
//       toast.success(data.message);
//       setInvoice(inv => ({ ...inv, status: 'sent', emailedAt: new Date() }));
//     } catch (err) { toast.error(err); }
//     finally { setEmailing(false); }
//   };


// const handleDownloadPDF = async () => {
//   try {
//     const res = await api.get(`/invoices/${id}/pdf`, {
//       responseType: "blob",
//       headers: { Accept: "application/pdf" }
//     });

//     const url = window.URL.createObjectURL(
//       new Blob([res.data], { type: "application/pdf" })
//     );

//     const link = document.createElement("a");
//     link.href = url;
//     link.setAttribute("download", `${invoice.invoiceNumber}.pdf`);
//     document.body.appendChild(link);
//     link.click();
//     link.remove();

//     window.URL.revokeObjectURL(url);

//     toast.success("Downloading PDF…");
//   } catch (err) {
//     toast.error("Failed to download PDF");
//   }
// };



//   const handleStatusChange = async (status) => {
//     const amountPaid = status === 'paid' ? invoice.total : undefined;
//     await api.patch(`/invoices/${id}/status`, { status, amountPaid });
//     setInvoice(inv => ({ ...inv, status, amountPaid: amountPaid || inv.amountPaid, paidAt: status === 'paid' ? new Date() : inv.paidAt }));
//     toast.success(`Status → ${status}`);
//   };

//   const handleDelete = async () => {
//     if (!window.confirm('Delete this invoice permanently?')) return;
//     await api.delete(`/invoices/${id}`);
//     toast.success('Invoice deleted');
//     navigate('/invoices');
//   };

//   if (loading) return <div className="empty-state"><p>Loading…</p></div>;
//   if (!invoice) return null;

//   const { client, user, lines = [] } = invoice;

//   return (
//     <>
//       <div className="page-header">
//         <div className="flex-center gap-3">
//           <Link to="/invoices" className="btn btn-ghost btn-sm">← Back</Link>
//           <div>
//             <h1 className="page-title">{invoice.invoiceNumber}</h1>
//             <div className="flex-center gap-2 mt-1">
//               {statusBadge(invoice.status)}
//               {invoice.emailedAt && <span style={{ fontSize: 12, color: 'var(--txt-muted)' }}>Emailed {new Date(invoice.emailedAt).toLocaleDateString()}</span>}
//             </div>
//           </div>
//         </div>
//         <div className="flex-center gap-2">
//           <button className="btn btn-outline" onClick={handleDownloadPDF}>⬇ PDF</button>
//           <button className="btn btn-outline" onClick={handleEmail} disabled={emailing}>
//             {emailing ? 'Sending…' : '📧 Email Client'}
//           </button>
//           {invoice.status !== 'paid' && invoice.status !== 'cancelled' && (
//             <Link to={`/invoices/${id}/edit`} className="btn btn-outline">✏️ Edit</Link>
//           )}
//           <select className="form-select" style={{ width: 'auto', padding: '10px 14px' }}
//             value={invoice.status}
//             onChange={e => handleStatusChange(e.target.value)}>
//             {['draft','sent','paid','overdue','cancelled'].map(s => <option key={s}>{s}</option>)}
//           </select>
//           <button className="btn btn-danger btn-sm" onClick={handleDelete}>Delete</button>
//         </div>
//       </div>

//       {/* Invoice Preview */}
//       <div className="card" style={{ maxWidth: 860, margin: '0 auto' }}>
//         {/* Invoice Header */}
//         <div style={{ background: '#0f172a', borderRadius: '12px 12px 0 0', padding: 36, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
//           <div>
//             <div style={{ color: '#fff', fontSize: 22, fontWeight: 700, marginBottom: 8 }}>
//               {user?.businessName || user?.name}
//             </div>
//             {user?.address && <div style={{ color: '#94a3b8', fontSize: 13 }}>{user.address}</div>}
//             {user?.phone   && <div style={{ color: '#94a3b8', fontSize: 13 }}>{user.phone}</div>}
//             {user?.email   && <div style={{ color: '#94a3b8', fontSize: 13 }}>{user.email}</div>}
//           </div>
//           <div style={{ textAlign: 'right' }}>
//             <div style={{ color: '#e2e8ff', fontSize: 32, fontWeight: 800, letterSpacing: -1 }}>INVOICE</div>
//             <div style={{ color: '#94a3b8', fontSize: 13, marginTop: 4 }}>#{invoice.invoiceNumber}</div>
//             <div style={{ color: '#94a3b8', fontSize: 13 }}>
//               Issued: {new Date(invoice.invoiceDate).toLocaleDateString()}
//             </div>
//             <div style={{ color: '#94a3b8', fontSize: 13 }}>
//               Due: {new Date(invoice.dueDate).toLocaleDateString()}
//             </div>
//             <div style={{ marginTop: 8 }}>{statusBadge(invoice.status)}</div>
//           </div>
//         </div>

//         {/* Bill To */}
//         <div style={{ padding: '24px 36px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 48 }}>
//           <div>
//             <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--txt-muted)', marginBottom: 8 }}>Bill To</div>
//             <div style={{ fontWeight: 600, fontSize: 16 }}>{client?.name}</div>
//             {client?.company && <div style={{ color: 'var(--txt-secondary)' }}>{client.company}</div>}
//             {client?.email   && <div style={{ color: 'var(--txt-secondary)' }}>{client.email}</div>}
//             {client?.address && <div style={{ color: 'var(--txt-secondary)' }}>{client.address}</div>}
//           </div>
//         </div>

//         {/* Lines */}
//         <div className="table-container" style={{ margin: '0 20px' }}>
//           <table>
//             <thead>
//               <tr>
//                 <th>Description</th><th>Qty</th><th>Unit Price</th><th>Tax</th><th className="text-right">Amount</th>
//               </tr>
//             </thead>
//             <tbody>
//               {lines.map((line, idx) => (
//                 <tr key={idx}>
//                   <td>
//                     <div className="td-primary">{line.name}</div>
//                     {line.description && <div style={{ fontSize: 12, color: 'var(--txt-muted)' }}>{line.description}</div>}
//                   </td>
//                   <td>{line.quantity} {line.unit}</td>
//                   <td className="mono">{fmtCurrency(line.price, invoice.currency)}</td>
//                   <td>{line.taxRate || 0}%</td>
//                   <td className="text-right fw-bold mono">{fmtCurrency(line.total, invoice.currency)}</td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>

//         {/* Totals */}
//         <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '24px 36px' }}>
//           <div style={{ width: 300 }}>
//             {[
//               ['Subtotal', fmtCurrency(invoice.subtotal, invoice.currency)],
//               ['Tax',      fmtCurrency(invoice.taxAmount, invoice.currency)],
//               ...(invoice.discountPct > 0 ? [[`Discount (${invoice.discountPct}%)`, `-${fmtCurrency((invoice.subtotal + invoice.taxAmount) * invoice.discountPct / 100, invoice.currency)}`]] : []),
//             ].map(([l, v]) => (
//               <div key={l} className="flex-center" style={{ marginBottom: 10 }}>
//                 <span style={{ color: 'var(--txt-secondary)', fontSize: 14 }}>{l}</span>
//                 <span className="ml-auto mono">{v}</span>
//               </div>
//             ))}
//             <div className="divider" />
//             <div style={{ background: '#0f172a', borderRadius: 8, padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//               <span style={{ color: '#fff', fontWeight: 700 }}>Total Due</span>
//               <span style={{ color: '#818cf8', fontWeight: 800, fontSize: 20, fontFamily: 'DM Mono' }}>
//                 {fmtCurrency(invoice.balanceDue, invoice.currency)}
//               </span>
//             </div>
//           </div>
//         </div>

//         {/* Notes */}
//         {(invoice.notes || invoice.terms) && (
//           <div style={{ padding: '0 36px 36px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
//             {invoice.notes && <div>
//               <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--txt-muted)', marginBottom: 6 }}>Notes</div>
//               <p style={{ color: 'var(--txt-secondary)', fontSize: 13 }}>{invoice.notes}</p>
//             </div>}
//             {invoice.terms && <div>
//               <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--txt-muted)', marginBottom: 6 }}>Terms</div>
//               <p style={{ color: 'var(--txt-secondary)', fontSize: 13 }}>{invoice.terms}</p>
//             </div>}
//           </div>
//         )}
//       </div>
//     </>
//   );
// }

import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';

const fmtCurrency = (n, c = 'USD') => new Intl.NumberFormat('en-US', { style: 'currency', currency: c }).format(n || 0);
const statusBadge = (s) => <span className={`badge badge-${s}`}>{s}</span>;

export default function InvoiceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [emailing, setEmailing] = useState(false);

  useEffect(() => {
    api.get(`/invoices/${id}`)
      .then(r => setInvoice(r.data.invoice))
      .catch(() => { toast.error('Invoice not found'); navigate('/invoices'); })
      .finally(() => setLoading(false));
  }, [id]);

  const handleEmail = async () => {
    setEmailing(true);
    try {
      const { data } = await api.post(`/invoices/${id}/email`);
      toast.success(data.message);
      setInvoice(inv => ({ ...inv, status: 'sent', emailedAt: new Date() }));
    } catch (err) { toast.error(err); }
    finally { setEmailing(false); }
  };


const handleDownloadPDF = async () => {
  try {
    const res = await api.get(`/invoices/${id}/pdf`, {
      responseType: "blob",
      headers: { Accept: "application/pdf" }
    });

    const url = window.URL.createObjectURL(
      new Blob([res.data], { type: "application/pdf" })
    );

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${invoice.invoiceNumber}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();

    window.URL.revokeObjectURL(url);

    toast.success("Downloading PDF…");
  } catch (err) {
    toast.error("Failed to download PDF");
  }
};



  const handleStatusChange = async (status) => {
    const amountPaid = status === 'paid' ? invoice.total : undefined;
    await api.patch(`/invoices/${id}/status`, { status, amountPaid });
    setInvoice(inv => ({ ...inv, status, amountPaid: amountPaid || inv.amountPaid, paidAt: status === 'paid' ? new Date() : inv.paidAt }));
    toast.success(`Status → ${status}`);
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this invoice permanently?')) return;
    await api.delete(`/invoices/${id}`);
    toast.success('Invoice deleted');
    navigate('/invoices');
  };

  if (loading) return <div className="empty-state"><p>Loading…</p></div>;
  if (!invoice) return null;

  const { client, user, lines = [] } = invoice;

  return (
    <>
      <div className="page-header">
        <div className="flex-center gap-3">
          <Link to="/invoices" className="btn btn-ghost btn-sm">← Back</Link>
          <div>
            <h1 className="page-title">{invoice.invoiceNumber}</h1>
            <div className="flex-center gap-2 mt-1">
              {statusBadge(invoice.status)}
              {invoice.emailedAt && <span style={{ fontSize: 12, color: 'var(--txt-muted)' }}>Emailed {new Date(invoice.emailedAt).toLocaleDateString()}</span>}
            </div>
          </div>
        </div>
        <div className="flex-center gap-2">
          <button className="btn btn-outline" onClick={handleDownloadPDF}>⬇ PDF</button>
          <button className="btn btn-outline" onClick={handleEmail} disabled={emailing}>
            {emailing ? 'Sending…' : '📧 Email Client'}
          </button>
          {invoice.status !== 'paid' && invoice.status !== 'cancelled' && (
            <Link to={`/invoices/${id}/edit`} className="btn btn-outline">✏️ Edit</Link>
          )}
          <select className="form-select" style={{ width: 'auto', padding: '10px 14px' }}
            value={invoice.status}
            onChange={e => handleStatusChange(e.target.value)}>
            {['draft','sent','paid','overdue','cancelled'].map(s => <option key={s}>{s}</option>)}
          </select>
          <button className="btn btn-danger btn-sm" onClick={handleDelete}>Delete</button>
        </div>
      </div>

      {/* Invoice Preview */}
      <div className="card" style={{ maxWidth: 860, margin: '0 auto' }}>
        {/* Invoice Header */}
        <div style={{ background: '#0f172a', borderRadius: '12px 12px 0 0', padding: 36, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ color: '#fff', fontSize: 22, fontWeight: 700, marginBottom: 8 }}>
              {user?.businessName || user?.name}
            </div>
            {user?.address && <div style={{ color: '#94a3b8', fontSize: 13 }}>{user.address}</div>}
            {user?.phone   && <div style={{ color: '#94a3b8', fontSize: 13 }}>{user.phone}</div>}
            {user?.email   && <div style={{ color: '#94a3b8', fontSize: 13 }}>{user.email}</div>}
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ color: '#e2e8ff', fontSize: 32, fontWeight: 800, letterSpacing: -1 }}>INVOICE</div>
            <div style={{ color: '#94a3b8', fontSize: 13, marginTop: 4 }}>#{invoice.invoiceNumber}</div>
            <div style={{ color: '#94a3b8', fontSize: 13 }}>
              Issued: {new Date(invoice.invoiceDate).toLocaleDateString()}
            </div>
            <div style={{ color: '#94a3b8', fontSize: 13 }}>
              Due: {new Date(invoice.dueDate).toLocaleDateString()}
            </div>
            <div style={{ marginTop: 8 }}>{statusBadge(invoice.status)}</div>
          </div>
        </div>

        {/* Bill To */}
        <div style={{ padding: '24px 36px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 48 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--txt-muted)', marginBottom: 8 }}>Bill To</div>
            <div style={{ fontWeight: 600, fontSize: 16 }}>{client?.name}</div>
            {client?.company && <div style={{ color: 'var(--txt-secondary)' }}>{client.company}</div>}
            {client?.email   && <div style={{ color: 'var(--txt-secondary)' }}>{client.email}</div>}
            {client?.address && <div style={{ color: 'var(--txt-secondary)' }}>{client.address}</div>}
          </div>
        </div>

        {/* Lines */}
        <div className="table-container" style={{ margin: '0 20px' }}>
          <table>
            <thead>
              <tr>
                <th>Description</th><th>Qty</th><th>Unit Price</th><th>Tax</th><th className="text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {lines.map((line, idx) => (
                <tr key={idx}>
                  <td>
                    <div className="td-primary">{line.name}</div>
                    {line.description && <div style={{ fontSize: 12, color: 'var(--txt-muted)' }}>{line.description}</div>}
                  </td>
                  <td>{line.quantity} {line.unit}</td>
                  <td className="mono">{fmtCurrency(line.price, invoice.currency)}</td>
                  <td>{line.taxRate || 0}%</td>
                  <td className="text-right fw-bold mono">{fmtCurrency(line.total, invoice.currency)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '24px 36px' }}>
          <div style={{ width: 300 }}>
            {[
              ['Subtotal', fmtCurrency(invoice.subtotal, invoice.currency)],
              ['Tax',      fmtCurrency(invoice.taxAmount, invoice.currency)],
              ...(invoice.discountPct > 0 ? [[`Discount (${invoice.discountPct}%)`, `-${fmtCurrency((invoice.subtotal + invoice.taxAmount) * invoice.discountPct / 100, invoice.currency)}`]] : []),
            ].map(([l, v]) => (
              <div key={l} className="flex-center" style={{ marginBottom: 10 }}>
                <span style={{ color: 'var(--txt-secondary)', fontSize: 14 }}>{l}</span>
                <span className="ml-auto mono">{v}</span>
              </div>
            ))}
            <div className="divider" />
            <div style={{ background: '#0f172a', borderRadius: 8, padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#fff', fontWeight: 700 }}>Total Due</span>
              <span style={{ color: '#818cf8', fontWeight: 800, fontSize: 20, fontFamily: 'DM Mono' }}>
                {fmtCurrency(invoice.balanceDue, invoice.currency)}
              </span>
            </div>
          </div>
        </div>

        {/* Notes */}
        {(invoice.notes || invoice.terms) && (
          <div style={{ padding: '0 36px 36px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            {invoice.notes && <div>
              <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--txt-muted)', marginBottom: 6 }}>Notes</div>
              <p style={{ color: 'var(--txt-secondary)', fontSize: 13 }}>{invoice.notes}</p>
            </div>}
            {invoice.terms && <div>
              <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--txt-muted)', marginBottom: 6 }}>Terms</div>
              <p style={{ color: 'var(--txt-secondary)', fontSize: 13 }}>{invoice.terms}</p>
            </div>}
          </div>
        )}
      </div>
    </>
  );
}