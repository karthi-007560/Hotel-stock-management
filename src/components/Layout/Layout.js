import React from 'react';
import {
  NavLink,
  Outlet,
  useNavigate
} from 'react-router-dom';

import {
  Home,
  Boxes,
  ShoppingCart,
  ClipboardList,
  Trash2,
  Factory,
  BarChart3,
  CalendarCheck,
  Users,
  Settings,
  LogOut,
  PackagePlus,
  Menu,
  X,
  Sparkles
} from 'lucide-react';

import './Layout.css';

const nav = [
  {
    to: '/dashboard',
    label: 'Dashboard',
    icon: Home,
    roles: ['admin', 'manager', 'storekeeper']
  },
  {
    to: '/inventory',
    label: 'Inventory',
    icon: Boxes,
    roles: ['admin', 'manager', 'storekeeper']
  },
  {
    to: '/purchases',
    label: 'Purchases',
    icon: ShoppingCart,
    roles: ['admin', 'manager', 'storekeeper']
  },
  {
    to: '/usage',
    label: 'Usage',
    icon: ClipboardList,
    roles: ['admin', 'manager', 'storekeeper']
  },
  {
    to: '/wastage',
    label: 'Wastage',
    icon: Trash2,
    roles: ['admin', 'manager', 'storekeeper']
  },
  {
    to: '/suppliers',
    label: 'Suppliers',
    icon: Factory,
    roles: ['admin', 'manager', 'storekeeper']
  },
  {
    to: '/reports',
    label: 'Reports',
    icon: BarChart3,
    roles: ['admin', 'manager']
  },
  {
    to: '/daily-closing',
    label: 'Daily Closing',
    icon: CalendarCheck,
    roles: ['admin']
  },
  {
    to: '/users',
    label: 'Users',
    icon: Users,
    roles: ['admin']
  },
  {
    to: '/settings',
    label: 'Settings',
    icon: Settings,
    roles: ['admin']
  }
];

export default function Layout() {
  const [open, setOpen] = React.useState(false);
  const go = useNavigate();

  const user = React.useMemo(() => {
    try {
      return JSON.parse(
        localStorage.getItem('hotel_current_user') || 'null'
      );
    } catch {
      return null;
    }
  }, []);

  const role = String(user?.role || '').toLowerCase();

  const email = user?.email || '';
  const name = user?.name || email || 'User';

  const userInitial = name
    ? name.charAt(0).toUpperCase()
    : 'U';

  const roleLabel = {
    admin: 'Admin',
    manager: 'Manager',
    storekeeper: 'Storekeeper'
  }[role] || 'User';

  const visibleNav = nav.filter(item =>
    item.roles.includes(role)
  );

  const logout = () => {
    localStorage.removeItem('hotel_logged_in');
    localStorage.removeItem('hotel_current_user');
    localStorage.removeItem('hotel_role');

    go('/login', { replace: true });
  };

  return (
    <div className="shell">

      {/* 3D BACKGROUND */}
      <div className="scene3d">
        <div className="cube cube1">
          <span></span>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
        </div>

        <div className="cube cube2">
          <span></span>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
        </div>

        <div className="orb3d orbOne"></div>
        <div className="orb3d orbTwo"></div>
        <div className="orb3d orbThree"></div>
      </div>

      {/* SIDEBAR */}
      <aside className={'side ' + (open ? 'open' : '')}>
        <div className="brand">
          <i className="brandIcon">
            <PackagePlus size={20} />
          </i>

          <div>
            <b>HotelStock</b>
            <small>Store Management</small>
          </div>

          <button
            type="button"
            className="close"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
          >
            <X />
          </button>
        </div>

        <p className="cap">WORKSPACE</p>

        <nav>
          {visibleNav.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                'nav ' + (isActive ? 'active' : '')
              }
            >
              <Icon size={17} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sideBottom">
          <div className="tip">
            <div className="tipIcon">
              <Sparkles size={15} />
            </div>

            <div>
              <b>Daily control</b>
              <span>Keep stock accurate</span>
            </div>
          </div>

          <button
            type="button"
            className="logout"
            onClick={logout}
          >
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <section className="main">
        <header>
          <button
            type="button"
            className="menu"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
          >
            <Menu />
          </button>

          <div className="headerTitle">
            <small>Operations · {roleLabel}</small>
            <b>Hotel Store</b>
          </div>

          <div className="right">
            <span>
              {new Date().toLocaleDateString('en-IN', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
              })}
            </span>

            <div className="userInfo">
              <i title={name}>{userInitial}</i>
              <div className="userText">
                <b>{name}</b>
                <small>{roleLabel}</small>
              </div>
            </div>
          </div>
        </header>

        <main>
          <Outlet />
        </main>
      </section>
    </div>
  );
}
