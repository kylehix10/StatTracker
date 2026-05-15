import { useState } from 'react';
import { Button, Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { createUser, loginUser } from '../api';

function Login() {
  const navigate = useNavigate();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const isCreatingAccount = mode === 'create';

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm(current => ({ ...current, [name]: value }));
  };

  const handleModeChange = (nextMode) => {
    setMode(nextMode);
    setError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!form.email || !form.password) {
      setError('Email and password are required');
      return;
    }

    if (isCreatingAccount && (!form.firstName || !form.lastName)) {
      setError('First name and last name are required');
      return;
    }

    try {
      setLoading(true);
      const response = isCreatingAccount
        ? await createUser(form)
        : await loginUser({ email: form.email, password: form.password });

      localStorage.setItem('statTrackerUser', JSON.stringify(response.data));
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to continue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-page">
      <section className="login-panel">
        <div className="login-heading">
          <h1>StatTracker</h1>
          <p>{isCreatingAccount ? 'Create an account' : 'Log in to continue'}</p>
        </div>

        <div className="login-toggle" aria-label="Login mode">
          <Button
            type="button"
            variant={mode === 'login' ? 'primary' : 'outline-primary'}
            onClick={() => handleModeChange('login')}
          >
            Login
          </Button>
          <Button
            type="button"
            variant={mode === 'create' ? 'primary' : 'outline-primary'}
            onClick={() => handleModeChange('create')}
          >
            Create Account
          </Button>
        </div>

        <Form onSubmit={handleSubmit}>
          {isCreatingAccount && (
            <div className="login-name-row">
              <Form.Group className="mb-3" controlId="first-name">
                <Form.Label>First Name</Form.Label>
                <Form.Control
                  name="firstName"
                  onChange={handleChange}
                  required={isCreatingAccount}
                  type="text"
                  value={form.firstName}
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="last-name">
                <Form.Label>Last Name</Form.Label>
                <Form.Control
                  name="lastName"
                  onChange={handleChange}
                  required={isCreatingAccount}
                  type="text"
                  value={form.lastName}
                />
              </Form.Group>
            </div>
          )}

          <Form.Group className="mb-3" controlId="login-email">
            <Form.Label>Email</Form.Label>
            <Form.Control
              autoComplete="email"
              name="email"
              onChange={handleChange}
              required
              type="email"
              value={form.email}
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="login-password">
            <Form.Label>Password</Form.Label>
            <Form.Control
              autoComplete={isCreatingAccount ? 'new-password' : 'current-password'}
              name="password"
              onChange={handleChange}
              required
              type="password"
              value={form.password}
            />
          </Form.Group>

          {error && <p className="text-danger">{error}</p>}

          <Button className="login-submit" disabled={loading} type="submit">
            {loading ? 'Working...' : isCreatingAccount ? 'Create Account' : 'Login'}
          </Button>
        </Form>
      </section>
    </main>
  );
}

export default Login;
