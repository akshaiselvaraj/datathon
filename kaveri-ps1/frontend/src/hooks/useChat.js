import { useState, useCallback } from 'react';
import axios from 'axios';
import { detectLanguage } from '../utils/languageDetect';

const API_BASE = window.location.hostname === 'localhost' ? 'http://localhost:3000' : '';

export function useChat(userSession) {
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'system',
      text: 'ನಿಮ್ಮ ಸೇವೆಯಲ್ಲಿ ಕಾವೇರಿ (KAVERI — Karnataka AI for Violence, Evidence, and Risk Intelligence). ನಾನು ಕರ್ನಾಟಕ ರಾಜ್ಯ ಪೊಲೀಸ್ ಇಲಾಖೆಯ ಅಪರಾಧ ತನಿಖಾ ಸಹಾಯಕಿಯಾಗಿದ್ದೇನೆ. ತಮಗೆ ಯಾವ ರೀತಿ ನೆರವಾಗಲಿ?\n\nI am KAVERI, your Crime Intelligence Assistant. How may I assist you with crime data analysis today?',
      citations: [],
      language: 'en'
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState(null);

  const sendMessage = useCallback(async (queryText, selectLang = null) => {
    if (!queryText.trim()) return;

    setError(null);
    const lang = selectLang || detectLanguage(queryText);
    const userMsg = {
      id: `msg-${Date.now()}-user`,
      role: 'user',
      text: queryText,
      language: lang
    };

    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);

    try {
      const response = await axios.post(`${API_BASE}/chat`, {
        query: queryText,
        language: lang,
        conversationHistory: messages.map(m => ({ role: m.role, text: m.text })),
        userId: userSession?.id || 'ANON',
        userRole: userSession?.role || 'Investigator'
      });

      const { answer, citations, networkData, language } = response.data;

      setMessages(prev => [...prev, {
        id: `msg-${Date.now()}-kaveri`,
        role: 'system',
        text: answer,
        citations: citations || [],
        language: language || 'en',
        networkData: networkData || null
      }]);
    } catch (err) {
      console.error("Chat error:", err);
      setError("Failed to reach KAVERI services. Please ensure backend functions are running.");
      
      // Add standard offline friendly reply
      setMessages(prev => [...prev, {
        id: `msg-${Date.now()}-err`,
        role: 'system',
        text: "Error connecting to server. Please run the backend mock server or configure endpoints.",
        citations: []
      }]);
    } finally {
      setIsTyping(false);
    }
  }, [messages, userSession]);

  const clearChat = useCallback(() => {
    setMessages([
      {
        id: 'welcome',
        role: 'system',
        text: 'ನಿಮ್ಮ ಸೇವೆಯಲ್ಲಿ ಕಾವೇರಿ (KAVERI). ತನಿಖಾ ಸಹಾಯಕ್ಕಾಗಿ ಸಿದ್ಧನಾಗಿದ್ದೇನೆ. \n\nI am KAVERI. Ready for crime investigation assistance.',
        citations: [],
        language: 'en'
      }
    ]);
  }, []);

  return { messages, isTyping, error, sendMessage, clearChat };
}
