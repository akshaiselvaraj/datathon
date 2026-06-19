import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AlertCircle, ShieldAlert, BarChart3, MapPin, Network, UserCheck } from 'lucide-react';

// Subcomponents to render inline
import NetworkGraph from './NetworkGraph';
import TrendChart from './TrendChart';
import CrimeHeatmap from './CrimeHeatmap';

// Widget 1: Crime Statistics Card
function CrimeStatsCard({ total = 10, solved = 5, active = 3, repeat = 2 }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: '12px',
      marginTop: '16px',
      padding: '16px',
      background: 'rgba(255, 255, 255, 0.02)',
      border: '1px solid var(--color-border)',
      borderRadius: '14px',
      boxShadow: 'var(--shadow-sm)'
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '9px', color: 'var(--color-text-secondary)', textTransform: 'uppercase', fontWeight: 'bold', letterSpacing: '0.5px' }}>Total Crimes</div>
        <div style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--color-text-primary)', marginTop: '4px' }}>{total}</div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '9px', color: 'var(--color-text-secondary)', textTransform: 'uppercase', fontWeight: 'bold', letterSpacing: '0.5px' }}>Solved Cases</div>
        <div style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--color-success)', marginTop: '4px' }}>{solved}</div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '9px', color: 'var(--color-text-secondary)', textTransform: 'uppercase', fontWeight: 'bold', letterSpacing: '0.5px' }}>Active cases</div>
        <div style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--color-danger)', marginTop: '4px' }}>{active}</div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '9px', color: 'var(--color-text-secondary)', textTransform: 'uppercase', fontWeight: 'bold', letterSpacing: '0.5px' }}>Repeat suspects</div>
        <div style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--color-warning)', marginTop: '4px' }}>{repeat}</div>
      </div>
    </div>
  );
}

