import { useState, useEffect } from 'react';

const LEADS_URL = 'https://app.periscopedata.com/api/cuemath/chart/csv/54270c59-cacc-0508-4d21-aabc60fd7c82';
const TRIALS_URL = 'https://app.periscopedata.com/api/cuemath/chart/csv/683ebbd2-a157-5d3d-8584-999c57c917db';
const PAYMENTS_URL = 'https://app.periscopedata.com/api/cuemath/chart/csv/2a1f418e-b45c-b488-406a-2b4c5fad1032';
const REFUNDS_URL = 'https://app.periscopedata.com/api/cuemath/chart/csv/840e58d1-be86-c768-6244-ab30d1157395';
const REFERRALS_URL = 'https://app.periscopedata.com/api/cuemath/chart/csv/b8f41fdc-31ab-2529-39ef-c68fb004d949';
const CAMPAIGNS_URL = 'https://docs.google.com/spreadsheets/d/109x2JRONU1nyVJ-p_oCVHtQ76zDNM3phGtDv9QNo-hM/export?format=csv&gid=0';

function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (ch === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  result.push(current.trim());
  return result;
}

function parseCSV(csvText) {
  const lines = csvText.trim().split('\n');
  const headers = parseCSVLine(lines[0]).map(h => h.trim());
  const data = [];
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (values.length >= 2) {
      const row = {};
      headers.forEach((h, idx) => { row[h] = values[idx]?.trim() || ''; });
      data.push(row);
    }
  }
  return data;
}

function getCampaignLabel(row) {
  return row['Final Campaign Category'] || row['Campaign Category'] || row['mx_utm_campaign'] || '';
}

