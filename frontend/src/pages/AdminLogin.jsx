import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminLogin } from '../api';

export default function AdminLogin() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      const { token } = await adminLogin(password);
      localStorage.setItem('bloombears_admin_token', token);
      navigate('/admin/dashboard');
    } catch {
      setError('Wrong password.');
    }
  }

  return (
    <div className="container" style={{ maxWidth: 360, paddingTop: 60 }}>
      <h1>Admin Login</h1>
      <form className="checkout-form" onSubmit={handleSubmit}>
        <input
          type="password"
          placeholder="Admin password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        {error && <p style={{ color: 'crimson' }}>{error}</p>}
        <button className="btn" type="submit">Log in</button>
      </form>
    </div>
  );
}
