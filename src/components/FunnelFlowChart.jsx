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

export default function FunnelFlowChart({ data, rawData }) {
  const [viewMode, setViewMode] = useState('channel'); // 'channel' | 'campaign'
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [showEmailGate, setShowEmailGate] = useState(false);
  const [pendingExport, setPendingExport] = useState(null);
  const { user, authorizeWithPassword } = useAuth();

  if (!data || !data.channelBreakdown) {
    return <div className="funnel-section">Loading...</div>;
  }

  const channels = Object.keys(data.channelBreakdown);
  const campaigns = Object.keys(data.campaignBreakdown || {}).sort((a, b) => {
    const aTotal = data.campaignBreakdown[a]?.total || 0;
    const bTotal = data.campaignBreakdown[b]?.total || 0;
    return bTotal - aTotal;
  });

  const getStageData = () => {
    if (viewMode === 'campaign' && selectedCampaign && data.campaignBreakdown?.[selectedCampaign]) {
      return data.campaignBreakdown[selectedCampaign];
    }
    if (viewMode === 'channel' && selectedChannel && data.channelBreakdown[selectedChannel]) {
      return data.channelBreakdown[selectedChannel];
    }
    return {
      total: data.totalLeads || 0,
      futureScheduled: data.futureScheduled || 0,
      scheduled: data.trialScheduled || 0,
      notScheduled: data.leadsWithoutTrials || 0,
      trialPending: data.trialPending || 0,
      trialDone: data.trialDone || 0,
      paymentPending: data.paymentPending || 0,
      enrolled: data.enrolled || 0
    };
  };

  const cd = getStageData();
  const maxVal = Math.max(cd.total, 1);

  const stages = [
    { id: 'all', label: 'Total Leads', value: cd.total, color: '#3B82F6', key: 'Leads' },
    { id: 'notScheduled', label: 'Schedule Pending', value: cd.notScheduled, color: '#8B5CF6', key: 'Schedule Pending' },
    { id: 'scheduled', label: 'Trial Scheduled', value: cd.scheduled, color: '#6366F1', key: 'Trial Scheduled' },
    { id: 'trialPending', label: 'Trial Pending', value: cd.trialPending, color: '#EC4899', key: 'Trial Pending' },
    { id: 'trialDone', label: 'Trial Done', value: cd.trialDone, color: '#F59E0B', key: 'Trial Done' },
    { id: 'paymentPending', label: 'Payment Pending', value: cd.paymentPending, color: '#EF4444', key: 'Payment Pending' },
    { id: 'enrolled', label: 'Enrolled', value: cd.enrolled, color: '#10B981', key: 'Enrolled' },
  ];

  const handleExport = (stageName) => {
    if (!user) {
      setPendingExport(stageName);
      setShowEmailGate(true);
      return;
    }
    runExport(stageName);
  };

  const handlePasswordAuthorized = (password) => {
    const err = authorizeWithPassword(password);
    if (err) return err;
    setShowEmailGate(false);
    if (pendingExport) runExport(pendingExport);
    setPendingExport(null);
    return null;
  };

  const runExport = (stageName) => {
    if (!rawData?.leads) {
      alert('Data not available');
      return;
    }

    const prospectToCampaign = new Map();
    (rawData.campaigns || []).forEach(c => {
      if (c.prospectid) {
        const label = c['Final Campaign Category'] || c['Campaign Category'] || c['mx_utm_campaign'] || '';
        prospectToCampaign.set(c.prospectid, label);
      }
    });

    const trialMap = new Map();
    (rawData.trials || []).forEach(t => {
      if (t.prospectid) trialMap.set(t.prospectid, t);
    });
    const paidIds = new Set((rawData.payments || []).filter(p => p.mode === 'GA').map(p => p.prospectid));

    let leads = rawData.leads.filter(l => l.channel !== 'Organic Content');

    if (viewMode === 'channel' && selectedChannel) {
      leads = leads.filter(l => l.channel === selectedChannel);
    } else if (viewMode === 'campaign' && selectedCampaign) {
      leads = leads.filter(l => prospectToCampaign.get(l.prospectid) === selectedCampaign);
    }

    let filteredLeads = [];
    if (stageName === 'Leads') {
      filteredLeads = leads;
    } else if (stageName === 'Schedule Pending') {
      filteredLeads = leads.filter(l => l.prospectid && !trialMap.has(l.prospectid) && l.prospectstage !== 'Enrolled');
    } else if (stageName === 'Trial Scheduled') {
      filteredLeads = leads.filter(l => l.prospectid && trialMap.has(l.prospectid));
    } else if (stageName === 'Trial Pending') {
      filteredLeads = leads.filter(l => {
        const t = trialMap.get(l.prospectid);
        return t && t.demo_state !== 'DONE';
      });
    } else if (stageName === 'Trial Done') {
      filteredLeads = leads.filter(l => {
        const t = trialMap.get(l.prospectid);
        return t && t.demo_state === 'DONE';
      });
    } else if (stageName === 'Payment Pending') {
      filteredLeads = leads.filter(l => {
        const t = trialMap.get(l.prospectid);
        return t && t.demo_state === 'DONE' && !paidIds.has(l.prospectid) && l.prospectstage !== 'Enrolled';
      });
    } else if (stageName === 'Enrolled') {
      filteredLeads = leads.filter(l => paidIds.has(l.prospectid));
    } else if (stageName === 'Future Scheduled') {
      const futureIds = new Set(
        (rawData.trials || [])
          .filter(t => t.demo_state === 'Future Scheduled' && t.prospectid)
          .map(t => t.prospectid)
      );
      filteredLeads = leads.filter(l => futureIds.has(l.prospectid));
    }

    if (!filteredLeads || filteredLeads.length === 0) {
      alert(`No leads for ${stageName}`);
      return;
    }

    // Enrich export with campaign data
    const enriched = filteredLeads.map(l => ({
      ...l,
      campaign: prospectToCampaign.get(l.prospectid) || '',
    }));

    try {
      const headers = Object.keys(enriched[0]);
      const rows = enriched.map(row => headers.map(h => `"${(row[h] || '').toString().replace(/"/g, '""')}"`));
      const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const prefix = viewMode === 'campaign'
        ? (selectedCampaign || 'all_campaigns')
        : (selectedChannel || 'all_channels');
      a.download = `${prefix}_${stageName.toLowerCase().replace(/ /g, '_')}_leads.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert('Error exporting data');
    }
  };

  const activeSelection = viewMode === 'channel' ? selectedChannel : selectedCampaign;
  const setActiveSelection = viewMode === 'channel' ? setSelectedChannel : setSelectedCampaign;

  return (
    <div className="funnel-section">
      {showEmailGate && (
        <PasswordGateModal
          onAuthorize={handlePasswordAuthorized}
          onClose={() => { setShowEmailGate(false); setPendingExport(null); }}
        />
      )}
      <h3 className="section-title">Customer Journey Flow</h3>

      {/* View mode toggle */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <button
          onClick={() => { setViewMode('channel'); setSelectedCampaign(null); }}
          style={{
            padding: '7px 16px',
            borderRadius: 6,
            fontSize: 13,
            fontWeight: 600,
            background: viewMode === 'channel' ? '#0F172A' : '#fff',
            color: viewMode === 'channel' ? '#fff' : '#64748B',
            border: '1px solid #E2E8F0',
            cursor: 'pointer',
          }}
        >
          By Channel
        </button>
        <button
          onClick={() => { setViewMode('campaign'); setSelectedChannel(null); }}
          style={{
            padding: '7px 16px',
            borderRadius: 6,
            fontSize: 13,
            fontWeight: 600,
            background: viewMode === 'campaign' ? '#0F172A' : '#fff',
            color: viewMode === 'campaign' ? '#fff' : '#64748B',
            border: '1px solid #E2E8F0',
            cursor: 'pointer',
          }}
        >
          By Campaign
        </button>
      </div>

      {/* Filter pills */}
      <div style={{ marginBottom: 20 }}>
        <p style={{ fontSize: 13, color: '#64748B', marginBottom: 8 }}>
          {viewMode === 'channel' ? 'Lead Source Channels:' : 'Campaigns:'}
        </p>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {(viewMode === 'channel' ? channels : campaigns).map(item => {
            const count = viewMode === 'channel'
              ? data.channelBreakdown[item]?.total || 0
              : data.campaignBreakdown[item]?.total || 0;
            return (
              <button
                key={item}
                onClick={() => setActiveSelection(activeSelection === item ? null : item)}
                style={{
                  padding: '6px 12px',
                  borderRadius: 6,
                  fontSize: 12,
                  background: activeSelection === item ? '#2563EB' : '#fff',
                  color: activeSelection === item ? '#fff' : '#0F172A',
                  border: '1px solid #E2E8F0',
                  cursor: 'pointer',
                }}
              >
                {item} ({count.toLocaleString()})
              </button>
            );
          })}
          {viewMode === 'campaign' && campaigns.length === 0 && (
            <span style={{ fontSize: 13, color: '#94A3B8' }}>No campaign data loaded yet</span>
          )}
        </div>
      </div>

      {/* Funnel stages */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {stages.map(stage => {
          const width = (stage.value / maxVal) * 100;
          const prevStage = stages[stages.indexOf(stage) - 1];
          const convRate = prevStage && prevStage.value > 0
            ? ((stage.value / prevStage.value) * 100).toFixed(1)
            : null;

          return (
            <div
              key={stage.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '10px 14px',
                background: '#fff',
                borderRadius: 8,
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              }}
            >
              <div style={{ width: 140, fontSize: 13, fontWeight: 600, color: stage.color }}>
                {stage.label}
              </div>
              <div style={{ flex: 1, height: 24, background: '#F1F5F9', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{
                  width: `${Math.max(width, 3)}%`,
                  height: '100%',
                  background: stage.color,
                  borderRadius: 4,
                }} />
              </div>
              <div style={{
                width: 70,
                textAlign: 'right',
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: 13,
                fontWeight: 600,
              }}>
                {stage.value.toLocaleString()}
              </div>
              {convRate !== null && (
                <div style={{
                  width: 52,
                  textAlign: 'right',
                  fontSize: 11,
                  color: '#64748B',
                  fontFamily: 'JetBrains Mono, monospace',
                }}>
                  {convRate}%
                </div>
              )}
              {convRate === null && <div style={{ width: 52 }} />}
              <button
                onClick={() => handleExport(stage.key)}
                style={{
                  padding: '4px 8px',
                  borderRadius: 4,
                  fontSize: 11,
                  background: '#F1F5F9',
                  border: '1px solid #E2E8F0',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                <FiDownload size={12} /> Export
              </button>
            </div>
          );
        })}
      </div>

      {/* Future Scheduled — separate metric, excluded from main funnel */}
      <div style={{ marginTop: 20 }}>
        <p style={{ fontSize: 12, color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
          Additional Metrics
        </p>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '10px 14px',
          background: '#FFFBEB',
          border: '1px dashed #F59E0B',
          borderRadius: 8,
        }}>
          <div style={{ width: 140, fontSize: 13, fontWeight: 600, color: '#D97706' }}>
            Future Scheduled
          </div>
          <div style={{ flex: 1, height: 24, background: '#FEF3C7', borderRadius: 4, overflow: 'hidden' }}>
            <div style={{
              width: `${Math.max((cd.futureScheduled / maxVal) * 100, cd.futureScheduled > 0 ? 3 : 0)}%`,
              height: '100%',
              background: '#F59E0B',
              borderRadius: 4,
            }} />
          </div>
          <div style={{
            width: 70,
            textAlign: 'right',
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 13,
            fontWeight: 600,
            color: '#D97706',
          }}>
            {cd.futureScheduled.toLocaleString()}
          </div>
          <div style={{ width: 52 }} />
          <button
            onClick={() => handleExport('Future Scheduled')}
            style={{
              padding: '4px 8px',
              borderRadius: 4,
              fontSize: 11,
              background: '#FEF3C7',
              border: '1px solid #F59E0B',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <FiDownload size={12} /> Export
          </button>
        </div>
      </div>

      {activeSelection && (
        <div style={{
          marginTop: 16,
          padding: 12,
          background: '#F0F9FF',
          borderRadius: 8,
          fontSize: 13,
          color: '#2563EB',
          fontWeight: 500,
        }}>
          Showing: {viewMode === 'channel' ? 'Channel' : 'Campaign'} — {activeSelection}
        </div>
      )}
    </div>
  );
}
