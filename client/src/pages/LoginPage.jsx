// LoginPage.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export function LoginPage() {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const [form, setForm]   = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Welcome back!');
      navigate('/');
    } catch (err) { toast.error(err); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🧾</div>
          <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: -1 }}>InvoiceApp</h1>
          <p style={{ color: 'var(--txt-muted)', marginTop: 4 }}>Sign in to your account</p>
        </div>

        <div className="card">
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input type="email" className="form-input" required
                  value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Password</label>
                <input type="password" className="form-input" required
                  value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 8 }} disabled={loading}>
                {loading ? 'Signing in…' : 'Sign In'}
              </button>
            </form>
            <p style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: 'var(--txt-muted)' }}>
              Don't have an account? <Link to="/register" style={{ color: 'var(--accent)' }}>Create one</Link>
            </p>
          </div>
        </div>

       
      </div>
    </div>
  );
}

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', businessName: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(form);
      toast.success('Account created!');
      navigate('/');
    } catch (err) { toast.error(err); }
    finally { setLoading(false); }
  };

  const setF = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🧾</div>
          <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: -1 }}>Get Started</h1>
          <p style={{ color: 'var(--txt-muted)', marginTop: 4 }}>Create your free account</p>
        </div>

        <div className="card">
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input className="form-input" required value={form.name} onChange={e => setF('name', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Business Name</label>
                  <input className="form-input" value={form.businessName} onChange={e => setF('businessName', e.target.value)} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Email *</label>
                <input type="email" className="form-input" required value={form.email} onChange={e => setF('email', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Password *</label>
                <input type="password" className="form-input" required minLength={6}
                  value={form.password} onChange={e => setF('password', e.target.value)} />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
                {loading ? 'Creating account…' : 'Create Account'}
              </button>
            </form>
            <p style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: 'var(--txt-muted)' }}>
              Already have an account? <Link to="/login" style={{ color: 'var(--accent)' }}>Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
