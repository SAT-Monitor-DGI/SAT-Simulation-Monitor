import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
export default function Login() {
  const [u, setU] = useState('');
  const [p, setP] = useState('');
  const [error, setError] = useState('');
  const [registering, setRegistering] = useState(false);
  const { login, register } = useAuth();
  return (
    <main className="center">
      <form
        className="panel login"
        onSubmit={async (e) => {
          e.preventDefault();
          setError('');
          try {
            if (registering) await register(u, p);
            await login(u, p);
          } catch (x) {
            setError(
              x.response?.data?.message ||
                (x.request
                  ? 'Unable to reach the server. Make sure the backend is running.'
                  : x.message || 'Login failed'),
            );
          }
        }}
      >
        <h1>Mission Control</h1>
        <p>Satellite Management System</p>
        <input placeholder="Username" required value={u} onChange={(e) => setU(e.target.value)} />
        <input
          placeholder="Password"
          type="password"
          minLength={6}
          required
          value={p}
          onChange={(e) => setP(e.target.value)}
        />
        <button>{registering ? 'Create admin' : 'Sign in'}</button>
        {error && <div className="alert">{error}</div>}
        <small>
          {registering
            ? 'This works only while no users exist.'
            : 'Use your admin credentials to access mission control.'}
        </small>
        <button
          type="button"
          className="ghost"
          onClick={() => {
            setRegistering(!registering);
            setError('');
          }}
        >
          {registering ? 'Back to sign in' : 'Create first admin'}
        </button>
      </form>
    </main>
  );
}
