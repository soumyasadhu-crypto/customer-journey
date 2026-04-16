import { useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import FunnelFlowChart from './components/FunnelFlowChart';
import Analytics from './components/Analytics';
import { useFunnelData } from './data/periscopeData';

function Dashboard({ activeTab, setActiveTab }) {
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
                  <Analytics data={analyticsData} rawData={rawData} />
                ) : (
                  <div style={{ padding: 40, textAlign: 'center' }}>
                    <p>Loading analytics data...</p>
                    <pre style={{ textAlign: 'left', fontSize: 12 }}>
                      {JSON.stringify({ 
                        hasData: !!rawData?.refunds?.length, 
                        refundsCount: rawData?.refunds?.length,
                        referralsCount: rawData?.referrals?.length 
                      }, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
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
  const { loading, error, funnelData, analyticsData, availableMonths, availableBuckets } = useFunnelData();

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