import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { userLogin, userRegister } from '../api';

export default function Login() {
  const [activeTab, setActiveTab] = useState('login'); // 'login' or 'register'
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    // Field checks
    if (!form.email || !form.password) {
      setError('Please fill in all required fields.');
      return;
    }

    if (activeTab === 'register') {
      if (!form.name) {
        setError('Please enter your full name.');
        return;
      }
      if (form.password !== form.confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
      if (form.password.length < 6) {
        setError('Password must be at least 6 characters.');
        return;
      }
    }

    setLoading(true);
    try {
      if (activeTab === 'login') {
        const { token, user } = await userLogin(form.email, form.password);
        localStorage.setItem('bloombears_user_token', token);
        localStorage.setItem('bloombears_user_name', user.name);
        localStorage.setItem('bloombears_user_email', user.email);
        navigate('/profile');
      } else {
        const { token, user } = await userRegister(form.name, form.email, form.password);
        localStorage.setItem('bloombears_user_token', token);
        localStorage.setItem('bloombears_user_name', user.name);
        localStorage.setItem('bloombears_user_email', user.email);
        navigate('/profile');
      }
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container" style={{ minHeight: '75vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
      <div className="auth-card" style={{ width: '100%', maxWidth: '420px', backgroundColor: '#fff', borderRadius: 'var(--radius)', border: '1px solid var(--line)', padding: '32px', boxShadow: 'var(--shadow-md)' }}>
        
        {/* Tab Headers */}
        <div className="auth-tabs" style={{ display: 'flex', borderBottom: '1px solid var(--line)', marginBottom: '24px' }}>
          <button 
            type="button"
            className={activeTab === 'login' ? 'auth-tab active' : 'auth-tab'}
            onClick={() => { setActiveTab('login'); setError(''); }}
            style={{ flex: 1, padding: '12px', background: 'none', border: 'none', borderBottom: activeTab === 'login' ? '2px solid var(--pink-dark)' : '2px solid transparent', fontFamily: 'var(--font-heading)', fontSize: '1.15rem', color: activeTab === 'login' ? 'var(--pink-dark)' : 'var(--muted)', fontWeight: 600, cursor: 'pointer', transition: 'var(--transition)' }}
          >
            Log In
          </button>
          <button 
            type="button"
            className={activeTab === 'register' ? 'auth-tab active' : 'auth-tab'}
            onClick={() => { setActiveTab('register'); setError(''); }}
            style={{ flex: 1, padding: '12px', background: 'none', border: 'none', borderBottom: activeTab === 'register' ? '2px solid var(--pink-dark)' : '2px solid transparent', fontFamily: 'var(--font-heading)', fontSize: '1.15rem', color: activeTab === 'register' ? 'var(--pink-dark)' : 'var(--muted)', fontWeight: 600, cursor: 'pointer', transition: 'var(--transition)' }}
          >
            Sign Up
          </button>
        </div>

        <h2 style={{ fontSize: '1.5rem', marginBottom: '8px', color: 'var(--pink-dark)', fontFamily: 'var(--font-heading)', textAlign: 'center' }}>
          {activeTab === 'login' ? 'Welcome Back!' : 'Create Account'}
        </h2>
        <p style={{ fontSize: '0.88rem', color: 'var(--muted)', textAlign: 'center', marginBottom: '24px' }}>
          {activeTab === 'login' ? 'Log in to view your orders and track delivery' : 'Join BloomBears to track your soft plush friends'}
        </p>

        <form className="checkout-form" onSubmit={handleSubmit} style={{ gap: '16px' }}>
          {activeTab === 'register' && (
            <div className="form-group">
              <label>Full Name</label>
              <input 
                name="name" 
                placeholder="E.g. Jane Doe" 
                value={form.name} 
                onChange={handleChange} 
                required 
              />
            </div>
          )}

          <div className="form-group">
            <label>Email Address</label>
            <input 
              name="email" 
              type="email" 
              placeholder="jane@example.com" 
              value={form.email} 
              onChange={handleChange} 
              required 
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input 
              name="password" 
              type="password" 
              placeholder="••••••••" 
              value={form.password} 
              onChange={handleChange} 
              required 
            />
          </div>

          {activeTab === 'register' && (
            <div className="form-group">
              <label>Confirm Password</label>
              <input 
                name="confirmPassword" 
                type="password" 
                placeholder="••••••••" 
                value={form.confirmPassword} 
                onChange={handleChange} 
                required 
              />
            </div>
          )}

          {error && <p style={{ color: 'crimson', fontSize: '0.88rem', fontWeight: 600, marginTop: 4, textAlign: 'center' }}>{error}</p>}

          <button 
            className="btn" 
            type="submit" 
            disabled={loading} 
            style={{ width: '100%', padding: '12px', marginTop: '12px', borderRadius: '30px' }}
          >
            {loading ? 'Please wait...' : activeTab === 'login' ? 'Log In' : 'Sign Up'}
          </button>
        </form>
      </div>
    </div>
  );
}
