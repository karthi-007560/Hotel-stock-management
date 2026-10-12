import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import Layout from './components/Layout/Layout';

import Login from './pages/Login/Login';
import Signup from './pages/Signup/Signup';

import Dashboard from './pages/Dashboard/Dashboard';
import Inventory from './pages/Inventory/Inventory';
import Purchases from './pages/Purchases/Purchases';
import Usage from './pages/Usage/Usage';
import Wastage from './pages/Wastage/Wastage';
import Suppliers from './pages/Suppliers/Suppliers';
import Reports from './pages/Reports/Reports';
import DailyClosing from './pages/DailyClosing/DailyClosing';
import Users from './pages/Users/Users';
import Settings from './pages/Settings/Settings';

const getCurrentUser = () => {
  try {
    return JSON.parse(
      localStorage.getItem('hotel_current_user') || 'null'
    );
  } catch {
    return null;
  }
};

function Protected({ children, roles }) {
  const loggedIn =
    localStorage.getItem('hotel_logged_in') === 'true';

  const user = getCurrentUser();

  if (!loggedIn || !user || !user.role) {
    return <Navigate to="/login" replace />;
  }

  const role = String(user.role).toLowerCase();

  if (roles && !roles.includes(role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

function PublicOnly({ children }) {
  const loggedIn =
    localStorage.getItem('hotel_logged_in') === 'true';

  const user = getCurrentUser();

  return loggedIn && user?.role
    ? <Navigate to="/dashboard" replace />
    : children;
}

export default function App() {
  const ok =
    localStorage.getItem('hotel_logged_in') === 'true';

  const user = getCurrentUser();

  const validSession = ok && Boolean(user?.role);

  return (
    <Routes>
      {/* Public pages */}
      <Route
        path="/login"
        element={
          <PublicOnly>
            <Login />
          </PublicOnly>
        }
      />

      <Route
        path="/signup"
        element={
          <PublicOnly>
            <Signup />
          </PublicOnly>
        }
      />

      {/* Protected application */}
      <Route
        path="/"
        element={
          <Protected>
            <Layout />
          </Protected>
        }
      >
        <Route
          index
          element={<Navigate to="/dashboard" replace />}
        />

        {/* All roles */}
        <Route
          path="dashboard"
          element={
            <Protected roles={['admin', 'manager', 'storekeeper']}>
              <Dashboard />
            </Protected>
          }
        />

        <Route
          path="inventory"
          element={
            <Protected roles={['admin', 'manager', 'storekeeper']}>
              <Inventory />
            </Protected>
          }
        />

        <Route
          path="purchases"
          element={
            <Protected roles={['admin', 'manager', 'storekeeper']}>
              <Purchases />
            </Protected>
          }
        />

        <Route
          path="usage"
          element={
            <Protected roles={['admin', 'manager', 'storekeeper']}>
              <Usage />
            </Protected>
          }
        />

        <Route
          path="wastage"
          element={
            <Protected roles={['admin', 'manager', 'storekeeper']}>
              <Wastage />
            </Protected>
          }
        />

        {/* Admin and Manager */}
        <Route
          path="suppliers"
          element={
            <Protected roles={['admin', 'manager', 'storekeeper']}>
              <Suppliers />
            </Protected>
          }
        />

        <Route
          path="reports"
          element={
            <Protected roles={['admin', 'manager']}>
              <Reports />
            </Protected>
          }
        />

        {/* Admin only */}
        <Route
          path="daily-closing"
          element={
            <Protected roles={['admin']}>
              <DailyClosing />
            </Protected>
          }
        />

        <Route
          path="users"
          element={
            <Protected roles={['admin']}>
              <Users />
            </Protected>
          }
        />

        <Route
          path="settings"
          element={
            <Protected roles={['admin']}>
              <Settings />
            </Protected>
          }
        />
      </Route>

      {/* Unknown URLs */}
      <Route
        path="*"
        element={
          <Navigate
            to={validSession ? '/dashboard' : '/login'}
            replace
          />
        }
      />
    </Routes>
  );
}
