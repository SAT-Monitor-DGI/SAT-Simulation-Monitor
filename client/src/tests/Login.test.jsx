import { render, screen } from '@testing-library/react';
import Login from '../pages/Login';
import { AuthProvider } from '../context/AuthContext';
test('renders login form', () => {
  render(
    <AuthProvider>
      <Login />
    </AuthProvider>,
  );
  expect(screen.getByText('Mission Control')).toBeInTheDocument();
  expect(screen.getByPlaceholderText('Username')).toBeInTheDocument();
  expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
});
