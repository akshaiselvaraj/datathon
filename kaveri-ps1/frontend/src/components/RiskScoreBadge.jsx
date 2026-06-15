import React from 'react';

function RiskScoreBadge({ score }) {
  const numScore = parseFloat(score) || 0;
  
  let band = 'Low';
  let className = 'risk-low';
  
  if (numScore > 80) {
    band = 'Critical';
    className = 'risk-critical';
  } else if (numScore > 60) {
    band = 'High';
    className = 'risk-high';
  } else if (numScore > 30) {
    band = 'Medium';
    className = 'risk-medium';
  }

  return (
    <span className={`risk-badge ${className}`} title={`Score: ${numScore}%`}>
      {numScore}% - {band}
    </span>
  );
}

export default RiskScoreBadge;
