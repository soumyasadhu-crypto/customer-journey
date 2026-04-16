import { useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import FunnelFlowChart from './components/FunnelFlowChart';
import Analytics from './components/Analytics';
import { useFunnelData } from './data/periscopeData';

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
  const [activeTab, setActiveTab] = useState('analytics');
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
        <p>Loading data...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: 20, background: '#F8FAFC', minHeight: '100vh' }}>
      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        {['dashboard', 'analytics', 'reports', 'settings'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '10px 20px',
              background: activeTab === tab ? '#2563EB' : '#fff',
              color: activeTab === tab ? '#fff' : '#0F172A',
              border: '1px solid #E2E8F0',
              borderRadius: 6,
              cursor: 'pointer',
              textTransform: 'capitalize'
            }}
          >
            {tab}
          </button>
        ))}
      </div>
      
      {activeTab === 'analytics' && analyticsData && (
        <div>
          <h2>Refunds: {analyticsData.totalRefunds}</h2>
          <p>Amount: ₹{analyticsData.refundedAmount?.toLocaleString()}</p>
          <h2>Referrals: {analyticsData.totalReferrals}</h2>
        </div>
      )}
      
      {activeTab === 'dashboard' && funnelData && (
        <div>
          <h2>Total Leads: {funnelData.totalLeads}</h2>
          <h2>Trial Scheduled: {funnelData.trialScheduled}</h2>
          <h2>Enrolled: {funnelData.enrolled}</h2>
        </div>
      )}
    </div>
  );
}