import { useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import FunnelFlowChart from './components/FunnelFlowChart';
import { useFunnelData } from './data/periscopeData';

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { 
    loading, error, funnelData, availableMonths, availableBuckets,
    month, setMonth,
    region, setRegion,
    countryBuckets, setCountryBuckets,
    rawData
  } = useFunnelData();

  return (
    <div className="app">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
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
        {!loading && !error && funnelData && (
          <div className="dashboard">
            <FunnelFlowChart data={funnelData} rawData={rawData} />
          </div>
        )}
      </main>
    </div>
  );
}