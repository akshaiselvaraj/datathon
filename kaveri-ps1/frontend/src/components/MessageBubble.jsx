import React from 'react';

function MessageBubble({ message }) {
  const { role, text, citations = [] } = message;
  const isUser = role === 'user';

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
    // Check if line contains PATTERN DETECTED
    let highlightedStr = str;
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

    // Highlighting PATTERN DETECTED:
    if (typeof finalParts[0] === 'string' && finalParts[0].startsWith('PATTERN DETECTED:')) {
      return (
        <span style={{ display: 'block', backgroundColor: '#FFFDF5', borderLeft: '3px solid #C8922A', padding: '6px 10px', margin: '8px 0', fontWeight: '500' }}>
          <span style={{ color: '#C8922A', fontWeight: 'bold' }}>PATTERN DETECTED:</span>
          {finalParts[0].replace('PATTERN DETECTED:', '')}
          {finalParts.slice(1)}
        </span>
      );
    }

    return finalParts;
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
            <span key={cit} className="citation-tag">{cit}</span>
          ))}
        </div>
      )}
    </div>
  );
}

export default MessageBubble;