export function useFunnelData() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rawData, setRawData] = useState({ leads: [], trials: [], payments: [], refunds: [], referrals: [], campaigns: [] });
  const [funnelData, setFunnelData] = useState(null);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [availableMonths, setAvailableMonths] = useState([]);
  const [month, setMonth] = useState('all');

  useEffect(() => {
    async function fetchAllData() {
      try {
        setLoading(true);
        setError(null);

        const urls = [LEADS_URL, TRIALS_URL, PAYMENTS_URL, REFUNDS_URL, REFERRALS_URL, CAMPAIGNS_URL];

        const responses = [];
        for (const url of urls) {
          console.log('Fetching:', url);
          try {
            const res = await fetch(url);
            console.log('Response:', url, res.ok, res.status);
            responses.push(res);
          } catch (e) {
            console.log('Error:', url, e.message);
            responses.push({ ok: false, text: () => '' });
          }
        }

        const texts = [];
        for (const r of responses) {
          try {
            texts.push(r.ok ? await r.text() : '');
          } catch (e) {
            texts.push('');
          }
        }

        const leads = parseCSV(texts[0] || '');
        const trials = parseCSV(texts[1] || '');
        const payments = parseCSV(texts[2] || '');
        const refunds = parseCSV(texts[3] || '');
        const referrals = parseCSV(texts[4] || '');
        const campaigns = parseCSV(texts[5] || '');

        const hasData = leads.length > 0 || trials.length > 0 || payments.length > 0;

        if (!hasData) {
          console.log('Using fallback mock data');
          const mockLeads = [
            { lead_created_month: '2026-03', prospectstage: 'Lead', channel: 'Google', country_bucket: 'ME', prospectid: '1', lead_created_date: '2026-03-01' },
            { lead_created_month: '2026-03', prospectstage: 'Lead', channel: 'Facebook', country_bucket: 'ME', prospectid: '2', lead_created_date: '2026-03-02' },
            { lead_created_month: '2026-03', prospectstage: 'Demo Done', channel: 'Google', country_bucket: 'ME', prospectid: '3', lead_created_date: '2026-03-03' }
          ];
          const mockTrials = [
            { prospectid: '3', demo_state: 'DONE', channel: 'Google', lead_created_month: '2026-03', country_bucket: 'ME' }
          ];
          const mockPayments = [
            { prospectid: '3', lead_created_month: '2026-03', country_bucket: 'ME' }
          ];
          const mockRefunds = [
            { refund_reason: 'Quality Issue', refund_amount: '5000' },
            { refund_reason: 'Quality Issue', refund_amount: '3000' }
          ];
          const mockReferrals = [
            { channel: 'Google', status: 'Accepted' },
            { channel: 'Facebook', status: 'Pending' },
            { channel: 'Referral', status: 'Accepted' }
          ];
          const mockCampaigns = [
            { prospectid: '1', mx_utm_campaign: 'Brand_Search', 'Campaign Category': 'Brand', 'Final Campaign Category': 'Brand' },
            { prospectid: '2', mx_utm_campaign: 'Performance_Max', 'Campaign Category': 'Performance', 'Final Campaign Category': 'Performance Max' },
            { prospectid: '3', mx_utm_campaign: 'Brand_Search', 'Campaign Category': 'Brand', 'Final Campaign Category': 'Brand' },
          ];
          setRawData({ leads: mockLeads, trials: mockTrials, payments: mockPayments, refunds: mockRefunds, referrals: mockReferrals, campaigns: mockCampaigns });
          setAvailableMonths(['2026-03']);
          setAvailableBuckets(['India']);
          setLoading(false);
          return;
        }

        setAvailableMonths([...new Set(leads.map(l => l.lead_created_month).filter(Boolean))].sort().reverse());
        setRawData({ leads, trials, payments, refunds, referrals, campaigns });
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

    // Hardcoded to Middle East (ME) country bucket only
    let leads = rawData.leads.filter(l => l.channel !== 'Organic Content' && l.country_bucket === 'ME');
    let trials = rawData.trials.filter(t => t.channel !== 'Organic Content' && t.country_bucket === 'ME');
    let payments = rawData.payments.filter(p => p.country_bucket === 'ME');

    if (month !== 'all') {
      leads = leads.filter(l => l.lead_created_month === month);
      trials = trials.filter(t => t.lead_created_month === month);
      payments = payments.filter(p => p.lead_created_month === month);
    }

    // Build campaign lookup: prospectid → campaign label
    const prospectToCampaign = new Map();
    rawData.campaigns.forEach(c => {
      if (c.prospectid) {
        prospectToCampaign.set(c.prospectid, getCampaignLabel(c));
      }
    });

    const channelCounts = {};
    leads.forEach(l => { channelCounts[l.channel] = (channelCounts[l.channel] || 0) + 1; });

    const campaignCounts = {};
    leads.forEach(l => {
      const camp = prospectToCampaign.get(l.prospectid);
      if (!camp) return; // exclude leads with no campaign mapping
      campaignCounts[camp] = (campaignCounts[camp] || 0) + 1;
    });

    // Group all trial records per prospect (a prospect can have multiple trials)
    const trialsByProspect = new Map(); // prospectid → [trial, ...]
    const trialScheduledSet = new Set();
    const futureScheduledIds = new Set();
    trials.forEach(t => {
      if (!t.prospectid) return;
      if (t.demo_state === 'Future Scheduled') {
        futureScheduledIds.add(t.prospectid);
        return;
      }
      trialScheduledSet.add(t.prospectid);
      if (!trialsByProspect.has(t.prospectid)) trialsByProspect.set(t.prospectid, []);
      trialsByProspect.get(t.prospectid).push(t);
    });

    const enrolledIds = new Set();
    payments.forEach(p => { if (p.prospectid) enrolledIds.add(p.prospectid); });

    // Schedule Pending: in leads table, NOT in trials table at all, NOT enrolled
    const leadsWithoutTrials = leads.filter(l =>
      !trialScheduledSet.has(l.prospectid) &&
      !futureScheduledIds.has(l.prospectid) &&
      !enrolledIds.has(l.prospectid)
    ).length;

    const trialPendingIds = new Set();
    const trialDoneIds = new Set();
    const paymentPendingIds = new Set();

    // Trial Done: prospect has at least one DONE trial
    // Trial Pending: prospect has trial(s) but none are DONE
    trialsByProspect.forEach((trialList, id) => {
      if (trialList.some(t => t.demo_state === 'DONE')) {
        trialDoneIds.add(id);
      } else {
        trialPendingIds.add(id);
      }
    });

    // Payment Pending: trial DONE, no payment record
    trialDoneIds.forEach(id => {
      if (!enrolledIds.has(id)) paymentPendingIds.add(id);
    });

    // Build per-channel breakdown
    const channelBreakdown = {};
    Object.keys(channelCounts).forEach(ch => {
      const chLeadIds = leads.filter(l => l.channel === ch).map(l => l.prospectid);
      const chLeadSet = new Set(chLeadIds);
      channelBreakdown[ch] = buildBreakdown(channelCounts[ch], chLeadSet, trialScheduledSet, trialPendingIds, trialDoneIds, paymentPendingIds, enrolledIds, futureScheduledIds);
    });

    // Build per-campaign breakdown
    const campaignBreakdown = {};
    Object.keys(campaignCounts).forEach(camp => {
      const campLeadIds = leads
        .filter(l => prospectToCampaign.get(l.prospectid) === camp)
        .map(l => l.prospectid);
      const campLeadSet = new Set(campLeadIds);
      campaignBreakdown[camp] = buildBreakdown(campaignCounts[camp], campLeadSet, trialScheduledSet, trialPendingIds, trialDoneIds, paymentPendingIds, enrolledIds, futureScheduledIds);
    });

    setFunnelData({
      totalLeads: leads.length,
      leadsWithoutTrials,
      channelCounts,
      channelBreakdown,
      campaignCounts,
      campaignBreakdown,
      futureScheduled: futureScheduledIds.size,
      trialScheduled: trialScheduledSet.size,
      trialPending: trialPendingIds.size,
      trialDone: trialDoneIds.size,
      paymentPending: paymentPendingIds.size,
      enrolled: enrolledIds.size
    });

    // Analytics calculations — refunds scoped to ME
    const referrals = rawData.referrals;

    let filteredRefunds = rawData.refunds.filter(r => r.country_bucket === 'ME');
    if (month !== 'all') {
      filteredRefunds = filteredRefunds.filter(r => r.refunded_month === month);
    }

    const totalRefunds = filteredRefunds.length;
    const refundsByMonth = {};
    filteredRefunds.forEach(r => {
      const m = r.refunded_month || 'Unknown';
      refundsByMonth[m] = (refundsByMonth[m] || 0) + 1;
    });
    const refundsByChannel = {};
    filteredRefunds.forEach(r => {
      const ch = r.channel || 'Unknown';
      refundsByChannel[ch] = (refundsByChannel[ch] || 0) + 1;
    });
    const refundsByClassesBucket = {};
    filteredRefunds.forEach(r => {
      const bucket = r.classes_refunded_bucket || 'Unknown';
      refundsByClassesBucket[bucket] = (refundsByClassesBucket[bucket] || 0) + 1;
    });
    const refundsByTenure = {};
    filteredRefunds.forEach(r => {
      const tenure = r.tenure || 'Unknown';
      refundsByTenure[tenure] = (refundsByTenure[tenure] || 0) + 1;
    });
    const totalClassesCompleted = filteredRefunds.reduce((sum, r) => sum + (parseInt(r.classes_completed) || 0), 0);
    const avgClassesCompleted = totalRefunds > 0 ? Math.round(totalClassesCompleted / totalRefunds) : 0;
    const totalRefundedINR = filteredRefunds.reduce((sum, r) => sum + (parseFloat(r.refund_amount_inr) || 0), 0);

    const filteredReferrals = referrals.filter(r => r.country_bucket === 'ME');
    const totalReferrals = filteredReferrals.length;
    const acceptedReferrals = filteredReferrals.filter(r => r.is_valid === 'true' || r.is_deleted === 'false').length;
    const pendingReferrals = filteredReferrals.filter(r => r.is_deleted !== 'true').length;
    const referralsByChannel = {};
    filteredReferrals.forEach(r => {
      const ch = r.channel || 'Unknown';
      referralsByChannel[ch] = (referralsByChannel[ch] || 0) + 1;
    });

    setAnalyticsData({
      totalRefunds,
      refundedAmount: totalRefundedINR,
      refundsByMonth,
      refundsByChannel,
      refundsByClassesBucket,
      refundsByTenure,
      avgClassesCompleted,
      totalRefundedINR,
      totalReferrals,
      acceptedReferrals,
      pendingReferrals,
      referralsByChannel
    });
  }, [month, rawData]);

  return {
    loading, error, funnelData, analyticsData, availableMonths,
    month, setMonth, rawData
  };
}

function buildBreakdown(total, leadSet, trialScheduledSet, trialPendingIds, trialDoneIds, paymentPendingIds, enrolledIds, futureScheduledIds) {
  const ids = [...leadSet];
  return {
    total,
    // Schedule Pending: no trial, no future scheduled, not enrolled
    notScheduled: ids.filter(id => !trialScheduledSet.has(id) && !futureScheduledIds.has(id) && !enrolledIds.has(id)).length,
    futureScheduled: ids.filter(id => futureScheduledIds.has(id)).length,
    // Trial Scheduled: has a trial record (any non-future state)
    scheduled: ids.filter(id => trialScheduledSet.has(id)).length,
    // Trial Pending: trial scheduled but not DONE
    trialPending: ids.filter(id => trialPendingIds.has(id)).length,
    // Trial Done: trial conducted (DONE)
    trialDone: ids.filter(id => trialDoneIds.has(id)).length,
    // Payment Pending: trial done, no payment
    paymentPending: ids.filter(id => paymentPendingIds.has(id)).length,
    // Enrolled: payment made
    enrolled: ids.filter(id => enrolledIds.has(id)).length,
  };
}
