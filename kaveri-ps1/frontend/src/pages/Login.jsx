import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Shield, User } from 'lucide-react';

function Login() {
  const [username, setUsername] = useState('ksp_officer_admin');
  const [role, setRole] = useState('Investigator');
  const [password, setPassword] = useState('••••••••••••');
  const navigate = useNavigate();

  // Apply theme settings on page load
  useEffect(() => {
    const savedTheme = localStorage.getItem('kaveri_theme') || 'dark';
    if (savedTheme === 'light') {
      document.body.classList.add('light-theme');
    } else {
      document.body.classList.remove('light-theme');
    }
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    
    // Save session
    const sessionUser = {
      id: `KSP-UID-${Math.floor(1000 + Math.random() * 9000)}`,
      name: username === 'ksp_officer_admin' ? 'Shri H. C. Gowda' : username,
      role: role,
      loginTime: new Date().toISOString()
    };
    
    localStorage.setItem('ksp_user_session', JSON.stringify(sessionUser));
    navigate('/dashboard?tab=Crime Intelligence Chat');
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      backgroundColor: 'var(--color-bg)',
      position: 'relative'
    }}>
      {/* Background Orbs */}
      <div className="background-canvas">
        <div className="gradient-orb orb-1"></div>
        <div className="gradient-orb orb-2"></div>
        <div className="gradient-orb orb-3"></div>
      </div>

      <div style={{
        width: '420px',
        backgroundColor: 'var(--color-surface)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid var(--color-border)',
        borderRadius: '20px',
        boxShadow: 'var(--shadow-lg)',
        overflow: 'hidden',
        zIndex: 1
      }}>
        {/* Top Header Bar */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(217, 70, 239, 0.05) 100%)',
          padding: '28px 24px',
          textAlign: 'center',
          color: 'var(--color-text-primary)',
          borderBottom: '1px solid var(--color-border)'
        }}>
          {/* Emblem Block */}
          <div style={{
            width: '56px',
            height: '56px',
            background: 'linear-gradient(135deg, var(--color-secondary) 0%, var(--color-accent-purple) 100%)',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px',
            fontWeight: 'bold',
            margin: '0 auto 12px auto',
            borderRadius: '14px',
            boxShadow: '0 0 15px rgba(99, 102, 241, 0.3)'
          }}>
            🛡️
          </div>
          <h2 style={{ fontSize: '18px', fontWeight: '700', letterSpacing: '0.5px', margin: '0' }}>KAVERI Platform</h2>
          <div style={{ fontSize: '10px', color: 'var(--color-secondary-light)', textTransform: 'uppercase', marginTop: '4px', fontWeight: '600', letterSpacing: '1px' }}>
            Karnataka State Police | Intelligence Portal
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} style={{ padding: '24px' }}>
          <div className="form-group">
            <label className="form-label">Government Username / E-mail</label>
            <input 
              type="text" 
              className="form-control" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input 
              type="password" 
              className="form-control" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Authorized Operational Role</label>
            <select 
              className="form-control" 
              value={role} 
              onChange={(e) => setRole(e.target.value)}
              style={{ height: '38px', backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
            >
              <option value="Investigator">Investigator (Full Case & Suspect Profiles)</option>
              <option value="Analyst">Intelligence Analyst (Trend Charting & Networks)</option>
              <option value="Policymaker">Policymaker (Aggregated Summaries & Metrics)</option>
            </select>
          </div>

          {/* Role Access Information */}
          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid var(--color-border)',
            borderRadius: '10px',
            padding: '12px',
            fontSize: '11px',
            color: 'var(--color-text-secondary)',
            marginBottom: '20px',
            lineHeight: '1.4'
          }}>
            <strong>Security Notice:</strong>
            {role === 'Investigator' && " You will have access to unredacted offender criminal history, personal profiles, and full case narratives."}
            {role === 'Analyst' && " You will have access to statistical crime aggregations, trend visualizers, and cross-district co-offender networks."}
            {role === 'Policymaker' && " Individual names and direct identifiers are redacted. Access is restricted to district summaries and regional crime trends."}
          </div>

          <button 
            type="submit" 
            className="btn btn-accent" 
            style={{ width: '100%', justifyContent: 'center', height: '40px', borderRadius: '10px' }}
          >
            Authenticate & Log In
          </button>
        </form>

        {/* Security Warning Footer */}
        <div style={{
          backgroundColor: 'rgba(239, 68, 68, 0.08)',
          borderTop: '1px solid rgba(239, 68, 68, 0.15)',
          padding: '12px 24px',
          fontSize: '10px',
          color: '#EF4444',
          textAlign: 'center',
          fontWeight: '500'
        }}>
          WARNING: Authorized Personnel Only. All actions are audited.
        </div>
      </div>
    </div>
  );
}

export default Login;
