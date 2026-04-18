import { useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import FunnelFlowChart from './components/FunnelFlowChart';
import Analytics from './components/Analytics';
import Reports from './components/Reports';
import { useFunnelData } from './data/periscopeData';

function Dashboard({ activeTab, setActiveTab }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { loading, error, funnelData, analyticsData, availableMonths, month, setMonth, rawData } = useFunnelData();

  return (
    <div className="app">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="main-content">
        <Header
          onMenuClick={() => setSidebarOpen(true)}
          month={month}
          onMonthChange={setMonth}
          availableMonths={availableMonths}
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
            <div style={{ padding: 40, textAlign: 'center' }}>
              <h3 style={{ color: '#DC2626' }}>Error loading data</h3>
              <p style={{ color: '#64748B' }}>{error}</p>
              <button className="retry-btn" onClick={() => window.location.reload()}>Retry</button>
            </div>
          </div>
        )}
        {!loading && !error && (
          <div className="dashboard">
            {activeTab === 'dashboard' && funnelData && (
              <FunnelFlowChart data={funnelData} rawData={rawData} />
            )}
            {activeTab === 'analytics' && (
              <div style={{ padding: 20 }}>
                <h2>Analytics</h2>
                {analyticsData ? (
                  <Analytics data={analyticsData} />
                ) : (
                  <div style={{ padding: 40, textAlign: 'center' }}>
                    <p>Loading analytics data...</p>
                  </div>
                )}
              </div>
            )}
            {activeTab === 'reports' && (
              <Reports rawData={rawData} />
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
  const { loading } = useFunnelData();

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

  return <Dashboard activeTab={activeTab} setActiveTab={setActiveTab} />;
}
