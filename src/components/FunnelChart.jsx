import { useState } from 'react';

export default function FunnelChart({ data, onStageClick }) {
  const [hoveredStage, setHoveredStage] = useState(null);
  const maxVisitors = data[0]?.visitors || 1;

  return (
    <div className="funnel-section">
      <h3 className="section-title">Customer Journey Funnel</h3>
      <div className="funnel-chart">
        {data.map((stage, index) => {
          const width = (stage.visitors / maxVisitors) * 100;

          return (
            <div 
              key={stage.id}
              className={`funnel-stage funnel-stage-${stage.id}`}
              onMouseEnter={() => setHoveredStage(stage.id)}
              onMouseLeave={() => setHoveredStage(null)}
              onClick={() => onStageClick && onStageClick(stage.name)}
              style={{ cursor: onStageClick ? 'pointer' : 'default' }}
            >
              <div 
                className="funnel-bar"
                style={{ 
                  minHeight: '80px',
                  width: `${Math.max(width, 30)}%`,
                  background: stage.color
                }}
              >
                <span>{stage.visitors.toLocaleString()}</span>
              </div>
              <div className="funnel-info">
                <div className="funnel-stage-name">{stage.name}</div>
                <div className="funnel-count">{stage.visitors.toLocaleString()} users</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}