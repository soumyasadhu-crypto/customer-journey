export const funnelStages = [
  {
    id: 1,
    name: 'Awareness',
    visitors: 24580,
    conversionRate: 100,
    revenue: 0,
    avgTimeInStage: '2:34',
    color: '#3B82F6'
  },
  {
    id: 2,
    name: 'Interest',
    visitors: 12450,
    conversionRate: 50.7,
    revenue: 0,
    avgTimeInStage: '4:12',
    color: '#8B5CF6'
  },
  {
    id: 3,
    name: 'Consideration',
    visitors: 6280,
    conversionRate: 50.4,
    revenue: 0,
    avgTimeInStage: '6:45',
    color: '#EC4899'
  },
  {
    id: 4,
    name: 'Intent',
    visitors: 2190,
    conversionRate: 34.9,
    revenue: 0,
    avgTimeInStage: '3:22',
    color: '#F59E0B'
  },
  {
    id: 5,
    name: 'Enrollment',
    visitors: 876,
    conversionRate: 40.0,
    revenue: 175200,
    avgTimeInStage: '1:48',
    color: '#10B981'
  }
];

export const kpiData = {
  totalVisitors: 24580,
  totalVisitorsTrend: 12.5,
  totalLeads: 876,
  totalLeadsTrend: 8.3,
  conversionRate: 3.56,
  conversionRateTrend: -2.1,
  revenue: 175200,
  revenueTrend: 15.7
};

export const dateRangeOptions = [
  { value: 'today', label: 'Today' },
  { value: '7days', label: 'Last 7 Days' },
  { value: '30days', label: 'Last 30 Days' },
  { value: 'thismonth', label: 'This Month' },
  { value: 'lastmonth', label: 'Last Month' },
  { value: 'custom', label: 'Custom' }
];
