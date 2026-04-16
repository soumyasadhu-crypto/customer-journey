import { useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import FunnelFlowChart from './components/FunnelFlowChart';
import Analytics from './components/Analytics';
import { useFunnelData } from './data/periscopeData';
import { useAuth } from './context/AuthContext';
import Login from './components/Login';

function Dashboard({ activeTab }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { 
    loading, error, funnelData, analyticsData, availableMonths, availableBuckets,
    month, setMonth,
    region, setRegion,
    countryBuckets, setCountryBuckets,
    rawData
  } = useFunnelData();

  return (
    <div className="app">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="main-content">
        <Header 
          onMenuClick={() => setSidebarOpen(true)}
          month={month}
          onMonthChange={setMonth}
          region={region}
          onRegionChange={setRegion}
          countryBuckets={countryBuckets}
          onCountryBucketsChange={setCountryBuckets}
          availableMonths={availableMonths}
          availableBuckets={availableBuckets}
        />
        {loading && (
          <div className="dashboard">
            <div className="loading">
              <div className="loading-spinner"></div>
              <p>Loading funnel data...</p>
            </div>
          </div>
        )}
        {error && (
          <div className="dashboard">
            <div className="error">
              <p>Error: {error}</p>
              <button className="retry-btn" onClick={() => window.location.reload()}>Retry</button>
            </div>
          </div>
        )}
        {!loading && !error && (
          <div className="dashboard">
            {activeTab === 'dashboard' && funnelData && (
              <FunnelFlowChart data={funnelData} rawData={rawData} />
            )}
            {activeTab === 'analytics' && analyticsData && (
              <Analytics data={analyticsData} rawData={rawData} />
            )}
            {activeTab === 'reports' && (
              <div style={{ padding: 24 }}>
                <h2>Reports</h2>
                <p style={{ color: '#64748B' }}>Reports section coming soon...</p>
              </div>
            )}
            {activeTab === 'settings' && (
              <div style={{ padding: 24 }}>
                <h2>Settings</h2>
                <p style={{ color: '#64748B' }}>Settings section coming soon...</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#F8FAFC'
      }}>
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return <Dashboard activeTab={activeTab} />;
}