import { useState } from 'react';
import { 
  FiGrid, 
  FiBarChart2, 
  FiFileText, 
  FiSettings,
  FiX
} from 'react-icons/fi';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: FiGrid },
  { id: 'analytics', label: 'Analytics', icon: FiBarChart2 },
  { id: 'reports', label: 'Reports', icon: FiFileText },
  { id: 'settings', label: 'Settings', icon: FiSettings },
];

export default function Sidebar({ isOpen, onClose }) {
  const [activeItem, setActiveItem] = useState('dashboard');

  return (
    <>
      <div className={`sidebar-overlay ${isOpen ? 'show' : ''}`} onClick={onClose} />
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="32" height="32" rx="8" fill="#2563EB"/>
            <path d="M8 22V10L16 6L24 10V22L16 26L8 22Z" stroke="white" strokeWidth="2" fill="none"/>
            <circle cx="16" cy="16" r="4" fill="white"/>
          </svg>
          <h1>K12 Journey</h1>
        </div>
        <nav className="sidebar-nav">
          {navItems.map(item => (
            <div
              key={item.id}
              className={`nav-item ${activeItem === item.id ? 'active' : ''}`}
              onClick={() => setActiveItem(item.id)}
            >
              <item.icon />
              <span>{item.label}</span>
            </div>
          ))}
        </nav>
        <button className="menu-toggle" onClick={onClose} style={{position: 'absolute', top: 16, right: 16, color: '#fff'}}>
          <FiX size={24} />
        </button>
      </aside>
    </>
  );
}
