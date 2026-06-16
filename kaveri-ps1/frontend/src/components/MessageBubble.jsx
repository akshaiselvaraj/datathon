import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

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
            color: '#1B2A4A', 
            margin: '12px 0 6px 0', 
            fontSize: '13px', 
            fontWeight: 'bold',
            borderBottom: '1px solid #E2E8F0',
            paddingBottom: '4px'
          }}>
            {trimmed.replace(/###/g, '').trim()}
          </h4>
        );
      }

      // Check for bullets
      if (trimmed.startsWith('-') || trimmed.startsWith('*')) {
        let content = trimmed.substring(1).trim();
        // Bold formatting **text**
        return (
          <li key={idx} style={{ marginLeft: '16px', marginBottom: '4px', listStyleType: 'disc' }}>
            {parseBoldText(content)}
          </li>
        );
      }

      // Standard text with bold parsing
      return (
        <p key={idx} style={{ marginBottom: '8px', fontSize: '13px', lineHeight: '1.5' }}>
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
      // Add text before match
      if (match.index > lastIndex) {
        parts.push(str.substring(lastIndex, match.index));
      }
      // Add bold match
      parts.push(<strong key={match.index}>{match[1]}</strong>);
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
        <span style={{ display: 'block', backgroundColor: '#FFFDF5', borderLeft: '3px solid #C8922A', padding: '6px 10px', margin: '8px 0', fontWeight: '500' }}>
          <span style={{ color: '#C8922A', fontWeight: 'bold' }}>PATTERN DETECTED:</span>
          {linkedParts[0].replace('PATTERN DETECTED:', '')}
          {linkedParts.slice(1)}
        </span>
      );
    }

    return linkedParts;
  };

  return (
    <div className={`message-bubble ${isUser ? 'user' : 'system'}`}>
      {/* Sender Header */}
      <div style={{
        fontSize: '10px',
        color: isUser ? '#2B6CB0' : '#4A5568',
        fontWeight: 'bold',
        textTransform: 'uppercase',
        marginBottom: '6px',
        letterSpacing: '0.5px'
      }}>
        {isUser ? 'Investigator' : 'KAVERI Crime AI'}
      </div>

      {/* Message Text */}
      <div style={{ wordBreak: 'break-word' }}>
        {formatMessageText(text)}
      </div>

      {/* Citations Box for AI Response */}
      {!isUser && citations && citations.length > 0 && (
        <div className="citations-box">
          <strong>Based on FIR files: </strong>
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
