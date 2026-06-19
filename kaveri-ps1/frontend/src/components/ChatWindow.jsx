import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, FileDown, ShieldAlert, Sparkles, RefreshCw, Paperclip, 
  Layers, Filter, FileText, Video, Folder, ChevronRight, PanelRightClose,
  PanelRight, Info, AlertTriangle, ShieldCheck
} from 'lucide-react';
import { useChat } from '../hooks/useChat';

// Subcomponents
import MessageBubble from './MessageBubble';
import VoiceInput from './VoiceInput';
import PDFExportButton from './PDFExportButton';

function ChatWindow({ user }) {
  const [inputVal, setInputVal] = useState('');
  const [inputLang, setInputLang] = useState('en');
  const [showEvidence, setShowEvidence] = useState(false);
  const [activeAgentStep, setActiveAgentStep] = useState(-1);
  const [agentStatusVisible, setAgentStatusVisible] = useState(false);
  
  // Tactical Filters State
  const [filters, setFilters] = useState({
    dateRange: '3months',
    district: 'All',
    crimeType: 'All',
    gender: 'All',
    ageGroup: 'All',
    socioEconomic: 'All'
  });

  const messagesEndRef = useRef(null);
  const { messages, isTyping, error, sendMessage, clearChat } = useChat(user);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Listener to clear chat session from New Investigation button click
  useEffect(() => {
    const handleClearChat = () => {
      clearChat();
      setActiveAgentStep(-1);
      setAgentStatusVisible(false);
    };
    window.addEventListener('clear-chat-session', handleClearChat);
    return () => window.removeEventListener('clear-chat-session', handleClearChat);
  }, [clearChat]);

  // AI Agent Status Pipeline simulation
  useEffect(() => {
    if (isTyping) {
      setAgentStatusVisible(true);
      setActiveAgentStep(0);
      
      const step1 = setTimeout(() => setActiveAgentStep(1), 700);
      const step2 = setTimeout(() => setActiveAgentStep(2), 1400);
      const step3 = setTimeout(() => setActiveAgentStep(3), 2100);
      
      return () => {
        clearTimeout(step1);
        clearTimeout(step2);
        clearTimeout(step3);
      };
    } else {
      setActiveAgentStep(-1);
      setAgentStatusVisible(false);
    }
  }, [isTyping]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputVal.trim()) return;

    sendMessage(inputVal, inputLang);
    setInputVal('');
  };

  const handleVoiceInput = (text) => {
    setInputVal(text);
  };

  const handleFileUpload = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      alert(`Attached file: ${e.target.files[0].name}. File scanned for cyber threats and uploaded to encrypted case vault.`);
    }
  };

  const suggestionQueries = [
    { text: "Who are the highest risk offenders in Bengaluru Urban right now?", label: "Highest Risk Suspects" },
    { text: "Are there any gang networks operating across multiple districts?", label: "Co-Accused Networks" },
    { text: "ಬೆಂಗಳೂರಿನಲ್ಲಿ ಕಳ್ಳತನ ಹೆಚ್ಚಾಗಿದೆಯೇ?", label: "ಕನ್ನಡ - Burglary Hotspots" },
    { text: "Explain burglary trends by district", label: "Burglary Trends" }
  ];

  // Dynamic Evidence gathering based on last chat topics
  const getDynamicEvidence = () => {
    const textHistory = messages.map(m => m.text.toLowerCase()).join(' ');
    
    if (textHistory.includes('shadow') || textHistory.includes('gang')) {
      return [
        { type: 'pdf', name: 'FIR-SHADOW-001_Burglary_Koramangala.pdf', details: 'Registered Under IPC 380 | Open' },
        { type: 'csv', name: 'Transaction_SHADOW-BANK-ACCT-777.csv', details: 'Linked Transfer details (INR 45,000)' },
        { type: 'cctv', name: 'CCTV_Rear_Exit_Koramangala_0402.mp4', details: 'Visual MO reference: window intrusion' },
        { type: 'pdf', name: 'Accused_Profiles_Shadow_Members.pdf', details: 'Criminal Dossiers ACC-SHADOW-001 to 005' }
      ];
    }
    
    if (textHistory.includes('gowda') || textHistory.includes('highrisk')) {
      return [
        { type: 'pdf', name: 'FIR-HIGHRISK-008_Assault_Rajajinagar.pdf', details: 'Registered Under IPC 307 | Open' },
        { type: 'pdf', name: 'Accused_Profile_Ravi_Shankar_Gowda.pdf', details: 'ID: ACC-HIGHRISK-001 | Risk Score: 94%' },
        { type: 'cctv', name: 'CCTV_Metro_Station_Pillar42.mp4', details: 'CCTV capture corresponding to incident timestamp' },
        { type: 'pdf', name: 'Priors_Audit_ACC-HIGHRISK-001.pdf', details: '9 prior convictions history' }
      ];
    }

    if (textHistory.includes('theft') || textHistory.includes('burglary') || textHistory.includes('ಕಳ್ಳತನ')) {
      return [
        { type: 'pdf', name: 'FIR-HOTSPOT-001_Snatching_Bengaluru.pdf', details: 'Registered Under IPC 379 | Open' },
        { type: 'pdf', name: 'FIR-HOTSPOT-002_Snatching_Bengaluru.pdf', details: 'Registered Under IPC 379 | Open' },
        { type: 'csv', name: 'Spike_Anomaly_Hotspots_Bengaluru.csv', details: '45 weekend late-night incident coordinates' }
      ];
    }

    return [
      { type: 'folder', name: 'KSP_Case_Vault_Archive.zip', details: 'General Karnataka State Police base database' },
      { type: 'pdf', name: 'SCRB_SOP_Guidelines.pdf', details: 'Standard Operating Procedures for investigators' }
    ];
  };

  const evidenceItems = getDynamicEvidence();

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 140px)', position: 'relative' }}>
      
      {/* Left Chat Console */}
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden', paddingRight: showEvidence ? '20px' : 0 }}>
        
        {/* Tactical Filter Bar */}
        <div className="filter-bar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 'bold', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>
            <Filter size={12} color="var(--color-secondary-light)" />
            <span>Investigative Filters:</span>
          </div>

          <select 
            value={filters.dateRange} 
            onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value }))}
            className="filter-select"
          >
            <option value="1month">Last 1 Month</option>
            <option value="3months">Last 3 Months</option>
            <option value="1year">Last 1 Year</option>
          </select>

          <select 
            value={filters.district} 
            onChange={(e) => setFilters(prev => ({ ...prev, district: e.target.value }))}
            className="filter-select"
          >
            <option value="All">All Districts</option>
            <option value="Bengaluru Urban">Bengaluru Urban</option>
            <option value="Mysuru">Mysuru</option>
            <option value="Hubballi">Hubballi</option>
          </select>

          <select 
            value={filters.crimeType} 
            onChange={(e) => setFilters(prev => ({ ...prev, crimeType: e.target.value }))}
            className="filter-select"
          >
            <option value="All">All Crimes</option>
            <option value="Theft">Theft/Burglary</option>
            <option value="Assault">Assault/Murder</option>
            <option value="Fraud">Financial Fraud</option>
          </select>

          <select 
            value={filters.gender} 
            onChange={(e) => setFilters(prev => ({ ...prev, gender: e.target.value }))}
            className="filter-select"
          >
            <option value="All">All Genders</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>

          <button 
            className="btn btn-secondary" 
            onClick={() => setFilters({ dateRange: '3months', district: 'All', crimeType: 'All', gender: 'All', ageGroup: 'All', socioEconomic: 'All' })}
            style={{ padding: '4px 10px', height: '28px', fontSize: '10px' }}
          >
            Reset
          </button>
        </div>

        {/* Chat Feed Workspace */}
        <div className="chat-workspace" style={{ width: '100%', margin: 0 }}>
          
          <div className="chat-messages">
            {messages.length === 1 && (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                textAlign: 'center',
                padding: '40px 20px',
                zIndex: 1
              }}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(217, 70, 239, 0.1) 100%)',
                  border: '1px solid rgba(99, 102, 241, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '20px',
                  boxShadow: '0 0 20px rgba(99, 102, 241, 0.15)'
                }}>
                  <Sparkles size={32} color="var(--color-secondary-light)" />
                </div>
                
                <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '12px', color: 'var(--color-text-primary)', maxWidth: '580px' }}>
                  {inputLang === 'kn' 
                    ? "ಹೇ! ತಮಗೆ ಇಂದು ಅಪರಾಧ ತನಿಖೆ, ಆರೋಪಿಗಳ ಅಪಾಯದ ರೇಟಿಂಗ್‌ಗಳು ಅಥವಾ ಗ್ಯಾಂಗ್ ನೆಟ್‌ವರ್ಕ್‌ಗಳ ವಿಶ್ಲೇಷಣೆಯಲ್ಲಿ ನಾನು ಹೇಗೆ ಸಹಾಯ ಮಾಡಲಿ?"
                    : "Hey! How can I assist you with crime data, offender risk scores, or gang network analysis today?"}
                </h2>
                <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', maxWidth: '480px', marginBottom: '32px', lineHeight: '1.6' }}>
                  {inputLang === 'kn'
                    ? "ಕರ್ನಾಟಕ ರಾಜ್ಯ ಪೊಲೀಸ್ ಕಲಾಪ ಮತ್ತು ಗುಪ್ತಚರ ನೆರವಿಗಾಗಿ ನೈಸರ್ಗಿಕ ಭಾಷೆಯಲ್ಲಿ ನಿಮ್ಮ ಪ್ರಶ್ನೆಯನ್ನು ನಮೂದಿಸಿ."
                    : "Karnataka State Police | Crime & Risk Intelligence Platform. Ask questions about crimes, offenders, locations, and patterns using natural language."}
                </p>

                {/* Suggestion Cards Grid */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '12px',
                  width: '100%',
                  maxWidth: '700px'
                }}>
                  {suggestionQueries.map((dq, idx) => (
                    <div
                      key={idx}
                      onClick={() => {
                        setInputVal(dq.text);
                        const isKannada = dq.text.includes("ಕಳ್ಳತನ");
                        setInputLang(isKannada ? 'kn' : 'en');
                      }}
                      style={{
                        background: 'rgba(255, 255, 255, 0.02)',
                        border: '1px solid var(--color-border)',
                        borderRadius: '12px',
                        padding: '14px',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'var(--transition-smooth)'
                      }}
                      className="metric-card"
                    >
                      <div style={{ fontSize: '10px', color: 'var(--color-secondary-light)', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '4px' }}>
                        {dq.label}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--color-text-primary)', display: '-webkit-box', WebkitLineClamp: '2', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {dq.text}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {messages.length > 1 && messages.map(msg => (
              <MessageBubble key={msg.id} message={msg} />
            ))}

            {isTyping && (
              <div style={{ alignSelf: 'flex-start', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {/* Simulated Agent Status Panel */}
                {agentStatusVisible && (
                  <div className="ai-status-panel" style={{ width: '280px', animation: 'slideDown 0.3s ease' }}>
                    <div style={{ fontSize: '10px', color: 'var(--color-text-secondary)', fontWeight: 'bold', textTransform: 'uppercase', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '4px', marginBottom: '4px' }}>
                      RAG Pipeline Progress
                    </div>
                    <div className={`status-step ${activeAgentStep === 0 ? 'active' : activeAgentStep > 0 ? 'completed' : ''}`}>
                      <span className="status-indicator-dot"></span>
                      <span>Query Understanding & Translation</span>
                    </div>
                    <div className={`status-step ${activeAgentStep === 1 ? 'active' : activeAgentStep > 1 ? 'completed' : ''}`}>
                      <span className="status-indicator-dot"></span>
                      <span>Context Retrieval (CSV/Vector DB)</span>
                    </div>
                    <div className={`status-step ${activeAgentStep === 2 ? 'active' : activeAgentStep > 2 ? 'completed' : ''}`}>
                      <span className="status-indicator-dot"></span>
                      <span>Crime Pattern Analysis Engine</span>
                    </div>
                    <div className={`status-step ${activeAgentStep === 3 ? 'active' : activeAgentStep > 3 ? 'completed' : ''}`}>
                      <span className="status-indicator-dot"></span>
                      <span>Report Generation (Generative LLM)</span>
                    </div>
                  </div>
                )}

                <div className="typing-indicator">
                  <span className="typing-dot"></span>
                  <span className="typing-dot"></span>
                  <span className="typing-dot"></span>
                  <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginLeft: '6px' }}>
                    {activeAgentStep === 0 ? 'Translating query...' : activeAgentStep === 1 ? 'Searching archives...' : activeAgentStep === 2 ? 'Computing risk indexes...' : 'Writing intelligence brief...'}
                  </span>
                </div>
              </div>
            )}

            {error && (
              <div style={{
                alignSelf: 'center',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                color: 'var(--color-danger)',
                padding: '10px 16px',
                borderRadius: '8px',
                fontSize: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                backdropFilter: 'blur(8px)'
              }}>
                <ShieldAlert size={14} />
                <span>{error}</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Sticky Bottom Form and controls */}
          <form onSubmit={handleSubmit} className="chat-input-bar">
            {/* File Upload Trigger */}
            <input 
              type="file" 
              id="chat-file-upload-input" 
              style={{ display: 'none' }} 
              onChange={handleFileUpload} 
            />
            <label 
              htmlFor="chat-file-upload-input" 
              style={{ 
                cursor: 'pointer', 
                color: 'var(--color-text-secondary)', 
                padding: '8px', 
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.03)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'var(--transition-smooth)'
              }}
              title="Upload evidence file"
            >
              <Paperclip size={16} />
            </label>

            {/* Input multiline box */}
            <textarea 
              className="form-control"
              placeholder={inputLang === 'kn' ? 'ಕನ್ನಡದಲ್ಲಿ ಪ್ರಶ್ನೆಯನ್ನು ಬರೆಯಿರಿ...' : 'Query KAVERI Crime Database...'}
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              rows={1}
              style={{ 
                flex: 1, 
                height: '38px', 
                resize: 'none',
                borderRadius: '20px',
                padding: '10px 16px',
                lineHeight: '18px',
                backgroundColor: 'rgba(255,255,255,0.03)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-text-primary)'
              }}
            />
            
            {/* Voice Speech API Trigger */}
            <VoiceInput 
              onVoiceResult={handleVoiceInput}
              selectedLanguage={inputLang}
              onLanguageChange={setInputLang}
            />

            {/* Action Buttons: PDF Export, Evidence Open, Send */}
            <div style={{ display: 'flex', gap: '8px', borderLeft: '1px solid var(--color-border)', paddingLeft: '12px' }}>
              
              {/* Evidence side drawer toggle */}
              <button
                type="button"
                onClick={() => setShowEvidence(!showEvidence)}
                style={{
                  background: showEvidence ? 'rgba(99, 102, 241, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                  border: `1px solid ${showEvidence ? 'var(--color-secondary)' : 'var(--color-border)'}`,
                  borderRadius: '50%',
                  width: '36px',
                  height: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: showEvidence ? 'var(--color-secondary-light)' : 'var(--color-text-secondary)',
                  cursor: 'pointer',
                  transition: 'var(--transition-smooth)'
                }}
                title={showEvidence ? "Collapse Evidence Panel" : "Expand Evidence Panel"}
              >
                {showEvidence ? <PanelRightClose size={16} /> : <PanelRight size={16} />}
              </button>

              <PDFExportButton messages={messages} user={user} />

              <button type="submit" className="btn btn-accent" style={{ width: '36px', height: '36px', padding: 0, justifyContent: 'center', borderRadius: '50%' }}>
                <Send size={15} />
              </button>
            </div>
          </form>
        </div>

      </div>

      {/* Right Collapsible Evidence Panel */}
      <div className={`evidence-panel ${showEvidence ? '' : 'collapsed'}`}>
        <div className="evidence-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Folder size={16} color="var(--color-accent-blue)" />
            <strong style={{ fontSize: '13px', color: 'var(--color-text-primary)' }}>Evidence Case Files</strong>
          </div>
          <span style={{
            fontSize: '9px',
            backgroundColor: 'rgba(6, 182, 212, 0.15)',
            border: '1px solid rgba(6, 182, 212, 0.3)',
            color: 'var(--color-accent-blue)',
            padding: '2px 6px',
            borderRadius: '4px',
            fontWeight: 'bold'
          }}>
            {evidenceItems.length} Files
          </span>
        </div>

        <div className="evidence-list">
          {evidenceItems.map((item, idx) => (
            <div 
              key={idx} 
              className="evidence-file-item"
              onClick={() => alert(`Opening encrypted record: ${item.name} (Audited under user ${user?.name})`)}
            >
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '6px',
                background: item.type === 'pdf' ? 'rgba(239, 68, 68, 0.1)' : item.type === 'cctv' ? 'rgba(6, 182, 212, 0.1)' : 'rgba(99, 102, 241, 0.1)',
                border: `1px solid ${item.type === 'pdf' ? 'rgba(239, 68, 68, 0.2)' : item.type === 'cctv' ? 'rgba(6, 182, 212, 0.2)' : 'rgba(99, 102, 241, 0.2)'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: item.type === 'pdf' ? '#EF4444' : item.type === 'cctv' ? '#06B6D4' : '#6366F1',
                flexShrink: 0
              }}>
                {item.type === 'pdf' ? <FileText size={16} /> : item.type === 'cctv' ? <Video size={16} /> : <Layers size={16} />}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <span style={{ fontSize: '11px', color: 'var(--color-text-primary)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden', fontWeight: '500' }}>
                  {item.name}
                </span>
                <span style={{ fontSize: '9px', color: 'var(--color-text-secondary)' }}>
                  {item.details}
                </span>
              </div>
            </div>
          ))}

          <div style={{
            marginTop: 'auto',
            padding: '12px',
            background: 'rgba(99, 102, 241, 0.05)',
            border: '1px solid rgba(99, 102, 241, 0.15)',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '8px',
            fontSize: '11px',
            color: 'var(--color-text-secondary)',
            lineHeight: '1.4'
          }}>
            <Info size={14} color="var(--color-secondary-light)" style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>Associated FIR and digital evidence coordinate files are automatically fetched from KSP registers matching your active query topics.</span>
          </div>
        </div>
      </div>

    </div>
  );
}

export default ChatWindow;
