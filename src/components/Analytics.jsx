import { useState } from 'react';

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

export default function Analytics({ data }) {
  const [activeSection, setActiveSection] = useState('refunds');

  if (!data) {
    return <div className="analytics-section">Loading analytics...</div>;
  }

  const {
    totalRefunds,
    refundedAmount,
    refundsByMonth,
    refundsByChannel,
    refundsByClassesBucket,
    refundsByTenure,
    avgClassesCompleted,
    totalRefundedINR,
    totalReferrals,
    successfulReferrals,
    referralsByChannel,
    referralsByMonth,
    avgLeadToSlotDays,
    leadToSlotCount,
    avgTrialDoneToPaymentDays,
    trialDoneToPaymentCount,
    activeBaseTotal,
    avgLeadAgeDays,
    leadsWithValidDate,
    leadsAgeFourPlus,
    activeReferralsGiven,
    activeSuccessfulReferrals,
    activeBaseByProduct,
    activeBaseByBalanceBucket,
    activeBaseByDuration,
    activeBaseByClassPerWeek,
    activeBaseByGrade,
    activeBaseByClassRatio
  } = data;

  const referralRate = totalReferrals > 0 ? ((successfulReferrals / totalReferrals) * 100).toFixed(1) : 0;

  return (
    <div className="analytics-section">
      <div style={{ marginBottom: 24 }}>
        <h3 className="section-title">Analytics</h3>
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
        <button
          onClick={() => setActiveSection('tat')}
          style={{
            padding: '10px 20px',
            background: activeSection === 'tat' ? '#2563EB' : '#fff',
            color: activeSection === 'tat' ? '#fff' : '#0F172A',
            border: '1px solid #E2E8F0',
            borderRadius: 6,
            fontSize: 14,
            fontWeight: 500,
            cursor: 'pointer'
          }}
        >
          TAT Analysis
        </button>
        <button
          onClick={() => setActiveSection('activebase')}
          style={{
            padding: '10px 20px',
            background: activeSection === 'activebase' ? '#2563EB' : '#fff',
            color: activeSection === 'activebase' ? '#fff' : '#0F172A',
            border: '1px solid #E2E8F0',
            borderRadius: 6,
            fontSize: 14,
            fontWeight: 500,
            cursor: 'pointer'
          }}
        >
          Active Base
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
                {data.refundRate ? data.refundRate + '%' : '—'}
              </p>
            </div>
          </div>

          {/* Refunds by Month */}
          <div style={{ padding: 20, background: '#fff', borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h4 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Refunds by Month</h4>
            {renderBarChart(refundsByMonth, totalRefunds, '#DC2626')}
          </div>

          {/* Refunds by Channel */}
          <div style={{ padding: 20, background: '#fff', borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h4 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Refunds by Channel</h4>
            {renderBarChart(refundsByChannel, totalRefunds, '#7C3AED')}
          </div>

          {/* Refunds by Classes Refunded Bucket */}
          <div style={{ padding: 20, background: '#fff', borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h4 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Refunds by Classes Refunded Bucket</h4>
            {renderBarChart(refundsByClassesBucket, totalRefunds, '#059669')}
          </div>

          {/* Refunds by Tenure */}
          <div style={{ padding: 20, background: '#fff', borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h4 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Refunds by Tenure (Months)</h4>
            {renderBarChart(refundsByTenure, totalRefunds, '#EA580C')}
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
              <p style={{ fontSize: 13, color: '#64748B', marginBottom: 4 }}>Successful Referrals</p>
              <p style={{ fontSize: 28, fontWeight: 700, color: '#10B981' }}>{formatNumber(successfulReferrals)}</p>
            </div>
            <div style={{ padding: 20, background: '#fff', borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <p style={{ fontSize: 13, color: '#64748B', marginBottom: 4 }}>Conversion Rate</p>
              <p style={{ fontSize: 28, fontWeight: 700, color: '#10B981' }}>{referralRate}%</p>
            </div>
          </div>

          <div style={{ padding: 20, background: '#fff', borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h4 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Referrals by Month</h4>
            {renderBarChart(referralsByMonth, totalReferrals, '#2563EB')}
          </div>

          <div style={{ padding: 20, background: '#fff', borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h4 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Referrals by Channel</h4>
            {renderBarChart(referralsByChannel, totalReferrals, '#10B981')}
          </div>
        </div>
      )}

      {activeSection === 'activebase' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Summary cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            <div style={{ padding: 20, background: '#fff', borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <p style={{ fontSize: 13, color: '#64748B', marginBottom: 4 }}>Total Active Base</p>
              <p style={{ fontSize: 28, fontWeight: 700, color: '#2563EB' }}>{formatNumber(activeBaseTotal)}</p>
            </div>
            <div style={{ padding: 20, background: '#fff', borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <p style={{ fontSize: 13, color: '#64748B', marginBottom: 4 }}>Avg Lead Age</p>
              <p style={{ fontSize: 28, fontWeight: 700, color: '#2563EB' }}>
                {avgLeadAgeDays !== null ? avgLeadAgeDays + ' days' : '—'}
              </p>
              <p style={{ fontSize: 12, color: '#94A3B8', marginTop: 4 }}>
                {leadsAgeFourPlus > 0 ? `${formatNumber(leadsAgeFourPlus)} leads are 4+ years old or date missing` : ''}
              </p>
            </div>
            <div style={{ padding: 20, background: '#fff', borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <p style={{ fontSize: 13, color: '#64748B', marginBottom: 4 }}>Referrals Given</p>
              <p style={{ fontSize: 28, fontWeight: 700, color: '#10B981' }}>{formatNumber(activeReferralsGiven)}</p>
              <p style={{ fontSize: 12, color: '#94A3B8', marginTop: 4 }}>
                {formatNumber(activeSuccessfulReferrals)} successful ({activeReferralsGiven > 0 ? ((activeSuccessfulReferrals / activeReferralsGiven) * 100).toFixed(1) : 0}%)
              </p>
            </div>
          </div>

          {/* Breakdowns */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
            <div style={{ padding: 20, background: '#fff', borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <h4 style={{ fontSize: 15, fontWeight: 600, marginBottom: 14 }}>By Last Product</h4>
              {renderBarChart(activeBaseByProduct, activeBaseTotal, '#2563EB')}
            </div>
            <div style={{ padding: 20, background: '#fff', borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <h4 style={{ fontSize: 15, fontWeight: 600, marginBottom: 14 }}>By Class Balance Bucket</h4>
              {renderBarChart(activeBaseByBalanceBucket, activeBaseTotal, '#7C3AED')}
            </div>
            <div style={{ padding: 20, background: '#fff', borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <h4 style={{ fontSize: 15, fontWeight: 600, marginBottom: 14 }}>By Last Duration</h4>
              {renderBarChart(activeBaseByDuration, activeBaseTotal, '#059669')}
            </div>
            <div style={{ padding: 20, background: '#fff', borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <h4 style={{ fontSize: 15, fontWeight: 600, marginBottom: 14 }}>By Classes Per Week</h4>
              {renderBarChart(activeBaseByClassPerWeek, activeBaseTotal, '#EA580C')}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
            <div style={{ padding: 20, background: '#fff', borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <h4 style={{ fontSize: 15, fontWeight: 600, marginBottom: 14 }}>By Grade</h4>
              {renderBarChart(activeBaseByGrade, activeBaseTotal, '#F59E0B')}
            </div>
            <div style={{ padding: 20, background: '#fff', borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <h4 style={{ fontSize: 15, fontWeight: 600, marginBottom: 14 }}>By Class Ratio</h4>
              {renderBarChart(activeBaseByClassRatio, activeBaseTotal, '#0EA5E9')}
            </div>
          </div>
        </div>
      )}

      {activeSection === 'tat' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20 }}>
            {/* Lead → Slot Created */}
            <div style={{ padding: 24, background: '#fff', borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <p style={{ fontSize: 13, color: '#64748B', marginBottom: 4 }}>Lead → Trial Slot Scheduled</p>
              <p style={{ fontSize: 40, fontWeight: 700, color: '#2563EB', lineHeight: 1.1 }}>
                {avgLeadToSlotDays !== null ? avgLeadToSlotDays : '—'}
                <span style={{ fontSize: 18, fontWeight: 400, color: '#64748B', marginLeft: 6 }}>days</span>
              </p>
              <p style={{ fontSize: 12, color: '#94A3B8', marginTop: 8 }}>
                Average time from lead creation to trial slot scheduled
              </p>
              <p style={{ fontSize: 12, color: '#94A3B8', marginTop: 4 }}>
                Based on {leadToSlotCount || 0} leads with slot data
              </p>
            </div>

            {/* Trial Done → Payment */}
            <div style={{ padding: 24, background: '#fff', borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <p style={{ fontSize: 13, color: '#64748B', marginBottom: 4 }}>Trial Done → Payment</p>
              <p style={{ fontSize: 40, fontWeight: 700, color: '#10B981', lineHeight: 1.1 }}>
                {avgTrialDoneToPaymentDays !== null ? avgTrialDoneToPaymentDays : '—'}
                <span style={{ fontSize: 18, fontWeight: 400, color: '#64748B', marginLeft: 6 }}>days</span>
              </p>
              <p style={{ fontSize: 12, color: '#94A3B8', marginTop: 8 }}>
                Average time from trial conducted to payment received
              </p>
              <p style={{ fontSize: 12, color: '#94A3B8', marginTop: 4 }}>
                Based on {trialDoneToPaymentCount || 0} enrolled leads with date data
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}