import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [username, setUsername] = useState('ksp_officer_admin');
  const [role, setRole] = useState('Investigator');
  const [password, setPassword] = useState('••••••••••••');
  const navigate = useNavigate();

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
    navigate('/dashboard');
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      backgroundColor: '#F5F6F8'
    }}>
      <div style={{
        width: '420px',
        backgroundColor: '#FFFFFF',
        border: '1px solid #D1D5DB',
        borderRadius: '4px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
        overflow: 'hidden'
      }}>
        {/* Top Header Bar */}
        <div style={{
          backgroundColor: '#1B2A4A',
          padding: '24px',
          textAlign: 'center',
          color: '#FFFFFF',
          borderBottom: '4px solid #C8922A'
        }}>
          {/* Emblem Gold Block */}
          <div style={{
            width: '60px',
            height: '60px',
            backgroundColor: '#C8922A',
            color: '#1B2A4A',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px',
            fontWeight: 'bold',
            margin: '0 auto 12px auto',
            borderRadius: '4px'
          }}>
            🛡️
          </div>
          <h2 style={{ fontSize: '18px', fontWeight: '700', letterSpacing: '0.5px', margin: '0' }}>KAVERI Platform</h2>
          <div style={{ fontSize: '11px', color: '#C8922A', textTransform: 'uppercase', marginTop: '4px', fontWeight: '600' }}>
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
              style={{ height: '38px' }}
            >
              <option value="Investigator">Investigator (Full Case & Suspect Profiles)</option>
              <option value="Analyst">Intelligence Analyst (Trend Charting & Networks)</option>
              <option value="Policymaker">Policymaker (Aggregated Summaries & Metrics)</option>
            </select>
          </div>

          {/* Role Access Information */}
          <div style={{
            backgroundColor: '#F8FAFC',
            border: '1px solid #E2E8F0',
            padding: '12px',
            fontSize: '11px',
            color: '#4A5568',
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
            style={{ width: '100%', justifyContent: 'center', height: '40px' }}
          >
            Authenticate & Log In
          </button>
        </form>

        {/* Security Warning Footer */}
        <div style={{
          backgroundColor: '#FFF5F5',
          borderTop: '1px solid #FED7D7',
          padding: '12px 24px',
          fontSize: '10px',
          color: '#C53030',
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