// Widget 2: Behavioral Analysis Card
function BehavioralCard({ score = 75, threat = 'High', recidivism = '70%', insights = [] }) {
  return (
    <div style={{
      marginTop: '16px',
      padding: '16px',
      background: 'rgba(255, 255, 255, 0.02)',
      border: '1px solid var(--color-border)',
      borderRadius: '14px',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '8px' }}>
        <span style={{ fontSize: '10px', color: 'var(--color-text-secondary)', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Behavioral Profiler</span>
        <span style={{ 
          fontSize: '9px', 
          backgroundColor: threat === 'Critical' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(245, 158, 11, 0.15)', 
          color: threat === 'Critical' ? '#EF4444' : '#F59E0B', 
          padding: '2px 8px', 
          borderRadius: '4px',
          fontWeight: 'bold',
          textTransform: 'uppercase'
        }}>{threat} Threat Level</span>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '16px', alignItems: 'center' }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', marginBottom: '4px' }}>
            <span style={{ color: 'var(--color-text-secondary)' }}>Model Risk Score:</span>
            <strong style={{ color: 'var(--color-text-primary)' }}>{score}%</strong>
          </div>
          <div style={{ height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{ width: `${score}%`, height: '100%', background: 'linear-gradient(to right, #F59E0B, #EF4444)', borderRadius: '3px' }}></div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', marginTop: '10px' }}>
            <span style={{ color: 'var(--color-text-secondary)' }}>Recidivism Prob:</span>
            <strong style={{ color: 'var(--color-text-primary)' }}>{recidivism}</strong>
          </div>
        </div>
        
        <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', display: 'flex', flexDirection: 'column', gap: '4px', borderLeft: '1px solid rgba(255,255,255,0.06)', paddingLeft: '12px' }}>
          <strong style={{ color: 'var(--color-secondary-light)', fontSize: '10px', textTransform: 'uppercase' }}>Insights:</strong>
          {insights.map((ins, idx) => (
            <div key={idx} style={{ display: 'flex', gap: '4px', alignItems: 'flex-start' }}>
              <span>•</span>
              <span>{ins}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ message }) {
  const { role, text, citations = [] } = message;
  const isUser = role === 'user';
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const parseEntityLinks = (str) => {
    if (typeof str !== 'string') return str;
    
    const regex = /(FIR-[A-Z0-9-]+|ACC-[A-Z0-9-]+)/g;
    const parts = str.split(regex);
    if (parts.length === 1) return str;
    
    return parts.map((part, index) => {
      if (part.match(/^FIR-[A-Z0-9-]+$/)) {
        return (
          <span 
            key={index} 
            className="chat-entity-link" 
            onClick={() => navigate(`/case/${part}`)}
          >
            {part}
          </span>
        );
      }
      if (part.match(/^ACC-[A-Z0-9-]+$/)) {
        return (
          <span 
            key={index} 
            className="chat-entity-link" 
            onClick={() => {
              setSearchParams({ tab: 'Offender Profiles', search: part });
            }}
          >
            {part}
          </span>
        );
      }
      return part;
    });
  };

  // Format text into HTML paragraphs and bold patterns
  const formatMessageText = (rawText) => {
    if (!rawText) return '';
    
    // Split by lines
    const lines = rawText.split('\n');
    return lines.map((line, idx) => {
      let trimmed = line.trim();
      if (!trimmed) return <div key={idx} style={{ height: '8px' }}></div>;

      // Check for headers (e.g. ### Header)
      if (trimmed.startsWith('###')) {
        return (
          <h4 key={idx} style={{ 
            color: 'var(--color-primary)', 
            margin: '16px 0 8px 0', 
            fontSize: '14px', 
            fontWeight: 'bold',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
            paddingBottom: '4px'
          }}>
            {trimmed.replace(/###/g, '').trim()}
          </h4>
        );
      }

      // Check for bullets
      if (trimmed.startsWith('-') || trimmed.startsWith('*')) {
        let content = trimmed.substring(1).trim();
        return (
          <li key={idx} style={{ marginLeft: '16px', marginBottom: '6px', listStyleType: 'disc', color: 'var(--color-text-primary)' }}>
            {parseBoldText(content)}
          </li>
        );
      }

      // Standard text with bold parsing
      return (
        <p key={idx} style={{ marginBottom: '8px', fontSize: '13px', lineHeight: '1.6', color: 'var(--color-text-primary)' }}>
          {parseBoldText(trimmed)}
        </p>
      );
    });
  };

  // Helper to parse **bold** text in lines
  const parseBoldText = (str) => {
    const parts = [];
    const regex = /\*\*(.*?)\*\*/g;
    
    let lastIndex = 0;
    let match;
    
    while ((match = regex.exec(str)) !== null) {
      if (match.index > lastIndex) {
        parts.push(str.substring(lastIndex, match.index));
      }
      parts.push(<strong key={match.index} style={{ color: 'var(--color-text-primary)' }}>{match[1]}</strong>);
      lastIndex = regex.lastIndex;
    }
    
    if (lastIndex < str.length) {
      parts.push(str.substring(lastIndex));
    }

    const finalParts = parts.length > 0 ? parts : [str];

    // Wrap elements with entity links
    const linkedParts = finalParts.flatMap((part, idx) => {
      if (typeof part === 'string') {
        return parseEntityLinks(part);
      }
      if (React.isValidElement(part) && typeof part.props.children === 'string') {
        const parsedChildren = parseEntityLinks(part.props.children);
        return React.cloneElement(part, { key: idx }, parsedChildren);
      }
      return part;
    });

    // Highlighting PATTERN DETECTED:
    if (linkedParts.length > 0 && typeof linkedParts[0] === 'string' && linkedParts[0].startsWith('PATTERN DETECTED:')) {
      return (
        <span style={{ 
          display: 'block', 
          backgroundColor: 'rgba(245, 158, 11, 0.08)', 
          borderLeft: '4px solid var(--color-warning)', 
          padding: '10px 14px', 
          margin: '12px 0', 
          borderRadius: '0 8px 8px 0',
          fontWeight: '500' 
        }}>
          <span style={{ color: 'var(--color-warning)', fontWeight: 'bold' }}>PATTERN DETECTED:</span>
          {linkedParts[0].replace('PATTERN DETECTED:', '')}
          {linkedParts.slice(1)}
        </span>
      );
    }

    return linkedParts;
  };

  // Widget trigger checks based on text triggers
  const renderInlineWidgets = () => {
    if (isUser) return null;

    const lowerText = text.toLowerCase();
    
    // Trigger 1: Ravi Shankar Gowda (Highest Risk Suspect)
    if (lowerText.includes('gowda') || lowerText.includes('highest risk')) {
      return (
        <div style={{ marginTop: '16px', borderTop: '1px dashed rgba(255,255,255,0.08)', paddingTop: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--color-accent-blue)', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '8px' }}>
            <Network size={12} />
            <span>Co-Accused Graph & Risk Dossier</span>
          </div>
          
          {/* Crime Statistics Widget */}
          <CrimeStatsCard total={9} solved={0} active={3} repeat={1} />
          
          {/* Behavioral Analysis Widget */}
          <BehavioralCard 
            score={94} 
            threat="Critical" 
            recidivism="89%" 
            insights={[
              "Weapons conviction priors",
              "Escalating violence patterns",
              "Bail conditions violation flags"
            ]}
          />

          {/* Inline D3 Force-Directed Network Graph */}
          <div style={{ marginTop: '12px', padding: '12px', background: 'rgba(9, 13, 26, 0.5)', border: '1px solid var(--color-border)', borderRadius: '14px', height: '360px', position: 'relative' }}>
            <NetworkGraph />
          </div>
        </div>
      );
    }

    // Trigger 2: Shadow Gang Network
    if (lowerText.includes('shadow') || lowerText.includes('gang')) {
      return (
        <div style={{ marginTop: '16px', borderTop: '1px dashed rgba(255,255,255,0.08)', paddingTop: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--color-secondary-light)', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '8px' }}>
            <Network size={12} />
            <span>Co-Accused Network Visualizer</span>
          </div>

          <CrimeStatsCard total={8} solved={0} active={8} repeat={5} />

          {/* D3 Network Graph */}
          <div style={{ marginTop: '12px', padding: '12px', background: 'rgba(9, 13, 26, 0.5)', border: '1px solid var(--color-border)', borderRadius: '14px', height: '360px', position: 'relative' }}>
            <NetworkGraph />
          </div>
        </div>
      );
    }

    // Trigger 3: Hotspots, Theft Trends, or Kannada Theft Query
    if (lowerText.includes('theft') || lowerText.includes('hotspot') || lowerText.includes('ಕಳ್ಳತನ') || lowerText.includes('burglary')) {
      return (
        <div style={{ marginTop: '16px', borderTop: '1px dashed rgba(255,255,255,0.08)', paddingTop: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--color-secondary-light)', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '8px' }}>
            <MapPin size={12} />
            <span>Geographic Heatmap & Snatching Trends</span>
          </div>

          <CrimeStatsCard total={45} solved={12} active={33} repeat={8} />

          {/* Recharts Snatching Trend Chart */}
          <div style={{ marginTop: '12px', padding: '16px', background: 'rgba(9, 13, 26, 0.3)', border: '1px solid var(--color-border)', borderRadius: '14px' }}>
            <div style={{ fontSize: '10px', color: 'var(--color-text-secondary)', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '8px' }}>Snatching incident distribution (Weekend hours)</div>
            <TrendChart 
              data={[
                { month: 'Fri 10PM', incidents: 8 },
                { month: 'Fri Midnight', incidents: 14 },
                { month: 'Sat 10PM', incidents: 10 },
                { month: 'Sat Midnight', incidents: 13 }
              ]} 
              type="bar" 
            />
          </div>

          {/* Karnataka Geographic Heatmap Widget */}
          <div style={{ marginTop: '12px', padding: '16px', background: 'rgba(9, 13, 26, 0.5)', border: '1px solid var(--color-border)', borderRadius: '14px' }}>
            <div style={{ fontSize: '10px', color: 'var(--color-text-secondary)', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '8px' }}>Incident Heatmap Inspector</div>
            <CrimeHeatmap />
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className={`message-bubble ${isUser ? 'user' : 'system'}`}>
      
      {/* Sender Header */}
      <div style={{
        fontSize: '10px',
        color: isUser ? 'var(--color-secondary-light)' : 'var(--color-accent-blue)',
        fontWeight: 'bold',
        textTransform: 'uppercase',
        marginBottom: '8px',
        letterSpacing: '1px',
        display: 'flex',
        alignItems: 'center',
        gap: '4px'
      }}>
        {isUser ? (
          <>
            <UserCheck size={11} />
            <span>Investigator Console</span>
          </>
        ) : (
          <>
            <Sparkles size={11} />
            <span>KAVERI Intelligence Assistant</span>
          </>
        )}
      </div>

      {/* Message Text */}
      <div style={{ wordBreak: 'break-word', fontSize: '13px', lineHeight: '1.6' }}>
        {formatMessageText(text)}
      </div>

      {/* Dynamic Crime Widgets */}
      {renderInlineWidgets()}

      {/* Citations Box for AI Response */}
      {!isUser && citations && citations.length > 0 && (
        <div className="citations-box">
          <strong style={{ color: 'var(--color-text-primary)' }}>RAG Cited FIR Database: </strong>
          {citations.map(cit => (
            <span 
              key={cit} 
              className="citation-tag"
              onClick={() => navigate(`/case/${cit}`)}
            >
              {cit}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export default MessageBubble;
