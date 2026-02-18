
import { useEffect, useState, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../utils/api';
import toast from 'react-hot-toast';

const fmtCurrency = (n, currency = 'USD') =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency, minimumFractionDigits: 0 }).format(n || 0);

const statusBadge = (s) => <span className={`badge badge-${s}`}>{s}</span>;

export default function Dashboard() {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const location              = useLocation();

  // ─── fetchDashboard is stable; location.key changes every time the user
  //     navigates to "/" so we always get fresh numbers ───────────────────
  const fetchDashboard = useCallback(() => {
    setLoading(true);
    api.get('/dashboard')
      .then(r => setData(r.data))
      .catch(() => toast.error('Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  // Re-fetch every time this page is visited (location.key is unique per navigation)
  useEffect(() => {
    fetchDashboard();
  }, [location.key, fetchDashboard]);

  // Show skeleton on first load; show stale data + spinner on re-fetch
  if (loading && !data) return <div className="empty-state"><p>Loading dashboard…</p></div>;
  if (!data)            return null;

  const { summary, monthlyData, recentInvoices } = data;

  const stats = [
    { label: 'Total Revenue',  value: fmtCurrency(summary.totalRevenue),  icon: '💰', color: 'success', sub: 'All time paid invoices' },
    { label: 'Outstanding',    value: fmtCurrency(summary.outstanding),   icon: '⏳', color: 'warning', sub: `${(summary.sent || 0) + (summary.draft || 0)} invoices pending` },
    { label: 'Overdue Amount', value: fmtCurrency(summary.overdueAmount), icon: '🔴', color: 'danger',  sub: `${summary.overdueCount} overdue invoices` },
    { label: 'Total Clients',  value: summary.totalClients,               icon: '👥', color: 'accent',  sub: `${summary.totalInvoices} total invoices` },
  ];

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">
            Welcome back! Here's what's happening.
            {loading && (
              <span style={{ marginLeft: 10, fontSize: 12, color: 'var(--accent)', verticalAlign: 'middle' }}>
                ↻ Refreshing…
              </span>
            )}
          </p>
        </div>
        <div className="flex-center gap-2">
          <button
            className="btn btn-outline btn-sm"
            onClick={fetchDashboard}
            disabled={loading}
            title="Refresh dashboard"
          >
            ↻ Refresh
          </button>
          <Link to="/invoices/new" className="btn btn-primary">+ New Invoice</Link>
        </div>
      </div>

      {/* ── STAT CARDS ── */}
      <div className="stat-grid">
        {stats.map((s) => (
          <div key={s.label} className={`stat-card ${s.color}`}>
            <div className="stat-icon">{s.icon}</div>
            <div className="stat-label">{s.label}</div>
            <div className="stat-value">{s.value}</div>
            <div className="stat-sub">{s.sub}</div>
          </div>
        ))}
      </div>

      {/* ── GRID ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24, marginBottom: 24 }}>
        {/* Revenue Chart */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">Monthly Revenue</div>
            <span style={{ fontSize: 12, color: 'var(--txt-muted)' }}>{new Date().getFullYear()}</span>
          </div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--txt-muted)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--txt-muted)' }} axisLine={false} tickLine={false}
                  tickFormatter={v => `$${v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}`} />
                <Tooltip
                  contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 13 }}
                  formatter={v => [fmtCurrency(v), 'Revenue']}
                />
                <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2} fill="url(#rev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Breakdown */}
        <div className="card">
          <div className="card-header"><div className="card-title">Invoice Status</div></div>
          <div className="card-body">
            {[
              { key: 'paid',      label: 'Paid',      icon: '✅', color: 'var(--success)' },
              { key: 'sent',      label: 'Sent',      icon: '📤', color: 'var(--info)' },
              { key: 'draft',     label: 'Draft',     icon: '✏️', color: 'var(--txt-muted)' },
              { key: 'overdue',   label: 'Overdue',   icon: '⚠️', color: 'var(--danger)' },
              { key: 'cancelled', label: 'Cancelled', icon: '✖',  color: 'var(--txt-muted)' },
            ].map(({ key, label, icon, color }) => {
              const count = summary[key] || 0;
              const pct   = summary.totalInvoices > 0 ? ((count / summary.totalInvoices) * 100).toFixed(0) : 0;
              return (
                <div key={key} style={{ marginBottom: 16 }}>
                  <div className="flex-center gap-2" style={{ marginBottom: 6 }}>
                    <span>{icon}</span>
                    <span style={{ fontSize: 13, color: 'var(--txt-secondary)' }}>{label}</span>
                    <span className="ml-auto" style={{ fontSize: 13, fontWeight: 600 }}>{count}</span>
                    <span style={{ fontSize: 12, color: 'var(--txt-muted)', width: 32 }}>{pct}%</span>
                  </div>
                  <div style={{ height: 6, background: 'var(--border)', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 4, transition: 'width .6s ease' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── RECENT INVOICES ── */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">Recent Invoices</div>
          <Link to="/invoices" className="btn btn-ghost btn-sm">View all →</Link>
        </div>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Invoice</th><th>Client</th><th>Date</th><th>Amount</th><th>Status</th><th>Action</th>
              </tr>
            </thead>
            <tbody>
              {recentInvoices.length === 0 ? (
                <tr><td colSpan={6} className="text-center text-muted" style={{ padding: 32 }}>No invoices yet</td></tr>
              ) : recentInvoices.map(inv => (
                <tr key={inv._id}>
                  <td className="td-primary mono">{inv.invoiceNumber}</td>
                  <td>
                    <div style={{ fontWeight: 500, color: 'var(--txt-primary)' }}>{inv.client?.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--txt-muted)' }}>{inv.client?.company}</div>
                  </td>
                  <td>{new Date(inv.invoiceDate).toLocaleDateString()}</td>
                  <td className="td-primary fw-bold mono">{fmtCurrency(inv.total, inv.currency)}</td>
                  <td>{statusBadge(inv.status)}</td>
                  <td>
                    <Link to={`/invoices/${inv._id}`} className="btn btn-ghost btn-sm">View</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}