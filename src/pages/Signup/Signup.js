
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PackagePlus, ArrowRight, ShieldCheck } from 'lucide-react';
import './Signup.css';

const API_URL = 'http://localhost:5000';

const roles = [
  {
    value: 'storekeeper',
    label: 'Shopkeeper',
    description: 'Daily stock, purchases, usage and wastage'
  },
  {
    value: 'manager',
    label: 'Manager',
    description: 'Inventory, suppliers, reports and daily closing'
  },
  {
    value: 'admin',
    label: 'Admin',
    description: 'Full system access and user management'
  }
];

export default function Signup() {
  const go = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('storekeeper');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanName || !cleanEmail) {
      setError('Please enter your name and email.');
      return;
    }

    if (password.length < 8) {
      setError('Password must contain at least 8 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    // Public signup cannot create privileged accounts.
    if (role !== 'storekeeper') {
      setError(
        `${roles.find((item) => item.value === role)?.label} accounts must be created or approved by an Admin. Please select Shopkeeper or contact your Admin.`
      );
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        body: JSON.stringify({
          name: cleanName,
          email: cleanEmail,
          password,
          role
        })
      });

      const responseText = await response.text();
      let result = {};

      if (responseText) {
        try {
          result = JSON.parse(responseText);
        } catch {
          throw new Error(
            'Invalid server response. Check the backend terminal.'
          );
        }
      }

      if (!response.ok) {
        throw new Error(
          result.message || `Signup failed (HTTP ${response.status}).`
        );
      }

      alert('Shopkeeper account created successfully! Please login.');
      go('/login', { replace: true });
    } catch (err) {
      console.error('Signup error:', err);

      setError(
        err.message === 'Failed to fetch'
          ? 'Cannot connect to backend. Check that the server is running on port 5000.'
          : err.message || 'Account creation failed.'
      );
    } finally {
      setLoading(false);
    }
  };

  const selectedRole = roles.find((item) => item.value === role);

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

        <span className="welcome">CREATE ACCOUNT</span>

        <h1>
          Start managing.
          <br />
          <em>Stay organized.</em>
        </h1>

        <p>Create your HotelStock account and choose your role.</p>

        <label>
          Full Name
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
            autoComplete="name"
            required
          />
        </label>

        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            autoComplete="email"
            required
          />
        </label>

        <label>
          Select Role
          <select
            value={role}
            onChange={(e) => {
              setRole(e.target.value);
              setError('');
            }}
            required
          >
            {roles.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </label>

        <div className="roleInfo">
          <ShieldCheck size={18} />
          <div>
            <strong>{selectedRole?.label}</strong>
            <p>{selectedRole?.description}</p>
            {role !== 'storekeeper' && (
              <small>
                Admin authorization is required to create this account.
              </small>
            )}
          </div>
        </div>

        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Minimum 8 characters"
            autoComplete="new-password"
            minLength={8}
            required
          />
        </label>

        <label>
          Confirm Password
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm your password"
            autoComplete="new-password"
            minLength={8}
            required
          />
        </label>

        {error && (
          <div className="loginError" role="alert">
            {error}
          </div>
        )}

        <button type="submit" disabled={loading}>
          {loading ? 'Creating account...' : 'Create Account'}
          {!loading && <ArrowRight size={16} />}
        </button>

        <div className="signupLink">
          <span>Already have an account?</span>
          <button type="button" onClick={() => go('/login')}>
            Sign in
          </button>
        </div>
      </form>
    </div>
  );
}
