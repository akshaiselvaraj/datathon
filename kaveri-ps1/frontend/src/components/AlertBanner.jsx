import React from 'react';
import { AlertOctagon, CheckCircle2 } from 'lucide-react';

function AlertBanner({ alerts = [], onAcknowledge }) {
  // Find the first unacknowledged critical or high alert
  const activeAlert = alerts.find(a => String(a.acknowledged) === 'False');

  if (!activeAlert) return null;

  const isCritical = activeAlert.severity === 'Critical';

  return (
    <div className={`alert-banner ${isCritical ? '' : 'high'}`}>
      <div className="alert-banner-content">
        <AlertOctagon size={20} color={isCritical ? '#9B1C1C' : '#C8922A'} />
        <div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span className={`alert-severity-badge ${isCritical ? '' : 'high'}`}>
              {activeAlert.severity}
            </span>
            <strong style={{ color: isCritical ? 'var(--color-danger)' : 'var(--color-warning)' }}>
              Anomaly Detected: {activeAlert.alert_type} ({activeAlert.district})
            </strong>
          </div>
          <p style={{ fontSize: '12.5px', color: 'var(--color-text-primary)', marginTop: '4px', lineHeight: '1.4' }}>
            {activeAlert.description}
          </p>
        </div>
      </div>
      <button 
        className="btn btn-secondary btn-accent" 
        onClick={() => onAcknowledge(activeAlert.alert_id)}
        style={{ height: '30px', padding: '0 10px', fontSize: '11px', flexShrink: 0, marginLeft: '16px' }}
      >
        <CheckCircle2 size={12} /> Dismiss
      </button>
    </div>
  );
}

export default AlertBanner;
