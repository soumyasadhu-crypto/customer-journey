import { useState } from 'react';
import { FiDownload } from 'react-icons/fi';

export default function FunnelFlowChart({ data, rawData }) {
  const [selectedChannel, setSelectedChannel] = useState(null);

  if (!data || !data.channelBreakdown) {
    return <div className="funnel-section">Loading...</div>;
  }

  const channels = Object.keys(data.channelBreakdown) || [];
  
  const getChannelData = () => {
    if (selectedChannel && data.channelBreakdown[selectedChannel]) {
      return data.channelBreakdown[selectedChannel];
    }
    return {
      total: data.totalLeads || 0,
      scheduled: data.trialScheduled || 0,
      notScheduled: data.leadsWithoutTrials || 0,
      trialPending: data.trialPending || 0,
      trialDone: data.trialDone || 0,
      paymentPending: data.paymentPending || 0,
      enrolled: data.enrolled || 0
    };
  };

  const cd = getChannelData();
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
    if (!rawData?.leads) {
      alert('Data not available');
      return;
    }

    const trialMap = new Map();
    (rawData.trials || []).forEach(t => { 
      if (t.student_id) trialMap.set(t.student_id, t); 
    });
    const paidIds = new Set((rawData.payments || []).filter(p => p.mode === 'GA').map(p => p.student_id));

    let leads = rawData.leads.filter(l => l.channel !== 'Organic Content');
    if (selectedChannel) {
      leads = leads.filter(l => l.channel === selectedChannel);
    }

    let filteredLeads = [];
    
    if (stageName === 'Leads') {
      filteredLeads = leads;
    } else if (stageName === 'Schedule Pending') {
      filteredLeads = leads.filter(l => l.student_id && !trialMap.has(l.student_id) && l.prospectstage !== 'Enrolled');
    } else if (stageName === 'Trial Scheduled') {
      filteredLeads = leads.filter(l => l.student_id && trialMap.has(l.student_id));
    } else if (stageName === 'Trial Pending') {
      filteredLeads = leads.filter(l => {
        const t = trialMap.get(l.student_id);
        return t && t.demo_state !== 'DONE';
      });
    } else if (stageName === 'Trial Done') {
      filteredLeads = leads.filter(l => {
        const t = trialMap.get(l.student_id);
        return t && t.demo_state === 'DONE';
      });
    } else if (stageName === 'Payment Pending') {
      filteredLeads = leads.filter(l => {
        const t = trialMap.get(l.student_id);
        return t && t.demo_state === 'DONE' && !paidIds.has(l.student_id) && l.prospectstage !== 'Enrolled';
      });
    } else if (stageName === 'Enrolled') {
      filteredLeads = leads.filter(l => paidIds.has(l.student_id));
    }

    if (!filteredLeads || filteredLeads.length === 0) {
      alert(`No leads for ${stageName}`);
      return;
    }

    try {
      const headers = Object.keys(filteredLeads[0]);
      const rows = filteredLeads.map(row => headers.map(h => row[h]));
      const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const filename = selectedChannel 
        ? `${selectedChannel}_${stageName.toLowerCase().replace(/ /g, '_')}` 
        : stageName.toLowerCase().replace(/ /g, '_');
      a.download = `${filename}_leads.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert('Error exporting data');
    }
  };

  return (
    <div className="funnel-section">
      <h3 className="section-title">Customer Journey Flow</h3>
      
      <div style={{ marginBottom: 20 }}>
        <p style={{ fontSize: 13, color: '#64748B', marginBottom: 8 }}>Lead Source Channels:</p>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {channels.map(ch => (
            <button
              key={ch}
              onClick={() => setSelectedChannel(selectedChannel === ch ? null : ch)}
              style={{
                padding: '6px 12px',
                borderRadius: 6,
                fontSize: 12,
                background: selectedChannel === ch ? '#2563EB' : '#fff',
                color: selectedChannel === ch ? '#fff' : '#0F172A',
                border: '1px solid #E2E8F0',
                cursor: 'pointer',
              }}
            >
              {ch} ({data.channelBreakdown[ch]?.total || 0})
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {stages.map(stage => {
          const width = (stage.value / maxVal) * 100;
          
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
              <div style={{
                width: 130,
                fontSize: 13,
                fontWeight: 600,
                color: stage.color,
              }}>
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

      {selectedChannel && (
        <div style={{
          marginTop: 16,
          padding: 12,
          background: '#F0F9FF',
          borderRadius: 8,
          fontSize: 13,
          color: '#2563EB',
          fontWeight: 500,
        }}>
          Showing data for: {selectedChannel}
        </div>
      )}
    </div>
  );
}