import { useState, useEffect } from 'react';

const LEADS_URL = 'https://app.periscopedata.com/api/cuemath/chart/csv/54270c59-cacc-0508-4d21-aabc60fd7c82';
const TRIALS_URL = 'https://app.periscopedata.com/api/cuemath/chart/csv/683ebbd2-a157-5d3d-8584-999c57c917db';
const PAYMENTS_URL = 'https://app.periscopedata.com/api/cuemath/chart/csv/2a1f418e-b45c-b488-406a-2b4c5fad1032';

function parseCSV(csvText) {
  const lines = csvText.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim());
  const data = [];
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',');
    if (values.length >= 2) {
      const row = {};
      headers.forEach((h, idx) => { row[h] = values[idx]?.trim() || ''; });
      data.push(row);
    }
  }
  return data;
}

export function useFunnelData() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rawData, setRawData] = useState({ leads: [], trials: [], payments: [] });
  const [funnelData, setFunnelData] = useState(null);
  const [availableMonths, setAvailableMonths] = useState([]);
  const [availableBuckets, setAvailableBuckets] = useState([]);
  
  const [month, setMonth] = useState('all');
  const [region, setRegion] = useState('all');
  const [countryBuckets, setCountryBuckets] = useState([]);

  useEffect(() => {
    async function fetchAllData() {
      try {
        setLoading(true);
        const [leadsRes, trialsRes, paymentsRes] = await Promise.all([
          fetch(LEADS_URL), fetch(TRIALS_URL), fetch(PAYMENTS_URL)
        ]);
        const [leadsTxt, trialsTxt, paymentsTxt] = await Promise.all([
          leadsRes.text(), trialsRes.text(), paymentsRes.text()
        ]);
        const leads = parseCSV(leadsTxt);
        const trials = parseCSV(trialsTxt);
        const payments = parseCSV(paymentsTxt);
        
        setAvailableMonths([...new Set(leads.map(l => l.lead_created_month).filter(Boolean))].sort().reverse());
        setAvailableBuckets([...new Set(leads.map(l => l.country_bucket).filter(Boolean))].sort());
        setRawData({ leads, trials, payments });
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    }
    fetchAllData();
  }, []);

  useEffect(() => {
    if (!rawData.leads.length) return;

    let leads = rawData.leads.filter(l => l.channel !== 'Organic Content' && l.prospectstage !== 'Enrolled');
    let trials = rawData.trials.filter(t => t.channel !== 'Organic Content');
    let payments = rawData.payments;

    if (month !== 'all') {
      leads = leads.filter(l => l.lead_created_month === month);
      trials = trials.filter(t => t.lead_created_month === month);
      payments = payments.filter(p => p.lead_created_month === month);
    }
    if (region !== 'all') {
      leads = leads.filter(l => l.region === region);
      trials = trials.filter(t => t.region === region);
      payments = payments.filter(p => p.region === region);
    }
    if (countryBuckets.length > 0) {
      leads = leads.filter(l => countryBuckets.includes(l.country_bucket));
      trials = trials.filter(t => countryBuckets.includes(t.country_bucket));
      payments = payments.filter(p => countryBuckets.includes(p.country_bucket));
    }

    const channelCounts = {};
    leads.forEach(l => { channelCounts[l.channel] = (channelCounts[l.channel] || 0) + 1; });

    const trialMap = new Map();
    const trialScheduledSet = new Set();
    trials.forEach(t => {
      if (t.student_id) {
        trialMap.set(t.student_id, t);
        trialScheduledSet.add(t.student_id);
      }
    });

    const leadsWithTrials = new Set([...trialMap.keys()]);
    const leadsWithoutTrials = leads.filter(l => !leadsWithTrials.has(l.student_id) && l.prospectstage !== 'Enrolled').length;

    const trialPendingIds = new Set();
    const trialDoneIds = new Set();
    const paymentPendingIds = new Set();
    const enrolledIds = new Set();
    payments.filter(p => p.mode === 'GA').forEach(p => enrolledIds.add(p.student_id));

    leads.forEach(l => {
      const s = l.student_id;
      if (!s) return;
      const hasTrial = trialMap.has(s);
      if (!hasTrial) return;
      const t = trialMap.get(s);
      if (t.demo_state !== 'DONE') {
        trialPendingIds.add(s);
      } else {
        trialDoneIds.add(s);
        if (!enrolledIds.has(s) && l.prospectstage !== 'Enrolled') paymentPendingIds.add(s);
      }
    });

    const channelBreakdown = {};
    Object.keys(channelCounts).forEach(ch => {
      const chLeadIds = leads.filter(l => l.channel === ch).map(l => l.student_id);
      const chLeadSet = new Set(chLeadIds);
      const chScheduled = [...chLeadSet].filter(id => trialScheduledSet.has(id)).length;
      const chNotScheduled = [...chLeadSet].filter(id => !trialScheduledSet.has(id)).length;
      const chTrialPending = [...chLeadSet].filter(id => trialPendingIds.has(id)).length;
      const chTrialDone = [...chLeadSet].filter(id => trialDoneIds.has(id)).length;
      const chPaymentPending = [...chLeadSet].filter(id => paymentPendingIds.has(id)).length;
      const chEnrolled = [...chLeadSet].filter(id => enrolledIds.has(id)).length;
      channelBreakdown[ch] = {
        total: channelCounts[ch],
        scheduled: chScheduled,
        notScheduled: chNotScheduled,
        trialPending: chTrialPending,
        trialDone: chTrialDone,
        paymentPending: chPaymentPending,
        enrolled: chEnrolled
      };
    });

    setFunnelData({
      totalLeads: leads.length,
      leadsWithoutTrials,
      channelCounts,
      channelBreakdown,
      trialScheduled: trialScheduledSet.size,
      trialPending: trialPendingIds.size,
      trialDone: trialDoneIds.size,
      paymentPending: paymentPendingIds.size,
      enrolled: enrolledIds.size
    });
  }, [month, region, countryBuckets, rawData]);

  return { 
    loading, error, funnelData, availableMonths, availableBuckets,
    month, setMonth, region, setRegion, countryBuckets, setCountryBuckets, rawData
  };
}