import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [form, setForm]   = useState({ ...user, password: '', confirmPassword: '' });
  const [saving, setSaving] = useState(false);
  const [tab, setTab]     = useState('profile');

  const setF = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async (e) => {
    e.preventDefault();
    if (form.password && form.password !== form.confirmPassword) {
      return toast.error('Passwords do not match');
    }
    setSaving(true);
    try {
      const payload = { ...form };
      if (!form.password) delete payload.password;
      delete payload.confirmPassword;
      const { data } = await api.put('/auth/profile', payload);
      updateUser(data.user);
      toast.success('Profile updated!');
      setForm(f => ({ ...f, password: '', confirmPassword: '' }));
    } catch (err) { toast.error(err); }
    finally { setSaving(false); }
  };

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Profile & Settings</h1>
          <p className="page-subtitle">Manage your account and business details</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {['profile', 'business', 'security'].map(t => (
          <button key={t} className={`btn btn-sm ${tab === t ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setTab(t)} style={{ textTransform: 'capitalize' }}>
            {t}
          </button>
        ))}
      </div>

      <div style={{ maxWidth: 640 }}>
        <form onSubmit={handleSave}>
          <div className="card">
            <div className="card-header"><div className="card-title">
              {tab === 'profile' ? 'Personal Info' : tab === 'business' ? 'Business Details' : 'Security'}
            </div></div>
            <div className="card-body">

              {tab === 'profile' && (<>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Full Name *</label>
                    <input className="form-input" required value={form.name || ''} onChange={e => setF('name', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email *</label>
                    <input type="email" className="form-input" required value={form.email || ''} onChange={e => setF('email', e.target.value)} />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Phone</label>
                    <input className="form-input" value={form.phone || ''} onChange={e => setF('phone', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Default Currency</label>
                    <select className="form-select" value={form.currency || 'USD'} onChange={e => setF('currency', e.target.value)}>
                      {['USD','EUR','GBP','INR','CAD','AUD','JPY'].map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
              </>)}

              {tab === 'business' && (<>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Business Name</label>
                    <input className="form-input" value={form.businessName || ''} onChange={e => setF('businessName', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Tax ID / GST / VAT</label>
                    <input className="form-input" value={form.taxId || ''} onChange={e => setF('taxId', e.target.value)} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Business Address</label>
                  <textarea className="form-textarea" rows={3} value={form.address || ''} onChange={e => setF('address', e.target.value)} />
                </div>
              </>)}

              {tab === 'security' && (<>
                <div className="form-group">
                  <label className="form-label">New Password (leave blank to keep current)</label>
                  <input type="password" className="form-input" minLength={6}
                    value={form.password} onChange={e => setF('password', e.target.value)} />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Confirm New Password</label>
                  <input type="password" className="form-input"
                    value={form.confirmPassword} onChange={e => setF('confirmPassword', e.target.value)} />
                </div>
              </>)}
            </div>
            <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border)' }}>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Saving…' : '💾 Save Changes'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </>
  );
}