import { FiMenu, FiLogOut } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

export default function Header({ 
  onMenuClick, 
  month, onMonthChange, 
  region, onRegionChange,
  countryBuckets, onCountryBucketsChange,
  availableMonths, availableBuckets 
}) {
  const { user, logout } = useAuth();
  const rowBucketOptions = availableBuckets?.filter(b => b !== 'India') || [];
  const standardBuckets = ['ANZ', 'SGHK', 'UK', 'Other APAC', 'ME'];
  const otherBuckets = rowBucketOptions.filter(b => !standardBuckets.includes(b));
  
  const uniqueRowBuckets = [...standardBuckets, ...otherBuckets].filter(b => rowBucketOptions.includes(b));

  const handleBucketToggle = (bucket) => {
    if (countryBuckets.includes(bucket)) {
      onCountryBucketsChange(countryBuckets.filter(b => b !== bucket));
    } else {
      onCountryBucketsChange([...countryBuckets, bucket]);
    }
  };

  return (
    <header className="header">
      <div className="header-left">
        <button className="menu-toggle" onClick={onMenuClick}>
          <FiMenu size={24} />
        </button>
        <h2>Customer Journey Dashboard</h2>
      </div>
      <div className="filters" style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
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
        
        <select 
          value={region} 
          onChange={(e) => { onRegionChange(e.target.value); onCountryBucketsChange([]); }}
          style={{ padding: '8px 12px', border: '1px solid #E2E8F0', borderRadius: 6, fontSize: 14, fontFamily: 'inherit', background: '#fff' }}
        >
          <option value="all">All Regions</option>
          <option value="India">India</option>
          <option value="ROW">Rest of World</option>
        </select>

        {region === 'ROW' && (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {uniqueRowBuckets.map(bucket => (
              <button
                key={bucket}
                onClick={() => handleBucketToggle(bucket)}
                style={{
                  padding: '6px 12px',
                  border: '1px solid #E2E8F0',
                  borderRadius: 6,
                  fontSize: 13,
                  fontFamily: 'inherit',
                  background: countryBuckets.includes(bucket) ? '#2563EB' : '#fff',
                  color: countryBuckets.includes(bucket) ? '#fff' : '#0F172A',
                  cursor: 'pointer',
                  transition: 'all 150ms ease'
                }}
              >
                {bucket}
              </button>
            ))}
          </div>
        )}
        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 12, color: '#64748B' }}>{user}</span>
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
          </div>
        )}
      </div>
    </header>
  );
}