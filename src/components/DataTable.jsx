import { useState } from 'react';
import { FiDownload, FiChevronUp, FiChevronDown } from 'react-icons/fi';

const ROWS_PER_PAGE = 5;

export default function DataTable({ data, rawData, onStageClick }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const sortedData = [...data].sort((a, b) => {
    if (!sortConfig.key) return 0;
    const aVal = a[sortConfig.key];
    const bVal = b[sortConfig.key];
    if (typeof aVal === 'number') {
      return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
    }
    return sortConfig.direction === 'asc' 
      ? String(aVal).localeCompare(String(bVal))
      : String(bVal).localeCompare(String(aVal));
  });

  const totalPages = Math.ceil(sortedData.length / ROWS_PER_PAGE);
  const startIndex = (currentPage - 1) * ROWS_PER_PAGE;
  const paginatedData = sortedData.slice(startIndex, startIndex + ROWS_PER_PAGE);

  const handleExport = (stageName) => {
    if (!rawData?.leads) return;
    
    const trialMap = new Map();
    rawData.trials?.forEach(t => {
      if (t.student_id) trialMap.set(t.student_id, t);
    });
    const paidIds = new Set(rawData.payments?.map(p => p.student_id).filter(Boolean) || []);

    let filteredLeads = [];
    
    if (stageName === 'Leads') {
      filteredLeads = rawData.leads;
    } else if (stageName === 'Schedule Pending') {
      filteredLeads = rawData.leads.filter(l => l.student_id && !trialMap.has(l.student_id));
    } else if (stageName === 'Trial Scheduled') {
      filteredLeads = rawData.leads.filter(l => l.student_id && trialMap.has(l.student_id));
    } else if (stageName === 'Trial Pending') {
      filteredLeads = rawData.leads.filter(l => {
        const trial = trialMap.get(l.student_id);
        return trial && trial.demo_state !== 'DONE';
      });
    } else if (stageName === 'Trial Done') {
      filteredLeads = rawData.leads.filter(l => {
        const trial = trialMap.get(l.student_id);
        return trial && trial.demo_state === 'DONE';
      });
    } else if (stageName === 'Payment Pending') {
      filteredLeads = rawData.leads.filter(l => {
        const trial = trialMap.get(l.student_id);
        return trial && trial.demo_state === 'DONE' && !paidIds.has(l.student_id);
      });
    } else if (stageName === 'Enrolled') {
      filteredLeads = rawData.leads.filter(l => {
        const trial = trialMap.get(l.student_id);
        return trial && trial.demo_state === 'DONE' && paidIds.has(l.student_id);
      });
    }

    if (filteredLeads.length === 0) {
      alert(`No leads in ${stageName} stage`);
      return;
    }

    const headers = Object.keys(filteredLeads[0]);
    const rows = filteredLeads.map(row => headers.map(h => row[h]));
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${stageName.toLowerCase().replace(' ', '_')}_leads.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === 'asc' ? <FiChevronUp /> : <FiChevronDown />;
  };

  return (
    <div className="table-section">
      <div className="table-header">
        <h3 className="section-title" style={{marginBottom: 0}}>Funnel Stages Detail</h3>
        <span style={{fontSize: 12, color: '#64748B'}}>Click a stage to export leads</span>
      </div>
      <table className="data-table">
        <thead>
          <tr>
            <th onClick={() => handleSort('name')}>
              Stage <span className="sort-icon">{getSortIcon('name')}</span>
            </th>
            <th onClick={() => handleSort('visitors')}>
              Leads <span className="sort-icon">{getSortIcon('visitors')}</span>
            </th>
            <th>Export</th>
          </tr>
        </thead>
        <tbody>
          {paginatedData.map(stage => (
            <tr 
              key={stage.id} 
              onClick={() => onStageClick && onStageClick(stage.name)}
              style={{ cursor: onStageClick ? 'pointer' : 'default' }}
            >
              <td>
                <span style={{display: 'inline-block', width: 12, height: 12, borderRadius: 3, background: stage.color, marginRight: 8}} />
                {stage.name}
              </td>
              <td className="mono">{stage.visitors.toLocaleString()}</td>
              <td>
                <button 
                  className="export-btn" 
                  style={{ padding: '4px 8px', fontSize: 12 }}
                  onClick={(e) => { e.stopPropagation(); handleExport(stage.name); }}
                >
                  <FiDownload size={12} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="pagination">
        <div className="pagination-info">
          Showing {startIndex + 1}-{Math.min(startIndex + ROWS_PER_PAGE, sortedData.length)} of {sortedData.length} entries
        </div>
        <div className="pagination-controls">
          <button 
            className="pagination-btn"
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <button
              key={page}
              className={`pagination-btn ${currentPage === page ? 'active' : ''}`}
              onClick={() => setCurrentPage(page)}
            >
              {page}
            </button>
          ))}
          <button 
            className="pagination-btn"
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}