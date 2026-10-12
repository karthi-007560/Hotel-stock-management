import React from 'react';
import { ShieldCheck, UserCircle } from 'lucide-react';
import {
  Header,
  Panel
} from '../../components/UI/UI';

export default function Users() {
  const [user, setUser] = React.useState(null);

  React.useEffect(() => {
    const loadUser = () => {
      try {
        const current = JSON.parse(
          localStorage.getItem('hotel_current_user') || 'null'
        );

        const loggedIn =
          localStorage.getItem('hotel_logged_in') === 'true';

        setUser(loggedIn ? current : null);
      } catch {
        setUser(null);
      }
    };

    loadUser();

    window.addEventListener('hotel_data_updated', loadUser);
    window.addEventListener('storage', loadUser);

    return () => {
      window.removeEventListener('hotel_data_updated', loadUser);
      window.removeEventListener('storage', loadUser);
    };
  }, []);

  const roleLabel = {
    admin: 'Admin',
    manager: 'Manager',
    storekeeper: 'Storekeeper'
  };

  return (
    <div className="page">
      <Header
        eyebrow="Account"
        title="My Account"
        subtitle="View the details of the currently logged-in account."
      />

      <Panel title="Logged-in User">
        {!user ? (
          <div className="empty">
            No logged-in account found. Please sign in again.
          </div>
        ) : (
          <div className="tableWrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                <tr>
                  <td className="item">
                    <UserCircle size={16} />
                    {user.name || user.email}
                  </td>

                  <td>{user.email}</td>

                  <td>
                    <span className="badge blueB">
                      {roleLabel[user.role] || user.role || 'User'}
                    </span>
                  </td>

                  <td>
                    <span className="badge greenB">
                      <ShieldCheck size={12} />
                      Active
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </div>
  );
}
