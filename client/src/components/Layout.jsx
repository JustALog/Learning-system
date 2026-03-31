import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

export default function Layout({ role, user, onLogout }) {
  return (
    <div className="app-layout">
      <Sidebar role={role} />
      <div className="main-content">
        <Header user={user} onLogout={onLogout} />
        <div className="page-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
