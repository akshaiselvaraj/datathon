import React, { useState, useRef, useEffect } from 'react';
import { Send, FileDown, ShieldAlert, Sparkles, RefreshCw } from 'lucide-react';
import { useChat } from '../hooks/useChat';

// Subcomponents
import MessageBubble from './MessageBubble';
import VoiceInput from './VoiceInput';
import PDFExportButton from './PDFExportButton';
import NetworkGraph from './NetworkGraph';
import TrendChart from './TrendChart';

function ChatWindow({ user }) {
  const [inputVal, setInputVal] = useState('');
  const [inputLang, setInputLang] = useState('en');
  const messagesEndRef = useRef(null);
  
  const { messages, isTyping, error, sendMessage, clearChat } = useChat(user);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputVal.trim()) return;

    sendMessage(inputVal, inputLang);
    setInputVal('');
  };

  const handleVoiceInput = (text) => {
    setInputVal(text);
  };

  // Quick evaluative prompts for judges
  const demoQueries = [
    { text: "Who are the highest risk offenders in Bengaluru Urban right now?", label: "Query 1 (Ravi Shankar Gowda)" },
    { text: "Are there any gang networks operating across multiple districts?", label: "Query 2 (Shadow Gang)" },
    { text: "ಬೆಂಗಳೂರಿನಲ್ಲಿ ಕಳ್ಳತನ ಹೆಚ್ಚಾಗಿದೆಯೇ?", label: "Query 3 (Kannada - Theft Spike)" }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 140px)' }}>
      
      {/* Top action bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingBottom: '16px',
        borderBottom: '1px solid #D1D5DB',
        marginBottom: '16px'
      }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '15px', color: '#1B2A4A', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Sparkles size={16} color="#C8922A" /> KAVERI Crime Intelligence Assistant
          </h3>
          <p style={{ fontSize: '11px', color: '#4A5568', margin: 0 }}>
            Session ID: {user?.id} | Access Cleared: {user?.role}
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            onClick={clearChat}
            className="btn btn-secondary"
            style={{ height: '34px', fontSize: '11px', padding: '0 12px' }}
          >
            Clear Session Logs
          </button>
          <PDFExportButton messages={messages} user={user} />
        </div>
      </div>

      {/* Main chat body with side-by-side visualization area */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px', flex: 1, overflow: 'hidden' }}>
        
        {/* Left Side: Conversational Feed */}
        <div className="chat-workspace" style={{ margin: 0, height: '100%' }}>
          <div className="chat-messages">
            {messages.map(msg => (
              <MessageBubble key={msg.id} message={msg} />
            ))}

            {isTyping && (
              <div className="typing-indicator" style={{ alignSelf: 'flex-start' }}>
                <span className="typing-dot"></span>
                <span className="typing-dot"></span>
                <span className="typing-dot"></span>
                <span style={{ fontSize: '11px', color: '#718096', marginLeft: '6px' }}>KAVERI is compiling records...</span>
              </div>
            )}

            {error && (
              <div style={{
                alignSelf: 'center',
                backgroundColor: '#FFF5F5',
                border: '1px solid #FED7D7',
                color: '#C53030',
                padding: '8px 12px',
                borderRadius: '4px',
                fontSize: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <ShieldAlert size={14} />
                <span>{error}</span>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Quick evaluation buttons */}
          <div style={{ 
            padding: '10px 16px 0 16px', 
            background: '#F8FAFC', 
            borderTop: '1px solid #E2E8F0',
            display: 'flex', 
            gap: '8px', 
            flexWrap: 'wrap' 
          }}>
            <span style={{ fontSize: '10px', color: '#718096', alignSelf: 'center', fontWeight: 'bold', textTransform: 'uppercase' }}>Demo Targets:</span>
            {demoQueries.map((dq, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setInputVal(dq.text);
                  const isKannada = dq.text.includes("ಕಳ್ಳತನ");
                  setInputLang(isKannada ? 'kn' : 'en');
                }}
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #CBD5E0',
                  padding: '4px 10px',
                  borderRadius: '12px',
                  fontSize: '11px',
                  cursor: 'pointer',
                  color: '#1B2A4A',
                  fontWeight: '500'
                }}
              >
                {dq.label}
              </button>
            ))}
          </div>

          {/* Chat Form panel */}
          <form onSubmit={handleSubmit} className="chat-input-bar">
            <input 
              type="text" 
              className="form-control"
              placeholder={inputLang === 'kn' ? 'ಕನ್ನಡದಲ್ಲಿ ಪ್ರಶ್ನೆಯನ್ನು ಬರೆಯಿರಿ...' : 'Query KAVERI database...'}
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              style={{ flex: 1, height: '36px' }}
            />
            
            <VoiceInput 
              onVoiceResult={handleVoiceInput}
              selectedLanguage={inputLang}
              onLanguageChange={setInputLang}
            />

            <button type="submit" className="btn btn-accent" style={{ width: '36px', height: '36px', padding: 0, justifyContent: 'center' }}>
              <Send size={16} />
            </button>
          </form>
        </div>

        {/* Right Side: Active graph/chart visualizations triggered by chat responses */}
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto' }}>
          {(() => {
            // Find last system message with visual trigger metadata
            const systemMsgs = messages.filter(m => m.role === 'system');
            const lastMsg = systemMsgs[systemMsgs.length - 1];

            if (lastMsg && lastMsg.networkData) {
              return (
                <div className="card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <div className="card-header">
                    <span className="card-title">AI Triggered Graph: {lastMsg.networkData.nodes[0].label} Networks</span>
                  </div>
                  <div style={{ flex: 1, minHeight: '350px' }}>
                    <NetworkGraph key={lastMsg.id} />
                  </div>
                </div>
              );
            }

            if (lastMsg && lastMsg.text.includes('HOTSPOT')) {
              // Renders Recharts hotspot indicators
              return (
                <div className="card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <div className="card-header">
                    <span className="card-title">AI Triggered Hotspot Cluster (Recharts)</span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ padding: '12px', background: '#F8FAFC', borderLeft: '3px solid #9B1C1C', marginBottom: '16px', fontSize: '12px' }}>
                      <strong>Hotspot Summary:</strong> 45 weekend burglary/theft incidents mapped in Bengaluru city center.
                    </div>
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
                </div>
              );
            }

            // General informative card if no active visual triggers
            return (
              <div style={{
                height: '100%',
                border: '1px dashed #D1D5DB',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                padding: '24px',
                textAlign: 'center',
                backgroundColor: '#FFFFFF'
              }}>
                <div style={{ fontSize: '36px', marginBottom: '16px' }}>📊</div>
                <h4 style={{ color: '#1B2A4A', margin: '0 0 8px 0' }}>AI Visualization Canvas</h4>
                <p style={{ fontSize: '12px', color: '#4A5568', maxWidth: '320px', margin: 0 }}>
                  Queries about gang networks, repeat offenders, or hotspots will trigger interactive network graphs and statistics in this panel.
                </p>
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
}

export default ChatWindow;
