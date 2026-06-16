import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  LayoutDashboard, MessageSquare, Network, BarChart3, Users, 
  Bell, FileText, Settings, Shield, LogOut, Search, MapPin, 
  AlertOctagon, CheckCircle2, ChevronRight 
} from 'lucide-react';
import axios from 'axios';

// Import subcomponents
import ChatWindow from '../components/ChatWindow';
import NetworkGraph from '../components/NetworkGraph';
import TrendChart from '../components/TrendChart';
import AlertBanner from '../components/AlertBanner';
import RiskScoreBadge from '../components/RiskScoreBadge';

const API_BASE = window.location.hostname === 'localhost' ? 'http://localhost:3000' : '';

function Dashboard() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [sessionUser, setSessionUser] = useState(null);
  
  const activeTab = searchParams.get('tab') || 'Dashboard';
  const setActiveTab = (newTab) => {
    setSearchParams(prev => {
      prev.set('tab', newTab);
      prev.delete('search');
      return prev;
    });
  };
  
  // Dashboard Analytics States
  const [kpiData, setKpiData] = useState({
    totalFirs: 5005,
    openFirs: 3500,
    closedFirs: 500,
    chargesheetedFirs: 1005,
    totalAccused: 2001,
    totalVictims: 1500,
    totalTransactions: 524
  });
  const [trendData, setTrendData] = useState([]);
  const [crimeTypeData, setCrimeTypeData] = useState([]);
  const [districtData, setDistrictData] = useState([]);
  const [riskDistribution, setRiskDistribution] = useState([]);
  const [hotspots, setHotspots] = useState([]);
  
  // Alerts State
  const [alerts, setAlerts] = useState([]);
  const [unreadAlertsCount, setUnreadAlertsCount] = useState(0);

  // Offenders Registry States
  const [offenders, setOffenders] = useState([]);
  
  // Case Reports Registry States
  const [cases, setCases] = useState([]);

  const tabSearch = searchParams.get('search') || '';
  const setTabSearch = (val) => {
    setSearchParams(prev => {
      if (val) {
        prev.set('search', val);
      } else {
        prev.delete('search');
      }
      return prev;
    });
  };

  const renderFirLinks = (str) => {
    if (!str) return 'None';
    const regex = /(FIR-[A-Z0-9-]+)/g;
    const parts = str.split(regex);
    return parts.map((part, index) => {
      if (part.match(regex)) {
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
      return part;
    });
  };

  useEffect(() => {
    // 1. Session check
    const savedUser = localStorage.getItem('ksp_user_session');
    if (!savedUser) {
      navigate('/login');
      return;
    }
    setSessionUser(JSON.parse(savedUser));

    // 2. Fetch Aggregated Crime Analytics
    const fetchAnalytics = async () => {
      try {
        const res = await axios.get(`${API_BASE}/analytics`);
        const { kpis, trendData, crimeTypeData, districtData, riskDistribution, hotspots } = res.data;
        if (kpis) setKpiData(kpis);
        if (trendData) setTrendData(trendData);
        if (crimeTypeData) setCrimeTypeData(crimeTypeData);
        if (districtData) setDistrictData(districtData);
        if (riskDistribution) setRiskDistribution(riskDistribution);
        if (hotspots) setHotspots(hotspots);
      } catch (err) {
        console.warn("Could not fetch backend analytics, generating offline mock aggregates.");
        // Fallback mock data matching generated synthetic structures
        setTrendData([
          { month: '2025-07', incidents: 380 },
          { month: '2025-08', incidents: 410 },
          { month: '2025-09', incidents: 395 },
          { month: '2025-10', incidents: 420 },
          { month: '2025-11', incidents: 430 },
          { month: '2025-12', incidents: 450 },
          { month: '2026-01', incidents: 460 },
          { month: '2026-02', incidents: 440 },
          { month: '2026-03', incidents: 480 },
          { month: '2026-04', incidents: 495 },
          { month: '2026-05', incidents: 512 },
          { month: '2026-06', incidents: 524 }
        ]);
        setCrimeTypeData([
          { name: 'Theft', count: 1850 },
          { name: 'Cheating/Fraud', count: 820 },
          { name: 'Assault', count: 640 },
          { name: 'Robbery', count: 480 },
          { name: 'Criminal Intimidation', count: 380 },
          { name: 'Kidnapping', count: 210 },
          { name: 'Murder', count: 150 },
          { name: 'Rape', count: 110 }
        ]);
        setDistrictData([
          { name: 'Bengaluru Urban', count: 2210 },
          { name: 'Mysuru', count: 640 },
          { name: 'Hubballi-Dharwad', count: 450 },
          { name: 'Mangaluru', count: 320 },
          { name: 'Belagavi', count: 290 },
          { name: 'Kalaburagi', count: 210 }
        ]);
        setRiskDistribution([
          { name: 'Low (0-30)', value: 1240, color: '#276749' },
          { name: 'Medium (31-60)', value: 540, color: '#C8922A' },
          { name: 'High (61-80)', value: 182, color: '#DD6B20' },
          { name: 'Critical (81-100)', value: 39, color: '#9B1C1C' }
        ]);
      }
    };

    // 3. Fetch Alerts
    const fetchAlerts = async () => {
      try {
        const res = await axios.get(`${API_BASE}/alerts`);
        setAlerts(res.data);
        setUnreadAlertsCount(res.data.filter(a => String(a.acknowledged) === 'False').length);
      } catch (err) {
        console.warn("Could not fetch alerts, using mock alert database.");
        const mockAlerts = [
          {
            alert_id: "ALT-001",
            alert_type: "Crime Spike Anomaly",
            district: "Bengaluru Urban",
            description: "CRITICAL ALERT: Significant anomaly detected in Bengaluru Urban district. Theft rates have increased from 2.4 incidents/day to 45 incidents in the last 24 hours. Involved FIRs: FIR-HOTSPOT-001 to FIR-HOTSPOT-045. Common modus operandi: Phone/wallet snatching during late weekend hours.",
            created_at: new Date().toLocaleString(),
            severity: "Critical",
            acknowledged: "False"
          },
          {
            alert_id: "ALT-002",
            alert_type: "Gang Movement Anomaly",
            district: "Mysuru",
            description: "HIGH ALERT: Active burglaries linked to the 'Shadow Gang' reported in Mysuru (FIR-SHADOW-006, FIR-SHADOW-007). Shared MO: Breaks rear window latch between 2am-4am.",
            created_at: new Date(Date.now() - 4 * 3600 * 1000).toLocaleString(),
            severity: "High",
            acknowledged: "False"
          }
        ];
        setAlerts(mockAlerts);
        setUnreadAlertsCount(2);
      }
    };

    // 4. Fetch Offenders List
    const fetchOffenders = () => {
      // Offline/local mock offenders including planted evaluations
      const mockOffenders = [
        { accused_id: 'ACC-HIGHRISK-001', name: 'Ravi Shankar Gowda', age: 34, gender: 'Male', district: 'Bengaluru Urban', prior_case_count: 9, risk_score: 94.0, modus_operandi: 'Assaults victim with weapon after snatching bag', bail_status: 'True' },
        { accused_id: 'ACC-SHADOW-001', name: 'Shadow Member 1', age: 24, gender: 'Male', district: 'Bengaluru Urban', prior_case_count: 3, risk_score: 72.5, modus_operandi: 'Breaks rear window latch between 2am-4am', bail_status: 'True' },
        { accused_id: 'ACC-SHADOW-002', name: 'Shadow Member 2', age: 26, gender: 'Male', district: 'Bengaluru Urban', prior_case_count: 3, risk_score: 72.5, modus_operandi: 'Breaks rear window latch between 2am-4am', bail_status: 'True' },
        { accused_id: 'ACC-SHADOW-003', name: 'Shadow Member 3', age: 28, gender: 'Male', district: 'Bengaluru Urban', prior_case_count: 3, risk_score: 72.5, modus_operandi: 'Breaks rear window latch between 2am-4am', bail_status: 'True' },
        { accused_id: 'ACC-SHADOW-004', name: 'Shadow Member 4', age: 25, gender: 'Male', district: 'Mysuru', prior_case_count: 3, risk_score: 72.5, modus_operandi: 'Breaks rear window latch between 2am-4am', bail_status: 'True' },
        { accused_id: 'ACC-SHADOW-005', name: 'Shadow Member 5', age: 27, gender: 'Male', district: 'Mysuru', prior_case_count: 3, risk_score: 72.5, modus_operandi: 'Breaks rear window latch between 2am-4am', bail_status: 'True' },
        { accused_id: 'ACC-FRAUD-999', name: 'Harshad Mehta Kumar', age: 45, gender: 'Male', district: 'Bengaluru Urban', prior_case_count: 3, risk_score: 68.2, modus_operandi: 'Phishing email link and OTP fraud redirecting to bank account', bail_status: 'False' },
        { accused_id: 'ACC-2024-KA-0012', name: 'Manjunath Reddy', age: 31, gender: 'Male', district: 'Tumakuru', prior_case_count: 2, risk_score: 42.0, modus_operandi: 'Chain snatching', bail_status: 'True' },
        { accused_id: 'ACC-2024-KA-0089', name: 'Kavitha S.', age: 29, gender: 'Female', district: 'Mysuru', prior_case_count: 1, risk_score: 24.5, modus_operandi: 'Shoplifting in supermarkets', bail_status: 'True' }
      ];
      setOffenders(mockOffenders);
    };

    // 5. Fetch Case Reports
    const fetchCases = () => {
      const mockCases = [
        { fir_id: 'FIR-HOTSPOT-001', district: 'Bengaluru Urban', crime_type: 'Theft', ipc_section: '379', date_of_incident: '2026-06-07', investigation_status: 'Open' },
        { fir_id: 'FIR-HOTSPOT-002', district: 'Bengaluru Urban', crime_type: 'Theft', ipc_section: '379', date_of_incident: '2026-06-07', investigation_status: 'Open' },
        { fir_id: 'FIR-HIGHRISK-008', district: 'Bengaluru Urban', crime_type: 'Attempt to Murder', ipc_section: '307', date_of_incident: '2026-06-01', investigation_status: 'Open' },
        { fir_id: 'FIR-SHADOW-001', district: 'Bengaluru Urban', crime_type: 'Theft in Dwelling House', ipc_section: '380', date_of_incident: '2026-05-15', investigation_status: 'Open' },
        { fir_id: 'FIR-FRAUD-001', district: 'Bengaluru Urban', crime_type: 'Cheating/Fraud', ipc_section: '420', date_of_incident: '2026-05-10', investigation_status: 'Open' },
        { fir_id: 'FIR-2024-KA-0015', district: 'Kalaburagi', crime_type: 'Murder', ipc_section: '302', date_of_incident: '2026-04-20', investigation_status: 'Chargesheeted' }
      ];
      setCases(mockCases);
    };

    fetchAnalytics();
    fetchAlerts();
    fetchOffenders();
    fetchCases();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('ksp_user_session');
    navigate('/login');
  };

  const acknowledgeAlert = (id) => {
    setAlerts(prev => prev.map(a => a.alert_id === id ? { ...a, acknowledged: 'True' } : a));
    setUnreadAlertsCount(prev => Math.max(0, prev - 1));
  };

  // Sidebar items definition
  const sidebarItems = [
    { name: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { name: 'Crime Intelligence Chat', icon: <MessageSquare size={18} /> },
    { name: 'Criminal Networks', icon: <Network size={18} /> },
    { name: 'Crime Analytics', icon: <BarChart3 size={18} /> },
    { name: 'Offender Profiles', icon: <Users size={18} />, roles: ['Investigator', 'Analyst'] },
    { name: 'Alerts & Warnings', icon: <Bell size={18} /> },
    { name: 'Case Reports', icon: <FileText size={18} /> },
    { name: 'Settings', icon: <Settings size={18} /> }
  ];

  const filteredOffenders = offenders.filter(o => 
    o.name.toLowerCase().includes(tabSearch.toLowerCase()) || 
    o.accused_id.toLowerCase().includes(tabSearch.toLowerCase()) ||
    o.modus_operandi.toLowerCase().includes(tabSearch.toLowerCase())
  );

  const filteredCases = cases.filter(c => 
    c.fir_id.toLowerCase().includes(tabSearch.toLowerCase()) || 
    c.crime_type.toLowerCase().includes(tabSearch.toLowerCase()) ||
    c.district.toLowerCase().includes(tabSearch.toLowerCase()) ||
    c.investigation_status.toLowerCase().includes(tabSearch.toLowerCase())
  );

  return (
    <div className="app-container">
      {/* Sidebar navigation */}
      <div className="sidebar">
        <div className="sidebar-header">
          <div className="emblem-placeholder">🛡️</div>
          <div>
            <div className="sidebar-title">KAVERI</div>
            <div className="sidebar-subtitle">KSP Intelligence</div>
          </div>
        </div>

        <div className="sidebar-menu">
          {sidebarItems.map(item => {
            // Check role permissions
            if (item.roles && sessionUser && !item.roles.includes(sessionUser.role)) {
              return null;
            }
            return (
              <div 
                key={item.name} 
                className={`menu-item ${activeTab === item.name ? 'active' : ''}`}
                onClick={() => setActiveTab(item.name)}
              >
                {item.icon}
                <span>{item.name}</span>
                {item.name === 'Alerts & Warnings' && unreadAlertsCount > 0 && (
                  <span className="sidebar-badge">{unreadAlertsCount}</span>
                )}
              </div>
            );
          })}
        </div>

        <div className="sidebar-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px' }}>
          <div>
            <div style={{ color: '#FFFFFF', fontWeight: 'bold' }}>{sessionUser?.name}</div>
            <div style={{ fontSize: '10px', color: '#C8922A' }}>ID: {sessionUser?.id}</div>
          </div>
          <button onClick={handleLogout} style={{ background: 'none', border: 'none', color: '#A0AEC0', cursor: 'pointer' }}>
            <LogOut size={16} />
          </button>
        </div>
      </div>

      {/* Main Workspace */}
      <div className="workspace">
        <div className="header">
          <div className="header-brand">
            <h1 className="header-title">KAVERI — Crime Analytics & Intelligence Platform</h1>
            <div className="header-subtitle">Karnataka State Police | State Crime Records Bureau</div>
          </div>
          <div className="header-user">
            <span className="user-role-badge">{sessionUser?.role}</span>
          </div>
        </div>

        <div className="content-area">
          {/* Active Banner for Spikes */}
          {unreadAlertsCount > 0 && activeTab !== 'Alerts & Warnings' && (
            <AlertBanner alerts={alerts} onAcknowledge={acknowledgeAlert} />
          )}

          {/* TAB 1: MAIN DASHBOARD */}
          {activeTab === 'Dashboard' && (
            <div>
              {/* KPIs Grid */}
              <div className="grid-container grid-4" style={{ marginBottom: '24px' }}>
                <div className="card metric-card active-total" onClick={() => setActiveTab('Case Reports')}>
                  <div className="metric-label">Total Crime Files (FIRs)</div>
                  <div className="metric-value">{kpiData.totalFirs}</div>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>Loaded in RAG database</div>
                </div>
                <div className="card metric-card active-open" onClick={() => { setSearchParams({ tab: 'Case Reports', search: 'Open' }); }}>
                  <div className="metric-label">Active / Open Investigations</div>
                  <div className="metric-value" style={{ color: 'var(--color-danger)' }}>{kpiData.openFirs}</div>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>Under investigation status</div>
                </div>
                <div className="card metric-card active-accused" onClick={() => setActiveTab('Offender Profiles')}>
                  <div className="metric-label">Monitored Accused Database</div>
                  <div className="metric-value">{kpiData.totalAccused}</div>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>Predictive risk profiles</div>
                </div>
                <div className="card metric-card active-financial" onClick={() => setActiveTab('Criminal Networks')}>
                  <div className="metric-label">Flagged Financial Transactions</div>
                  <div className="metric-value" style={{ color: 'var(--color-success)' }}>{kpiData.totalTransactions}</div>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>Illicit funding audits</div>
                </div>
              </div>

              {/* Charts & Quick Lists grid */}
              <div className="grid-container grid-2-1">
                <div>
                  <div className="card">
                    <div className="card-header">
                      <span className="card-title"><BarChart3 size={18} /> Karnataka Crime Trend Analysis (12-Month Roll)</span>
                    </div>
                    <TrendChart data={trendData} type="bar" />
                  </div>
                </div>

                <div>
                  {/* Planted Pattern Quick Indicators */}
                  <div className="card" style={{ borderLeft: '4px solid var(--color-secondary)' }}>
                    <div className="card-header">
                      <span className="card-title"><Shield size={18} /> High-Risk Offender Alerts</span>
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div 
                        className="highlight-panel critical"
                        onClick={() => {
                          setSearchParams({ tab: 'Offender Profiles', search: 'Ravi Shankar Gowda' });
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <strong>Ravi Shankar Gowda</strong>
                          <span style={{ color: 'var(--color-danger)', fontWeight: 'bold', fontSize: '12px' }}>94% Risk</span>
                        </div>
                        <div style={{ fontSize: '11.5px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                          9 Priors. Escalating IPC 307 (Attempted Murder). Out on bail.
                        </div>
                      </div>
                      <div 
                        className="highlight-panel warning"
                        onClick={() => {
                          setActiveTab('Criminal Networks');
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <strong>Shadow Gang Network</strong>
                          <span style={{ color: 'var(--color-secondary)', fontWeight: 'bold', fontSize: '12px' }}>Active</span>
                        </div>
                        <div style={{ fontSize: '11.5px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                          5 connected nodes. 8 cross-district burglary FIRs. 2 shared accounts.
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="card">
                    <div className="card-header">
                      <span className="card-title"><Bell size={18} /> Active System Bulletins</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {alerts.slice(0, 3).map(a => (
                        <div 
                          key={a.alert_id} 
                          className={`highlight-panel ${a.severity === 'Critical' ? 'critical' : 'warning'}`}
                          onClick={() => {
                            setActiveTab('Alerts & Warnings');
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontWeight: 'bold', color: a.severity === 'Critical' ? 'var(--color-danger)' : 'var(--color-warning)', fontSize: '12.5px' }}>{a.alert_type}</span>
                            <span style={{ fontSize: '10px', color: 'var(--color-text-secondary)' }}>{a.created_at}</span>
                          </div>
                          <p style={{ fontSize: '11.5px', color: 'var(--color-text-primary)', marginTop: '6px', display: '-webkit-box', WebkitLineClamp: '2', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{a.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CRIME INTELLIGENCE CHAT */}
          {activeTab === 'Crime Intelligence Chat' && (
            <ChatWindow user={sessionUser} />
          )}

          {/* TAB 3: CRIMINAL NETWORKS */}
          {activeTab === 'Criminal Networks' && (
            <div className="card">
              <div className="card-header">
                <span className="card-title"><Network size={18} /> Interactive Criminal Co-Accused Network Graph</span>
                <span style={{ fontSize: '11px', color: '#4A5568' }}>Visualizing shared FIRs and linked bank transaction pathways</span>
              </div>
              <NetworkGraph />
            </div>
          )}

          {/* TAB 4: CRIME ANALYTICS */}
          {activeTab === 'Crime Analytics' && (
            <div>
              <div className="grid-container grid-2-1" style={{ marginBottom: '20px' }}>
                <div className="card">
                  <div className="card-header">
                    <span className="card-title"><BarChart3 size={18} /> Top Incident Categories (IPC Breakdown)</span>
                  </div>
                  <TrendChart data={crimeTypeData} type="pie" />
                </div>
                <div className="card">
                  <div className="card-header">
                    <span className="card-title"><MapPin size={18} /> Incidents by District Jurisdiction</span>
                  </div>
                  <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                    <table className="gov-table" style={{ margin: 0 }}>
                      <thead>
                        <tr>
                          <th>District Name</th>
                          <th>FIR Count</th>
                        </tr>
                      </thead>
                      <tbody>
                        {districtData.map(d => (
                          <tr key={d.name}>
                            <td>{d.name}</td>
                            <td><strong>{d.count}</strong></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Risk distribution graph */}
              <div className="card">
                <div className="card-header">
                  <span className="card-title"><Shield size={18} /> Monitored Offender Risk Score Bands Distribution</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px', alignItems: 'center' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {riskDistribution.map(r => (
                      <div key={r.name} style={{ display: 'flex', justifyItems: 'center', justifyContent: 'space-between', padding: '8px', borderLeft: `4px solid ${r.color}`, background: '#F8FAFC' }}>
                        <span>{r.name}</span>
                        <strong>{r.value} profiles</strong>
                      </div>
                    ))}
                  </div>
                  <TrendChart data={riskDistribution} type="bar" />
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: OFFENDER PROFILES */}
          {activeTab === 'Offender Profiles' && (
            <div className="card">
              <div className="card-header">
                <span className="card-title"><Users size={18} /> Predictive Offender Registry & Risk Scoring Database</span>
                <div style={{ position: 'relative', display: 'flex', gap: '8px' }}>
                  <Search size={16} style={{ position: 'absolute', left: '10px', top: '10px', color: '#718096' }} />
                  <input 
                    type="text" 
                    placeholder="Search name, ID or modus operandi..." 
                    className="form-control" 
                    value={tabSearch}
                    onChange={(e) => setTabSearch(e.target.value)}
                    style={{ paddingLeft: '32px', width: '280px', height: '34px', fontSize: '12px' }}
                  />
                </div>
              </div>

              <table className="gov-table">
                <thead>
                  <tr>
                    <th>Offender ID</th>
                    <th>Name</th>
                    <th>Age/Gender</th>
                    <th>Jurisdiction</th>
                    <th>Priors Count</th>
                    <th>Risk Rating</th>
                    <th>Bail Status</th>
                    <th>Modus Operandi Details</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOffenders.map(o => (
                    <tr key={o.accused_id}>
                      <td><code style={{ fontWeight: 'bold' }}>{o.accused_id}</code></td>
                      <td><strong>{o.name}</strong></td>
                      <td>{o.age} / {o.gender}</td>
                      <td>{o.district}</td>
                      <td>{o.prior_case_count}</td>
                      <td><RiskScoreBadge score={o.risk_score} /></td>
                      <td>
                        <span style={{
                          color: o.bail_status === 'True' ? '#C05621' : '#276749',
                          fontWeight: 'bold',
                          fontSize: '11px'
                        }}>
                          {o.bail_status === 'True' ? 'Out on Bail (Flagged)' : 'In Custody'}
                        </span>
                      </td>
                      <td style={{ fontSize: '12px', fontStyle: 'italic', maxWidth: '300px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }} title={o.modus_operandi}>
                        {o.modus_operandi}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 6: ALERTS & WARNINGS */}
          {activeTab === 'Alerts & Warnings' && (
            <div className="card">
              <div className="card-header">
                <span className="card-title"><Bell size={18} /> Active System Bulletins & Anomalous Crime Spikes</span>
                <button 
                  className="btn btn-secondary" 
                  onClick={async () => {
                    await axios.post(`${API_BASE}/alerts?trigger_scan=true`);
                    // Reload alerts page
                    window.location.reload();
                  }}
                  style={{ height: '32px', fontSize: '11px', padding: '0 12px' }}
                >
                  Force Scan Now
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {alerts.map(a => (
                  <div 
                    key={a.alert_id} 
                    style={{
                      border: '1px solid #E2E8F0',
                      borderRadius: '4px',
                      backgroundColor: String(a.acknowledged) === 'True' ? '#F8FAFC' : '#FFFDF5',
                      padding: '16px',
                      borderLeft: `5px solid ${a.severity === 'Critical' ? '#9B1C1C' : '#C8922A'}`
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <span style={{
                          backgroundColor: a.severity === 'Critical' ? '#9B1C1C' : '#C8922A',
                          color: '#FFFFFF',
                          fontWeight: 'bold',
                          fontSize: '10px',
                          padding: '2px 8px',
                          borderRadius: '2px',
                          textTransform: 'uppercase'
                        }}>{a.severity}</span>
                        <strong style={{ fontSize: '15px' }}>{a.alert_type} ({a.district})</strong>
                      </div>
                      <span style={{ fontSize: '12px', color: '#718096' }}>{a.created_at}</span>
                    </div>

                    <p style={{ color: '#1A1A2E', fontSize: '13px', lineHeight: '1.5', marginBottom: '12px' }}>{a.description}</p>
                    
                    <div style={{ display: 'flex', justifyItems: 'center', justifyContent: 'space-between', fontSize: '11px', color: '#718096' }}>
                      <span>Source Files: {renderFirLinks(a.source_fir_ids || a.description)}</span>
                      {String(a.acknowledged) === 'False' ? (
                        <button 
                          className="btn btn-secondary btn-accent" 
                          onClick={() => acknowledgeAlert(a.alert_id)}
                          style={{ height: '28px', padding: '0 10px', fontSize: '11px' }}
                        >
                          <CheckCircle2 size={12} /> Acknowledge Bulletin
                        </button>
                      ) : (
                        <span style={{ color: '#276749', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <CheckCircle2 size={12} /> Acknowledged by Auditor
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 7: CASE REPORTS */}
          {activeTab === 'Case Reports' && (
            <div className="card">
              <div className="card-header">
                <span className="card-title"><FileText size={18} /> Crime Archives (Loaded FIR Dossiers)</span>
                <div style={{ position: 'relative', display: 'flex', gap: '8px' }}>
                  <Search size={16} style={{ position: 'absolute', left: '10px', top: '10px', color: '#718096' }} />
                  <input 
                    type="text" 
                    placeholder="Search FIR files or district..." 
                    className="form-control" 
                    value={tabSearch}
                    onChange={(e) => setTabSearch(e.target.value)}
                    style={{ paddingLeft: '32px', width: '280px', height: '34px', fontSize: '12px' }}
                  />
                </div>
              </div>

              <table className="gov-table">
                <thead>
                  <tr>
                    <th>FIR file ID</th>
                    <th>Jurisdiction</th>
                    <th>Crime Type</th>
                    <th>IPC Classification</th>
                    <th>Date Incident</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCases.map(c => (
                    <tr key={c.fir_id}>
                      <td><code style={{ fontWeight: 'bold' }}>{c.fir_id}</code></td>
                      <td>{c.district}</td>
                      <td><strong>{c.crime_type}</strong></td>
                      <td>IPC {c.ipc_section}</td>
                      <td>{c.date_of_incident}</td>
                      <td>
                        <span style={{
                          backgroundColor: c.investigation_status === 'Open' ? '#FFF5F5' : '#F0FFF4',
                          color: c.investigation_status === 'Open' ? '#9B1C1C' : '#22543D',
                          padding: '2px 6px',
                          fontSize: '11px',
                          fontWeight: 'bold',
                          borderRadius: '2px'
                        }}>
                          {c.investigation_status.toUpperCase()}
                        </span>
                      </td>
                      <td>
                        <button 
                          onClick={() => navigate(`/case/${c.fir_id}`)}
                          className="btn btn-secondary" 
                          style={{ padding: '4px 8px', fontSize: '11px', height: '26px' }}
                        >
                          View Dossier <ChevronRight size={12} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 8: SETTINGS */}
          {activeTab === 'Settings' && (
            <div className="card">
              <div className="card-header">
                <span className="card-title"><Settings size={18} /> System Configurations</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '600px' }}>
                <div>
                  <label className="form-label">RAG Pipeline Vector Count Limit</label>
                  <input type="number" className="form-control" defaultValue="8" />
                </div>
                <div>
                  <label className="form-label">Anomaly Spike Threshold (Standard Deviations)</label>
                  <input type="number" className="form-control" defaultValue="2" step="0.1" />
                </div>
                <div>
                  <label className="form-label">Pinecone Vector Index Identifier</label>
                  <input type="text" className="form-control" defaultValue="ksp-crime-firs" />
                </div>
                <button className="btn" style={{ width: 'fit-content' }}>Save Configurations</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
