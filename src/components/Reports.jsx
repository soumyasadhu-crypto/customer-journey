import { useState } from 'react';
import { FiDownload, FiX } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

function PasswordGateModal({ onAuthorize, onClose }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const err = onAuthorize(password);
    if (err) setError(err);
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
    }}>
      <div style={{
        background: '#fff', borderRadius: 12, padding: 32, width: 360,
        boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0F172A', margin: 0 }}>Enter password to export</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}>
            <FiX size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <input
            autoFocus
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => { setPassword(e.target.value); setError(''); }}
            style={{
              width: '100%', padding: '10px 12px', borderRadius: 6, fontSize: 14,
              border: error ? '1px solid #EF4444' : '1px solid #E2E8F0',
              outline: 'none', boxSizing: 'border-box', marginBottom: 8,
            }}
          />
          {error && <p style={{ fontSize: 12, color: '#EF4444', margin: '0 0 8px' }}>{error}</p>}
          <button type="submit" style={{
            width: '100%', padding: '10px', background: '#2563EB', color: '#fff',
            border: 'none', borderRadius: 6, fontSize: 14, fontWeight: 600, cursor: 'pointer',
          }}>
            Confirm
          </button>
        </form>
      </div>
    </div>
  );
}

function downloadCSV(rows, filename) {
  if (!rows || rows.length === 0) { alert('No data to export'); return; }
  try {
    const headers = Object.keys(rows[0]);
    const csv = [
      headers.join(','),
      ...rows.map(row => headers.map(h => `"${(row[h] || '').toString().replace(/"/g, '""')}"`).join(','))
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  } catch {
    alert('Error exporting data');
  }
}

export default function Reports({ rawData }) {
  const [showPasswordGate, setShowPasswordGate] = useState(false);
  const [pendingExport, setPendingExport] = useState(null);
  const { user, authorizeWithPassword } = useAuth();

  const handleExport = (type) => {
    if (!user) {
      setPendingExport(type);
      setShowPasswordGate(true);
      return;
    }
    runExport(type);
  };

  const handlePasswordAuthorized = (password) => {
    const err = authorizeWithPassword(password);
    if (err) return err;
    setShowPasswordGate(false);
    if (pendingExport) runExport(pendingExport);
    setPendingExport(null);
    return null;
  };

  const runExport = (type) => {
    if (!rawData?.leads) { alert('Data not available'); return; }

    const prospectToCampaign = new Map();
    (rawData.campaigns || []).forEach(c => {
      if (c.prospectid) {
        const label = c['Final Campaign Category'] || c['Campaign Category'] || c['mx_utm_campaign'] || '';
        prospectToCampaign.set(c.prospectid, label);
      }
    });

    const trialsByProspect = new Map();
    const trialScheduledSet = new Set();
    (rawData.trials || []).forEach(t => {
      if (!t.prospectid || t.demo_state === 'Future Scheduled') return;
      trialScheduledSet.add(t.prospectid);
      if (!trialsByProspect.has(t.prospectid)) trialsByProspect.set(t.prospectid, []);
      trialsByProspect.get(t.prospectid).push(t);
    });

    const trialDoneProspects = new Set();
    const trialPendingProspects = new Set();
    trialsByProspect.forEach((list, id) => {
      if (list.some(t => t.demo_state === 'DONE')) trialDoneProspects.add(id);
      else trialPendingProspects.add(id);
    });

    const paidIds = new Set((rawData.payments || []).map(p => p.prospectid).filter(Boolean));
    const leads = rawData.leads.filter(l => l.channel !== 'Organic Content' && l.country_bucket === 'ME');
    const leadIds = new Set(leads.map(l => l.prospectid).filter(Boolean));

    switch (type) {
      case 'Leads':
        downloadCSV(leads.map(l => ({ ...l, campaign: prospectToCampaign.get(l.prospectid) || '' })), 'leads.csv');
        break;
      case 'Schedule Pending':
        downloadCSV(
          leads.filter(l => l.prospectid && !trialScheduledSet.has(l.prospectid) && !paidIds.has(l.prospectid))
               .map(l => ({ ...l, campaign: prospectToCampaign.get(l.prospectid) || '' })),
          'schedule_pending.csv'
        );
        break;
      case 'Trial Scheduled':
        downloadCSV(
          (rawData.trials || []).filter(t => t.prospectid && leadIds.has(t.prospectid) && t.demo_state !== 'Future Scheduled'),
          'trial_scheduled.csv'
        );
        break;
      case 'Trial Pending':
        downloadCSV(
          (rawData.trials || []).filter(t =>
            t.prospectid && leadIds.has(t.prospectid) &&
            trialPendingProspects.has(t.prospectid) && t.demo_state !== 'Future Scheduled'
          ),
          'trial_pending.csv'
        );
        break;
      case 'Trial Done':
        downloadCSV(
          (rawData.trials || []).filter(t => t.prospectid && leadIds.has(t.prospectid) && t.demo_state === 'DONE'),
          'trial_done.csv'
        );
        break;
      case 'Payment Pending':
        downloadCSV(
          (rawData.trials || []).filter(t =>
            t.prospectid && leadIds.has(t.prospectid) &&
            t.demo_state === 'DONE' && !paidIds.has(t.prospectid)
          ),
          'payment_pending.csv'
        );
        break;
      case 'Enrolled':
        downloadCSV(
          (rawData.payments || []).filter(p => p.prospectid && leadIds.has(p.prospectid)),
          'enrolled.csv'
        );
        break;
      case 'Future Scheduled':
        downloadCSV(
          (rawData.trials || []).filter(t => t.prospectid && leadIds.has(t.prospectid) && t.demo_state === 'Future Scheduled'),
          'future_scheduled.csv'
        );
        break;
      case 'Refunds':
        downloadCSV(rawData.refunds || [], 'refunds.csv');
        break;
      case 'Referrals':
        downloadCSV(rawData.referrals || [], 'referrals.csv');
        break;
      default:
        alert('Unknown export type');
    }
  };

  const funnelExports = [
    { key: 'Leads',            label: 'All Leads',         desc: 'Complete ME leads dump', color: '#3B82F6' },
    { key: 'Schedule Pending', label: 'Schedule Pending',  desc: 'Leads with no trial scheduled', color: '#8B5CF6' },
    { key: 'Trial Scheduled',  label: 'Trial Scheduled',   desc: 'All non-future trial records', color: '#6366F1' },
    { key: 'Trial Pending',    label: 'Trial Pending',     desc: 'Scheduled but not yet done', color: '#EC4899' },
    { key: 'Trial Done',       label: 'Trial Done',        desc: 'Completed trial records', color: '#F59E0B' },
    { key: 'Payment Pending',  label: 'Payment Pending',   desc: 'Trial done, no payment', color: '#EF4444' },
    { key: 'Enrolled',         label: 'Enrolled',          desc: 'Payment records', color: '#10B981' },
    { key: 'Future Scheduled', label: 'Future Scheduled',  desc: 'Upcoming scheduled trials', color: '#D97706' },
  ];

  const analyticsExports = [
    { key: 'Refunds',   label: 'Refunds',   desc: 'Full refunds table', color: '#DC2626' },
    { key: 'Referrals', label: 'Referrals', desc: 'Full referrals table', color: '#10B981' },
  ];

  const ExportCard = ({ item }) => (
    <div style={{
      padding: 20, background: '#fff', borderRadius: 8,
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    }}>
      <div>
        <p style={{ fontSize: 14, fontWeight: 600, color: item.color, marginBottom: 2 }}>{item.label}</p>
        <p style={{ fontSize: 12, color: '#64748B' }}>{item.desc}</p>
      </div>
      <button
        onClick={() => handleExport(item.key)}
        style={{
          padding: '8px 16px', background: item.color, color: '#fff',
          border: 'none', borderRadius: 6, fontSize: 13, fontWeight: 500,
          cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
          whiteSpace: 'nowrap',
        }}
      >
        <FiDownload size={14} /> Export CSV
      </button>
    </div>
  );

  return (
    <div style={{ padding: 24 }}>
      {showPasswordGate && (
        <PasswordGateModal
          onAuthorize={handlePasswordAuthorized}
          onClose={() => { setShowPasswordGate(false); setPendingExport(null); }}
        />
      )}

      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 24 }}>Reports</h2>

      <div style={{ marginBottom: 32 }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, color: '#0F172A', marginBottom: 12 }}>Funnel Exports</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {funnelExports.map(item => <ExportCard key={item.key} item={item} />)}
        </div>
      </div>

      <div>
        <h3 style={{ fontSize: 15, fontWeight: 600, color: '#0F172A', marginBottom: 12 }}>Analytics Exports</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {analyticsExports.map(item => <ExportCard key={item.key} item={item} />)}
        </div>
      </div>
    </div>
  );
}
