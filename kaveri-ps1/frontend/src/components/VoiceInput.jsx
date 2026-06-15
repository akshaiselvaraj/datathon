import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Globe } from 'lucide-react';

function VoiceInput({ onVoiceResult, selectedLanguage, onLanguageChange }) {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);

  useEffect(() => {
    // Initialize Web Speech API
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      
      rec.onstart = () => {
        setIsListening(true);
      };
      
      rec.onend = () => {
        setIsListening(false);
      };
      
      rec.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
      };
      
      rec.onresult = (event) => {
        const resultText = event.results[0][0].transcript;
        if (resultText && onVoiceResult) {
          onVoiceResult(resultText);
        }
      };
      
      recognitionRef.current = rec;
    } else {
      console.warn("Web Speech API is not supported in this browser.");
    }
  }, [onVoiceResult]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("Voice input is not supported on this browser version. Please try Chrome.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      // Set language dynamically
      recognitionRef.current.lang = selectedLanguage === 'kn' ? 'kn-IN' : 'en-IN';
      recognitionRef.current.start();
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      {/* Language Selector Button */}
      <button
        type="button"
        onClick={() => onLanguageChange(selectedLanguage === 'kn' ? 'en' : 'kn')}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          backgroundColor: '#EDF2F7',
          color: '#2D3748',
          border: '1px solid #CBD5E0',
          padding: '4px 8px',
          borderRadius: '4px',
          fontSize: '11px',
          fontWeight: 'bold',
          cursor: 'pointer',
          height: '32px'
        }}
        title="Toggle input language"
      >
        <Globe size={12} />
        <span>{selectedLanguage === 'kn' ? 'ಕನ್ನಡ' : 'EN'}</span>
      </button>

      {/* Microphone Trigger */}
      <button
        type="button"
        onClick={toggleListening}
        className={`voice-btn ${isListening ? 'recording' : ''}`}
        style={{
          width: '32px',
          height: '32px',
          border: '1px solid #CBD5E0',
          borderRadius: '4px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: isListening ? '#FEE2E2' : '#EDF2F7',
          cursor: 'pointer'
        }}
        title={isListening ? 'Stop listening' : 'Start voice typing'}
      >
        {isListening ? (
          <MicOff size={14} color="#9B1C1C" />
        ) : (
          <Mic size={14} color="#4A5568" />
        )}
      </button>
    </div>
  );
}

export default VoiceInput;
