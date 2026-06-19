import React, { useState } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, AlertTriangle, ShieldAlert } from 'lucide-react';

function CrimeHeatmap({ activeFilter = 'All' }) {
  const [zoomScale, setZoomScale] = useState(1);
  const [hoveredDistrict, setHoveredDistrict] = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState(null);

  // Mock district geometries & stats
  const districts = [
    {
      id: 'bengaluru',
      name: 'Bengaluru Urban',
      points: '240,320 280,310 300,340 270,360 250,350',
      center: { x: 270, y: 335 },
      firCount: 2210,
      solvedCount: 1420,
      activeCases: 790,
      severity: 'Critical',
      hotspots: [
        { name: 'Rajajinagar Precinct', level: 'Critical', incidents: 420 },
        { name: 'Koramangala Snatching Zone', level: 'High', incidents: 310 }
      ]
    },
    {
      id: 'mysuru',
      name: 'Mysuru',
      points: '190,360 230,350 240,380 200,400 180,380',
      center: { x: 210, y: 375 },
      firCount: 640,
      solvedCount: 480,
      activeCases: 160,
      severity: 'High',
      hotspots: [
        { name: 'Devaraja Market Cluster', level: 'High', incidents: 190 }
      ]
    },
    {
      id: 'hubballi',
      name: 'Hubballi-Dharwad',
      points: '120,180 160,170 170,200 140,220 110,210',
      center: { x: 140, y: 195 },
      firCount: 450,
      solvedCount: 390,
      activeCases: 60,
      severity: 'Medium',
      hotspots: [
        { name: 'Gokul Road Junction', level: 'Medium', incidents: 85 }
      ]
    },
    {
      id: 'mangaluru',
      name: 'Mangaluru',
      points: '90,290 130,280 140,310 110,330 80,310',
      center: { x: 110, y: 305 },
      firCount: 320,
      solvedCount: 290,
      activeCases: 30,
      severity: 'Medium',
      hotspots: [
        { name: 'Hampankatta Commercial Area', level: 'Medium', incidents: 64 }
      ]
    },
    {
      id: 'belagavi',
      name: 'Belagavi',
      points: '90,100 140,90 150,130 110,150 80,130',
      center: { x: 115, y: 120 },
      firCount: 290,
      solvedCount: 250,
      activeCases: 40,
      severity: 'Low',
      hotspots: []
    },
    {
      id: 'kalaburagi',
      name: 'Kalaburagi',
      points: '220,50 270,40 280,80 250,100 210,90',
      center: { x: 245, y: 70 },
      firCount: 210,
      solvedCount: 190,
      activeCases: 20,
      severity: 'Low',
      hotspots: []
    }
  ];

  const handleZoomIn = () => setZoomScale(prev => Math.min(prev + 0.25, 2.5));
  const handleZoomOut = () => setZoomScale(prev => Math.max(prev - 0.25, 0.75));
  const handleReset = () => {
    setZoomScale(1);
    setSelectedDistrict(null);
  };

  const getSeverityClass = (severity) => {
    switch (severity) {
      case 'Critical': return 'level-critical';
      case 'High': return 'level-high';
      case 'Medium': return 'level-medium';
      default: return 'level-low';
    }
  };

  const activeDistrict = hoveredDistrict || selectedDistrict || districts[0];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '20px', height: '100%', minHeight: '400px' }}>
      
      {/* Map Canvas */}
      <div style={{
        position: 'relative',
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: '12px',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {/* Controls Overlay */}
        <div style={{
          position: 'absolute',
          top: '12px',
          left: '12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          zIndex: 10
        }}>
          <button onClick={handleZoomIn} className="btn btn-secondary" style={{ width: '32px', height: '32px', padding: 0 }} title="Zoom In">
            <ZoomIn size={14} />
          </button>
          <button onClick={handleZoomOut} className="btn btn-secondary" style={{ width: '32px', height: '32px', padding: 0 }} title="Zoom Out">
            <ZoomOut size={14} />
          </button>
          <button onClick={handleReset} className="btn btn-secondary" style={{ width: '32px', height: '32px', padding: 0 }} title="Reset View">
            <RotateCcw size={14} />
          </button>
        </div>

        {/* Dynamic Legend Overlay */}
        <div style={{
          position: 'absolute',
          bottom: '12px',
          left: '12px',
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: '8px',
          padding: '8px 12px',
          fontSize: '10px',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
          zIndex: 10
        }}>
          <div style={{ fontWeight: 'bold', color: 'var(--color-text-secondary)', textTransform: 'uppercase', marginBottom: '2px' }}>Incident Heat</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '2px', backgroundColor: 'rgba(239, 68, 68, 0.5)' }}></span>
            <span>Critical (&gt; 1,000 cases)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '2px', backgroundColor: 'rgba(234, 88, 12, 0.4)' }}></span>
            <span>High (500 - 1,000 cases)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '2px', backgroundColor: 'rgba(245, 158, 11, 0.3)' }}></span>
            <span>Medium (250 - 500 cases)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '2px', backgroundColor: 'rgba(16, 185, 129, 0.2)' }}></span>
            <span>Low (&lt; 250 cases)</span>
          </div>
        </div>

        {/* SVG Drawing Canvas */}
        <svg 
          viewBox="50 20 300 400"
          className="heatmap-svg"
          style={{
            transform: `scale(${zoomScale})`,
            transformOrigin: 'center center'
          }}
        >
          {/* Subtle connecting tactical lines */}
          <line x1="115" y1="120" x2="140" y2="195" stroke="var(--color-border)" strokeDasharray="3,3" />
          <line x1="140" y1="195" x2="110" y2="305" stroke="var(--color-border)" strokeDasharray="3,3" />
          <line x1="110" y1="305" x2="210" y2="375" stroke="var(--color-border)" strokeDasharray="3,3" />
          <line x1="210" y1="375" x2="270" y2="335" stroke="var(--color-border)" strokeDasharray="3,3" />
          <line x1="140" y1="195" x2="245" y2="70" stroke="var(--color-border)" strokeDasharray="3,3" />

          {/* District Polygons */}
          {districts.map(dist => (
            <polygon
              key={dist.id}
              points={dist.points}
              className={`heatmap-district ${getSeverityClass(dist.severity)}`}
              onClick={() => setSelectedDistrict(dist)}
              onMouseEnter={() => setHoveredDistrict(dist)}
              onMouseLeave={() => setHoveredDistrict(null)}
              style={{
                strokeWidth: selectedDistrict?.id === dist.id ? 2 : 1,
                stroke: selectedDistrict?.id === dist.id ? 'var(--color-secondary-light)' : 'var(--color-border)'
              }}
            />
          ))}

          {/* Pulsating Hotspot Pins */}
          {districts.map(dist => {
            if (dist.severity === 'Critical' || dist.severity === 'High') {
              return (
                <g key={`pin-${dist.id}`}>
                  <circle
                    cx={dist.center.x}
                    cy={dist.center.y}
                    r="8"
                    fill={dist.severity === 'Critical' ? 'rgba(239, 68, 68, 0.4)' : 'rgba(234, 88, 12, 0.4)'}
                  >
                    <animate
                      attributeName="r"
                      values="6;16;6"
                      dur="2s"
                      repeatCount="indefinite"
                    />
                    <animate
                      attributeName="opacity"
                      values="0.8;0.2;0.8"
                      dur="2s"
                      repeatCount="indefinite"
                    />
                  </circle>
                  <circle
                    cx={dist.center.x}
                    cy={dist.center.y}
                    r="3"
                    fill={dist.severity === 'Critical' ? '#EF4444' : '#EA580C'}
                  />
                </g>
              );
            }
            return null;
          })}

          {/* District Text Labels */}
          {districts.map(dist => (
            <text
              key={`label-${dist.id}`}
              x={dist.center.x}
              y={dist.center.y - 12}
              fill="var(--color-text-primary)"
              fontSize="7px"
              fontWeight="bold"
              textAnchor="middle"
              pointerEvents="none"
              style={{ textShadow: '0 1px 2px var(--color-bg)' }}
            >
              {dist.name}
            </text>
          ))}
        </svg>
      </div>

      {/* Detail Card Inspector (Right) */}
      <div style={{
        backgroundColor: 'var(--color-surface)',
        backdropFilter: 'blur(8px)',
        border: '1px solid var(--color-border)',
        borderRadius: '12px',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        maxHeight: '400px',
        overflowY: 'auto'
      }}>
        <div>
          <h3 style={{ 
            fontSize: '12px', 
            color: 'var(--color-text-secondary)', 
            textTransform: 'uppercase', 
            borderBottom: '1px solid var(--color-border)', 
            paddingBottom: '8px', 
            marginBottom: '16px',
            fontWeight: 'bold',
            letterSpacing: '1px'
          }}>
            District Threat Analyst
          </h3>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: activeDistrict.severity === 'Critical' ? '#EF4444' : activeDistrict.severity === 'High' ? '#EA580C' : '#F59E0B'
            }}></span>
            <strong style={{ fontSize: '15px', color: 'var(--color-text-primary)' }}>{activeDistrict.name}</strong>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '8px', borderRadius: '6px', border: '1px solid var(--color-border)' }}>
              <div style={{ fontSize: '9px', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>Active Cases</div>
              <strong style={{ fontSize: '14px', color: 'var(--color-text-primary)' }}>{activeDistrict.activeCases}</strong>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '8px', borderRadius: '6px', border: '1px solid var(--color-border)' }}>
              <div style={{ fontSize: '9px', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>Solved Rate</div>
              <strong style={{ fontSize: '14px', color: 'var(--color-success)' }}>
                {Math.round((activeDistrict.solvedCount / activeDistrict.firCount) * 100)}%
              </strong>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 10px', background: activeDistrict.severity === 'Critical' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245,158,11,0.06)', border: `1px solid ${activeDistrict.severity === 'Critical' ? 'rgba(239,68,68,0.2)' : 'rgba(245,158,11,0.1)'}`, borderRadius: '6px', marginBottom: '16px' }}>
            {activeDistrict.severity === 'Critical' ? <ShieldAlert size={14} color="#EF4444" /> : <AlertTriangle size={14} color="#EA580C" />}
            <span style={{ fontSize: '11px', fontWeight: 'bold', color: activeDistrict.severity === 'Critical' ? '#EF4444' : '#EA580C' }}>
              Threat Index: {activeDistrict.severity}
            </span>
          </div>

          {activeDistrict.hotspots.length > 0 ? (
            <div>
              <div style={{ fontSize: '10px', color: 'var(--color-text-secondary)', textTransform: 'uppercase', fontWeight: 'bold', marginBottom: '8px', letterSpacing: '0.5px' }}>Top Hotspot Clusters:</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {activeDistrict.hotspots.map((hs, idx) => (
                  <div key={idx} style={{ padding: '8px 10px', background: 'rgba(255,255,255,0.02)', borderLeft: '3px solid var(--color-secondary-light)', borderRadius: '0 6px 6px 0', fontSize: '11.5px' }}>
                    <div style={{ fontWeight: '600', color: 'var(--color-text-primary)' }}>{hs.name}</div>
                    <div style={{ fontSize: '10px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>{hs.incidents} late night snatching files</div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ fontSize: '11px', fontStyle: 'italic', color: 'var(--color-text-secondary)', textAlign: 'center', padding: '20px 0' }}>
              No critical hotspot clusters registered in database.
            </div>
          )}
        </div>

        <div style={{ fontSize: '9px', color: 'var(--color-text-secondary)', borderTop: '1px solid var(--color-border)', paddingTop: '8px', marginTop: '16px' }}>
          Select or hover over districts on map layout to display police records.
        </div>
      </div>

    </div>
  );
}

export default CrimeHeatmap;
