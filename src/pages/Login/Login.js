
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PackagePlus, ArrowRight } from 'lucide-react';
import './Login.css';

const API_URL = 'http://localhost:5000';

const ROLE_DASHBOARDS = {
  admin: '/dashboard',
  manager: '/dashboard',
  storekeeper: '/dashboard'
};

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setError('');

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !password) {
      setError('Please enter your email and password.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        body: JSON.stringify({
          email: cleanEmail,
          password
        })
      });

      const responseText = await response.text();
      let result = {};

      try {
        result = responseText ? JSON.parse(responseText) : {};
      } catch {
        throw new Error('The server returned an invalid response.');
      }

      if (!response.ok) {
        throw new Error(
          result.message || `Login failed (${response.status}).`
        );
      }

      if (!result.token || !result.user) {
        throw new Error('Login response is missing user or token.');
      }

      const role = String(result.user.role || '').toLowerCase();

      if (!Object.prototype.hasOwnProperty.call(ROLE_DASHBOARDS, role)) {
        throw new Error(
          'Your account role is invalid. Contact the administrator.'
        );
      }

      // Clear the previous session before saving the new account.
      localStorage.removeItem('hotel_token');
      localStorage.removeItem('hotel_current_user');
      localStorage.removeItem('hotel_logged_in');
      localStorage.removeItem('hotel_role');

      localStorage.setItem('hotel_token', result.token);
      localStorage.setItem(
        'hotel_current_user',
        JSON.stringify({
          id: result.user.id,
          name: result.user.name,
          email: result.user.email,
          role
        })
      );
      localStorage.setItem('hotel_logged_in', 'true');
      localStorage.setItem('hotel_role', role);

      navigate(ROLE_DASHBOARDS[role], { replace: true });
    } catch (err) {
      console.error('Login error:', err);

      setError(
        err.message === 'Failed to fetch'
          ? 'Cannot connect to backend. Check port 5000.'
          : err.message || 'Login failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login">
      <div className="orb a" />
      <div className="orb b" />

      <form className="loginCard float" onSubmit={submit}>
        <div className="loginBrand">
          <i><PackagePlus /></i>
          <div>
            <b>HotelStock</b>
            <small>Store Management</small>
          </div>
        </div>

        <span className="welcome">WELCOME BACK</span>

        <h1>
          Control your stock.
          <br />
          <em>Run smarter.</em>
        </h1>

        <p>
          Track purchases, usage and inventory
          from one clean workspace.
        </p>

        <label htmlFor="login-email">
          Email
          <input
            id="login-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Enter your email"
            autoComplete="username"
            required
          />
        </label>

        <label htmlFor="login-password">
          Password
          <input
            id="login-password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Enter your password"
            autoComplete="current-password"
            required
          />
        </label>

        {error && (
          <div className="loginError" role="alert">
            {error}
          </div>
        )}

        <button type="submit" disabled={loading}>
          {loading ? 'Signing in...' : 'Sign in'}
          {!loading && <ArrowRight size={16} />}
        </button>

        <div className="signupLink">
          <span>Don't have an account?</span>
          <button
            type="button"
            onClick={() => navigate('/signup')}
          >
            Create account
          </button>
        </div>
      </form>
    </div>
  );
}
