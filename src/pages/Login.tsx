import { useState } from 'react';
import { useMusicMatch } from '../context/MusicMatchContext';

export function Login() {
  const { login, register, isLoading } = useMusicMatch();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setError('');
    if (!email.trim() || !password.trim()) { setError('Email and password are required'); return; }
    if (mode === 'register' && !name.trim()) { setError('Name is required'); return; }
    if (mode === 'register' && password.length < 8) { setError('Password must be at least 8 characters'); return; }
    if (mode === 'register' && !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      setError('Password must contain uppercase, lowercase, and a number'); return;
    }
    try {
      if (mode === 'login') await login(email, password);
      else await register(name, email, password);
    } catch (e: any) {
      setError(e?.message || 'Something went wrong');
    }
  };

  const onKey = (e: React.KeyboardEvent) => { if (e.key === 'Enter') handleSubmit(); };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--background)', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{ fontSize: '38px', fontWeight: '800', marginBottom: '8px' }} className="gradient-text">🎵 MusicMatch</h1>
          <p style={{ color: 'var(--muted-foreground)' }}>Discover music through shared taste</p>
        </div>

        <div className="card" style={{ padding: '32px' }}>
          {/* Toggle */}
          <div style={{ display: 'flex', backgroundColor: 'var(--muted)', borderRadius: '8px', padding: '4px', marginBottom: '24px' }}>
            {(['login', 'register'] as const).map(m => (
              <button key={m} onClick={() => { setMode(m); setError(''); }}
                style={{
                  flex: 1, padding: '8px', borderRadius: '6px', border: 'none', fontWeight: '600', fontSize: '14px',
                  backgroundColor: mode === m ? 'var(--primary)' : 'transparent',
                  color: mode === m ? 'white' : 'var(--muted-foreground)', cursor: 'pointer', transition: 'all 0.2s',
                }}
              >{m === 'login' ? 'Sign In' : 'Register'}</button>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {mode === 'register' && (
              <div>
                <label className="input-label">Full Name</label>
                <input className="input" type="text" value={name} onChange={e => setName(e.target.value)} onKeyDown={onKey} placeholder="Alice Ramirez" />
              </div>
            )}
            <div>
              <label className="input-label">Email</label>
              <input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={onKey} placeholder="alice@example.com" />
            </div>
            <div>
              <label className="input-label">Password</label>
              <input className="input" type="password" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={onKey} placeholder="••••••••" />
              {mode === 'register' && <p style={{ fontSize: '12px', color: 'var(--muted-foreground)', marginTop: '4px' }}>Min 8 chars with uppercase, lowercase & number</p>}
            </div>
          </div>

          {error && <div className="alert alert-error" style={{ marginTop: '16px' }}>{error}</div>}

          <button onClick={handleSubmit} disabled={isLoading} className="btn btn-primary" style={{ width: '100%', marginTop: '24px', padding: '12px', justifyContent: 'center', fontSize: '16px' }}>
            {isLoading ? <><span className="spinner" style={{ width: '18px', height: '18px', borderWidth: '2px' }} /> Loading…</> : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </div>
      </div>
    </div>
  );
}
