import { useState } from 'react';
import { FiDownload } from 'react-icons/fi';

function formatCurrency(amount) {
  if (!amount) return '₹0';
  if (amount >= 10000000) return '₹' + (amount / 10000000).toFixed(2) + ' Cr';
  if (amount >= 100000) return '₹' + (amount / 100000).toFixed(2) + ' L';
  if (amount >= 1000) return '₹' + (amount / 1000).toFixed(2) + ' K';
  return '₹' + amount.toFixed(2);
}

function formatNumber(num) {
  if (!num) return '0';
  return parseInt(num).toLocaleString();
}

function renderBarChart(data, total, color = '#DC2626') {
  if (!data || Object.keys(data).length === 0) return <p style={{ color: '#64748B' }}>No data</p>;
  
  return Object.entries(data).map(([key, count]) => (
    <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
      <div style={{ width: 120, fontSize: 13, color: '#374151' }}>{key}</div>
      <div style={{ flex: 1, height: 20, background: '#F1F5F9', borderRadius: 4, overflow: 'hidden' }}>
        <div style={{
          width: `${(count / total) * 100}%`,
          height: '100%',
          background: color,
          borderRadius: 4
        }} />
      </div>
      <div style={{ width: 60, textAlign: 'right', fontSize: 13, fontWeight: 600, fontFamily: 'JetBrains Mono, monospace' }}>
        {formatNumber(count)}
      </div>
    </div>
  ));
}

export default function Analytics({ data, rawData }) {
  const [activeSection, setActiveSection] = useState('refunds');

  if (!data) {
    return <div className="analytics-section">Loading analytics...</div>;
  }

  const {
    totalRefunds,
    refundedAmount,
    refundsByMonth,
    refundsByRegion,
    refundsByChannel,
    avgClassesCompleted,
    totalRefundedINR,
    totalReferrals,
    acceptedReferrals,
    pendingReferrals,
    referralsByChannel
  } = data;

  const referralRate = totalReferrals > 0 ? ((acceptedReferrals / totalReferrals) * 100).toFixed(1) : 0;

  const handleExport = () => {
    if (!rawData) {
      alert('Data not available');
      return;
    }

    const exportData = activeSection === 'refunds' ? rawData.refunds : rawData.referrals;
    if (!exportData || exportData.length === 0) {
      alert('No data to export');
      return;
    }

    try {
      const headers = Object.keys(exportData[0]);
      const rows = exportData.map(row => headers.map(h => row[h]));
      const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${activeSection}_data.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert('Error exporting data');
    }
  };

  return (
    <div className="analytics-section">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h3 className="section-title">Analytics</h3>
        <button
          onClick={handleExport}
          style={{
            padding: '8px 16px',
            background: '#2563EB',
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            fontSize: 13,
            fontWeight: 500,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6
          }}
        >
          <FiDownload size={14} /> Export
        </button>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
        <button
          onClick={() => setActiveSection('refunds')}
          style={{
            padding: '10px 20px',
            background: activeSection === 'refunds' ? '#2563EB' : '#fff',
            color: activeSection === 'refunds' ? '#fff' : '#0F172A',
            border: '1px solid #E2E8F0',
            borderRadius: 6,
            fontSize: 14,
            fontWeight: 500,
            cursor: 'pointer'
          }}
        >
          Refunds
        </button>
        <button
          onClick={() => setActiveSection('referrals')}
          style={{
            padding: '10px 20px',
            background: activeSection === 'referrals' ? '#2563EB' : '#fff',
            color: activeSection === 'referrals' ? '#fff' : '#0F172A',
            border: '1px solid #E2E8F0',
            borderRadius: 6,
            fontSize: 14,
            fontWeight: 500,
            cursor: 'pointer'
          }}
        >
          Referrals
        </button>
      </div>

      {activeSection === 'refunds' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Key Metrics */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
            <div style={{ padding: 20, background: '#fff', borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <p style={{ fontSize: 13, color: '#64748B', marginBottom: 4 }}>Total Refunds</p>
              <p style={{ fontSize: 28, fontWeight: 700, color: '#DC2626' }}>{formatNumber(totalRefunds)}</p>
            </div>
            <div style={{ padding: 20, background: '#fff', borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <p style={{ fontSize: 13, color: '#64748B', marginBottom: 4 }}>Refunded Amount (INR)</p>
              <p style={{ fontSize: 28, fontWeight: 700, color: '#DC2626' }}>{formatCurrency(totalRefundedINR)}</p>
            </div>
            <div style={{ padding: 20, background: '#fff', borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <p style={{ fontSize: 13, color: '#64748B', marginBottom: 4 }}>Avg Classes Before Refund</p>
              <p style={{ fontSize: 28, fontWeight: 700, color: '#DC2626' }}>{formatNumber(avgClassesCompleted)}</p>
            </div>
            <div style={{ padding: 20, background: '#fff', borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <p style={{ fontSize: 13, color: '#64748B', marginBottom: 4 }}>Refund Rate</p>
              <p style={{ fontSize: 28, fontWeight: 700, color: '#DC2626' }}>
                {rawData?.payments?.length > 0 ? ((totalRefunds / rawData.payments.length) * 100).toFixed(1) : 0}%
              </p>
            </div>
          </div>

          {/* Refunds by Month */}
          <div style={{ padding: 20, background: '#fff', borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h4 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Refunds by Month</h4>
            {renderBarChart(refundsByMonth, totalRefunds, '#DC2626')}
          </div>

          {/* Refunds by Region */}
          <div style={{ padding: 20, background: '#fff', borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h4 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Refunds by Region</h4>
            {renderBarChart(refundsByRegion, totalRefunds, '#7C3AED')}
          </div>

          {/* Refunds by Channel */}
          <div style={{ padding: 20, background: '#fff', borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h4 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Refunds by Channel (Payment Gateway)</h4>
            {renderBarChart(refundsByChannel, totalRefunds, '#059669')}
          </div>
        </div>
      )}

      {activeSection === 'referrals' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            <div style={{ padding: 20, background: '#fff', borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <p style={{ fontSize: 13, color: '#64748B', marginBottom: 4 }}>Total Referrals</p>
              <p style={{ fontSize: 28, fontWeight: 700, color: '#10B981' }}>{formatNumber(totalReferrals)}</p>
            </div>
            <div style={{ padding: 20, background: '#fff', borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <p style={{ fontSize: 13, color: '#64748B', marginBottom: 4 }}>Accepted</p>
              <p style={{ fontSize: 28, fontWeight: 700, color: '#10B981' }}>{formatNumber(acceptedReferrals)}</p>
            </div>
            <div style={{ padding: 20, background: '#fff', borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <p style={{ fontSize: 13, color: '#64748B', marginBottom: 4 }}>Conversion Rate</p>
              <p style={{ fontSize: 28, fontWeight: 700, color: '#10B981' }}>{referralRate}%</p>
            </div>
          </div>

          <div style={{ padding: 20, background: '#fff', borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h4 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Referrals by Channel</h4>
            {renderBarChart(referralsByChannel, totalReferrals, '#10B981')}
          </div>
        </div>
      )}
    </div>
  );
}