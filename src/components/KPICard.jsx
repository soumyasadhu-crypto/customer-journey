import { FiTrendingUp, FiTrendingDown } from 'react-icons/fi';

export default function KPICard({ label, value, trend, icon: Icon, colorClass }) {
  const formatValue = (val) => {
    if (typeof val === 'number') {
      if (val >= 1000000) {
        return (val / 1000000).toFixed(1) + 'M';
      }
      if (val >= 1000) {
        return (val / 1000).toFixed(1) + 'K';
      }
      if (label.includes('Rate')) {
        return val.toFixed(2) + '%';
      }
      if (label.includes('Revenue')) {
        return '$' + val.toLocaleString();
      }
      return val.toLocaleString();
    }
    return val;
  };

  const isPositive = trend > 0;
  const TrendIcon = isPositive ? FiTrendingUp : FiTrendingDown;

  return (
    <div className="kpi-card">
      <div className="kpi-header">
        <span className="kpi-label">{label}</span>
        <div className={`kpi-icon ${colorClass}`}>
          <Icon />
        </div>
      </div>
      <div className="kpi-value">{formatValue(value)}</div>
      <div className={`kpi-trend ${isPositive ? 'up' : 'down'}`}>
        <TrendIcon />
        <span>{isPositive ? '+' : ''}{trend}% vs last period</span>
      </div>
    </div>
  );
}
