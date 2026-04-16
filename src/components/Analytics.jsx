import { useState } from 'react';
import { FiDownload } from 'react-icons/fi';

function formatCurrency(amount) {
  if (!amount) return '₹0';
  if (amount >= 10000000) return '₹' + (amount / 10000000).toFixed(2) + ' Cr';
  if (amount >= 100000) return '₹' + (amount / 100000).toFixed(2) + ' L';
  if (amount >= 1000) return '₹' + (amount / 1000).toFixed(2) + ' K';
  return '₹' + amount.toFixed(2);
}

export default function Analytics({ data, rawData }) {
  const [activeSection, setActiveSection] = useState('refunds');

  if (!data) {
    return <div className="analytics-section">Loading analytics...</div>;
  }

  const {
    totalRefunds,
    refundedAmount,
    refundsByReason,
    totalReferrals,
    acceptedReferrals,
    pendingReferrals,
    referralsByChannel
  } = data;

  const referralRate = totalReferrals > 0 ? ((acceptedReferrals / totalReferrals) * 100).toFixed(1) : 0;
  const refundRate = rawData?.payments?.length > 0 ? ((totalRefunds / rawData.payments.length) * 100).toFixed(1) : 0;

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
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            <div style={{
              padding: 20,
              background: '#fff',
              borderRadius: 8,
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
              <p style={{ fontSize: 13, color: '#64748B', marginBottom: 4 }}>Total Refunds</p>
              <p style={{ fontSize: 28, fontWeight: 700, color: '#DC2626' }}>{totalRefunds}</p>
            </div>
            <div style={{
              padding: 20,
              background: '#fff',
              borderRadius: 8,
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
              <p style={{ fontSize: 13, color: '#64748B', marginBottom: 4 }}>Refunded Amount</p>
              <p style={{ fontSize: 28, fontWeight: 700, color: '#DC2626' }}>{formatCurrency(refundedAmount)}</p>
            </div>
            <div style={{
              padding: 20,
              background: '#fff',
              borderRadius: 8,
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
              <p style={{ fontSize: 13, color: '#64748B', marginBottom: 4 }}>Refund Rate</p>
              <p style={{ fontSize: 28, fontWeight: 700, color: '#DC2626' }}>{refundRate}%</p>
            </div>
          </div>

          <div style={{
            padding: 20,
            background: '#fff',
            borderRadius: 8,
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <h4 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Refunds by Reason</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {Object.entries(refundsByReason).map(([reason, count]) => (
                <div key={reason} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 150, fontSize: 14, color: '#374151' }}>{reason}</div>
                  <div style={{ flex: 1, height: 24, background: '#F1F5F9', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{
                      width: `${(count / totalRefunds) * 100}%`,
                      height: '100%',
                      background: '#DC2626',
                      borderRadius: 4
                    }} />
                  </div>
                  <div style={{ width: 50, textAlign: 'right', fontSize: 14, fontWeight: 600 }}>{count}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeSection === 'referrals' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            <div style={{
              padding: 20,
              background: '#fff',
              borderRadius: 8,
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
              <p style={{ fontSize: 13, color: '#64748B', marginBottom: 4 }}>Total Referrals</p>
              <p style={{ fontSize: 28, fontWeight: 700, color: '#10B981' }}>{totalReferrals}</p>
            </div>
            <div style={{
              padding: 20,
              background: '#fff',
              borderRadius: 8,
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
              <p style={{ fontSize: 13, color: '#64748B', marginBottom: 4 }}>Accepted</p>
              <p style={{ fontSize: 28, fontWeight: 700, color: '#10B981' }}>{acceptedReferrals}</p>
            </div>
            <div style={{
              padding: 20,
              background: '#fff',
              borderRadius: 8,
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
              <p style={{ fontSize: 13, color: '#64748B', marginBottom: 4 }}>Conversion Rate</p>
              <p style={{ fontSize: 28, fontWeight: 700, color: '#10B981' }}>{referralRate}%</p>
            </div>
          </div>

          <div style={{
            padding: 20,
            background: '#fff',
            borderRadius: 8,
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <h4 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Referrals by Channel</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {Object.entries(referralsByChannel).map(([channel, count]) => (
                <div key={channel} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 150, fontSize: 14, color: '#374151' }}>{channel}</div>
                  <div style={{ flex: 1, height: 24, background: '#F1F5F9', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{
                      width: `${(count / totalReferrals) * 100}%`,
                      height: '100%',
                      background: '#10B981',
                      borderRadius: 4
                    }} />
                  </div>
                  <div style={{ width: 50, textAlign: 'right', fontSize: 14, fontWeight: 600 }}>{count}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}