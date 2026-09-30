import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import './styles.css';
function Inner() {
  const { user } = useAuth();
  return user ? <Dashboard /> : <Login />;
}
export default function App() {
  return (
    <AuthProvider>
      <Inner />
    </AuthProvider>
  );
}
