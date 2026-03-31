import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

export default function Header({ user, onLogout }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const ref = useRef(null);
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isStudent = user.role === 'student';

  return (
    <header className="header">
      <button
        className="theme-toggle"
        onClick={toggleTheme}
        aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
        title={theme === 'light' ? 'Dark mode' : 'Light mode'}
        id="theme-toggle-btn"
      >
        {theme === 'light' ? (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="5" />
            <line x1="12" y1="1" x2="12" y2="3" />
            <line x1="12" y1="21" x2="12" y2="23" />
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
            <line x1="1" y1="12" x2="3" y2="12" />
            <line x1="21" y1="12" x2="23" y2="12" />
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
          </svg>
        )}
      </button>

      <div className="header-user" ref={ref} onClick={() => setDropdownOpen(!dropdownOpen)}>
        <div className="header-user-info">
          <div className="header-user-name">{user.name}</div>
          <div className="header-user-role">{isStudent ? user.studentId : 'Admin'}</div>
        </div>
        <div className="header-avatar">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </div>

        {dropdownOpen && (
          <div className="user-dropdown">
            <div className="dropdown-profile">
              <div className="dropdown-avatar">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
              <div>
                <div className="dropdown-name">{user.name}</div>
                <div className="dropdown-role">{isStudent ? user.studentId : 'Admin'}</div>
              </div>
            </div>
            {isStudent ? (
              <button
                className="dropdown-item"
                onClick={(e) => {
                  e.stopPropagation();
                  setDropdownOpen(false);
                  navigate('/student/info');
                }}
              >
                Thông tin cá nhân
              </button>
            ) : (
              <button
                className="dropdown-item"
                onClick={(e) => {
                  e.stopPropagation();
                  setDropdownOpen(false);
                  navigate('/admin/tracking');
                }}
              >
                Quản lý hệ thống
              </button>
            )}
            <button
              className="dropdown-item logout"
              onClick={(e) => {
                e.stopPropagation();
                setDropdownOpen(false);
                onLogout();
              }}
            >
              Đăng xuất
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
