import { FiMenu, FiLogOut } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

export default function Header({ onMenuClick, month, onMonthChange, availableMonths }) {
  const { user, logout } = useAuth();

  return (
    <header className="header">
      <div className="header-left">
        <button className="menu-toggle" onClick={onMenuClick}>
          <FiMenu size={24} />
        </button>
        <h2>Customer Journey Dashboard — ME</h2>
      </div>
      <div className="filters" style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <select
          value={month}
          onChange={(e) => onMonthChange(e.target.value)}
          style={{ padding: '8px 12px', border: '1px solid #E2E8F0', borderRadius: 6, fontSize: 14, fontFamily: 'inherit', background: '#fff' }}
        >
          <option value="all">All Months</option>
          {availableMonths?.map(m => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>

        {user && (
          <button
            onClick={logout}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '6px 10px', background: '#FEE2E2',
              border: '1px solid #FECACA', borderRadius: 6,
              fontSize: 12, color: '#DC2626', cursor: 'pointer'
            }}
          >
            <FiLogOut size={13} /> Sign Out
          </button>
        )}
      </div>
    </header>
  );
}
