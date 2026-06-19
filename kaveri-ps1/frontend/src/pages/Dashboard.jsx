import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  LayoutDashboard, MessageSquare, Network, BarChart3, Users, 
  Bell, FileText, Settings, Shield, LogOut, Search, MapPin, 
  AlertOctagon, CheckCircle2, ChevronRight, Menu, ChevronLeft, Plus,
  Sparkles, ShieldAlert, History
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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('kaveri_theme') || 'dark');

  // Propagate theme changes to body class list
  useEffect(() => {
    if (theme === 'light') {
      document.body.classList.add('light-theme');
    } else {
      document.body.classList.remove('light-theme');
    }
    localStorage.setItem('kaveri_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };
  
  const activeTab = searchParams.get('tab') || 'Crime Intelligence Chat';
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
  const [forecastData, setForecastData] = useState([]);
  const [crimeTypeData, setCrimeTypeData] = useState([]);
  const [districtData, setDistrictData] = useState([]);
  const [riskDistribution, setRiskDistribution] = useState([]);
  const [hotspots, setHotspots] = useState([]);
  
  // Demographics active visual state selectors
  const [offenderDemoType, setOffenderDemoType] = useState('education');
  const [victimDemoType, setVictimDemoType] = useState('ageGroups');
  
  // Demographics data payloads
  const [offenderDemographics, setOffenderDemographics] = useState(null);
  const [victimDemographics, setVictimDemographics] = useState(null);
  
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
        const { kpis, trendData, forecastData, crimeTypeData, districtData, riskDistribution, offenderDemographics, victimDemographics, hotspots } = res.data;
        if (kpis) setKpiData(kpis);
        if (trendData) setTrendData(trendData);
        if (forecastData) setForecastData(forecastData);
        if (crimeTypeData) setCrimeTypeData(crimeTypeData);
        if (districtData) setDistrictData(districtData);
        if (riskDistribution) setRiskDistribution(riskDistribution);
        if (offenderDemographics) setOffenderDemographics(offenderDemographics);
        if (victimDemographics) setVictimDemographics(victimDemographics);
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
        setForecastData([
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
          { month: '2026-06', incidents: 524 },
          { month: '2026-07 (Proj)', incidents: 535, isForecast: true },
          { month: '2026-08 (Proj)', incidents: 543, isForecast: true },
          { month: '2026-09 (Proj)', incidents: 559, isForecast: true }
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
        setOffenderDemographics({
          ageGroups: [
            { name: '18-30 (Youth)', count: 852 },
            { name: '31-50 (Adult)', count: 914 },
            { name: '51+ (Senior)', count: 235 }
          ],
          gender: [
            { name: 'Male', count: 1701 },
            { name: 'Female', count: 280 },
            { name: 'Other', count: 20 }
          ],
          socioEconomic: [
            { name: 'Lower Class', count: 1240 },
            { name: 'Middle Class', count: 540 },
            { name: 'Upper Middle Class', count: 221 }
          ],
          education: [
            { name: 'Illiterate', count: 350 },
            { name: 'Primary School', count: 520 },
            { name: 'High School', count: 811 },
            { name: 'Graduate', count: 280 },
            { name: 'Post Graduate', count: 40 }
          ],
          occupation: [
            { name: 'Laborer', count: 680 },
            { name: 'Driver', count: 420 },
            { name: 'Business Owner', count: 150 },
            { name: 'Unemployed', count: 580 },
            { name: 'Private Employee', count: 120 },
            { name: 'Government Employee', count: 51 }
          ]
        });
        setVictimDemographics({
          ageGroups: [
            { name: '0-17 (Child)', count: 120 },
            { name: '18-30 (Youth)', count: 580 },
            { name: '31-50 (Adult)', count: 620 },
            { name: '51+ (Senior)', count: 180 }
          ],
          gender: [
            { name: 'Male', count: 620 },
            { name: 'Female', count: 865 },
            { name: 'Other', count: 15 }
          ],
          socioEconomic: [
            { name: 'Lower Class', count: 450 },
            { name: 'Middle Class', count: 810 },
            { name: 'Upper Middle Class', count: 240 }
          ]
        });
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
    { name: 'Crime Intelligence Chat', icon: <MessageSquare size={18} /> },
    { name: 'Dashboard', icon: <LayoutDashboard size={18} /> },
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
      {/* Background Orbs */}
      <div className="background-canvas">
        <div className="gradient-orb orb-1"></div>
        <div className="gradient-orb orb-2"></div>
        <div className="gradient-orb orb-3"></div>
      </div>

      {/* Sidebar navigation */}
      <div className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header" style={{ justifyContent: sidebarCollapsed ? 'center' : 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className="emblem-placeholder">🛡️</div>
            {!sidebarCollapsed && (
              <div className="sidebar-title-container">
                <div className="sidebar-title">KAVERI</div>
                <div className="sidebar-subtitle">KSP Intelligence</div>
              </div>
            )}
          </div>
          <button 
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--color-text-secondary)',
              cursor: 'pointer',
              display: sidebarCollapsed ? 'none' : 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '4px'
            }}
          >
            <ChevronLeft size={16} />
          </button>
        </div>

        <div className="sidebar-menu">
          {/* New Investigation Button */}
          <button
            onClick={() => {
              setActiveTab('Crime Intelligence Chat');
              window.dispatchEvent(new CustomEvent('clear-chat-session'));
            }}
            className="btn btn-accent"
            style={{
              marginBottom: '16px',
              width: '100%',
              height: '38px',
              fontSize: '11.5px',
              gap: '6px',
              padding: sidebarCollapsed ? '0' : '0 16px',
              justifyContent: 'center',
              borderRadius: '10px'
            }}
          >
            <Plus size={16} />
            {!sidebarCollapsed && <span>New Investigation</span>}
          </button>

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
                {!sidebarCollapsed && <span>{item.name}</span>}
                {item.name === 'Alerts & Warnings' && unreadAlertsCount > 0 && (
                  <span className="sidebar-badge">{unreadAlertsCount}</span>
                )}
              </div>
            );
          })}
        </div>

        <div className="sidebar-footer" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {!sidebarCollapsed ? (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ color: '#FFFFFF', fontWeight: 'bold', fontSize: '12.5px' }}>{sessionUser?.name}</div>
                <div style={{ fontSize: '9px', color: 'var(--color-secondary-light)' }}>ID: {sessionUser?.id}</div>
              </div>
              <button onClick={handleLogout} style={{ background: 'none', border: 'none', color: '#A0AEC0', cursor: 'pointer' }}>
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <button onClick={handleLogout} style={{ background: 'none', border: 'none', color: '#A0AEC0', cursor: 'pointer', display: 'flex', justifyContent: 'center', width: '100%' }}>
              <LogOut size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Main Workspace */}
      <div className="workspace">
        <div className="header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {sidebarCollapsed && (
              <button 
                onClick={() => setSidebarCollapsed(false)}
                style={{ background: 'none', border: 'none', color: '#FFFFFF', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
              >
                <Menu size={20} />
              </button>
            )}
            <div className="header-brand">
              <h1 className="header-title" style={{ fontSize: '15px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Sparkles size={16} color="var(--color-accent-blue)" /> KAVERI Crime Analytics Platform
              </h1>
              <div className="header-subtitle">Karnataka State Police | Intelligence Department</div>
            </div>
          </div>

          {/* Top Control Header Section */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            {/* Live Records Search */}
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Search size={14} style={{ position: 'absolute', left: '10px', color: 'var(--color-text-secondary)' }} />
              <input 
                type="text" 
                placeholder="Global records search..." 
                className="form-control" 
                value={tabSearch}
                onChange={(e) => setTabSearch(e.target.value)}
                style={{ 
                  paddingLeft: '32px', 
                  width: '220px', 
                  height: '34px', 
                  fontSize: '11px',
                  backgroundColor: 'rgba(255,255,255,0.03)',
                  borderColor: 'var(--color-border)'
                }}
              />
            </div>

            {/* Notification triggers alerts view */}
            <div style={{ position: 'relative', cursor: 'pointer', padding: '6px', borderRadius: '50%', background: 'rgba(255,255,255,0.03)' }} onClick={() => setActiveTab('Alerts & Warnings')}>
              <Bell size={16} color="var(--color-text-secondary)" />
              {unreadAlertsCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-2px',
                  right: '-2px',
                  backgroundColor: 'var(--color-danger)',
                  color: '#FFFFFF',
                  fontSize: '8px',
                  borderRadius: '50%',
                  width: '14px',
                  height: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold'
                }}>
                  {unreadAlertsCount}
                </span>
              )}
            </div>

            {/* Profile badge info */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderLeft: '1px solid var(--color-border)', paddingLeft: '16px' }}>
              <div style={{
                width: '30px',
                height: '30px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--color-secondary) 0%, var(--color-accent-purple) 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                fontSize: '11px',
                color: '#FFFFFF'
              }}>
                {sessionUser?.name ? sessionUser.name.charAt(0) : 'I'}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '11px', fontWeight: 'bold' }}>{sessionUser?.name}</span>
                <span style={{ fontSize: '8px', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>{sessionUser?.role}</span>
              </div>
            </div>

            {/* Theme Toggle Button */}
            <button 
              onClick={toggleTheme}
              style={{
                backgroundColor: 'rgba(99, 102, 241, 0.15)',
                border: '1px solid rgba(99, 102, 241, 0.3)',
                color: 'var(--color-secondary-light)',
                padding: '6px 12px',
                fontSize: '10px',
                fontWeight: 'bold',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                transition: 'var(--transition-smooth)'
              }}
            >
              <span>{theme === 'light' ? '☀️ Light Mode' : '🌙 Dark Mode'}</span>
            </button>
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
              {/* Row 1: Forecasting & Districts */}
              <div className="grid-container grid-2-1" style={{ marginBottom: '24px' }}>
                <div className="card">
                  <div className="card-header">
                    <span className="card-title">
                      <BarChart3 size={18} /> Proactive Crime Forecasting (3-Month Projected Trend)
                    </span>
                    <span style={{ fontSize: '11px', color: '#D97706', fontWeight: 'bold' }}>
                      ● Gold: Projected Forecast (AI Model)
                    </span>
                  </div>
                  <TrendChart data={forecastData.length > 0 ? forecastData : trendData} type="bar" />
                </div>
                
                <div className="card">
                  <div className="card-header">
                    <span className="card-title"><MapPin size={18} /> District Jurisdiction Distribution</span>
                  </div>
                  <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
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

              {/* Row 2: Category Breakdown & Offender Risk */}
              <div className="grid-container grid-2-1" style={{ marginBottom: '24px' }}>
                <div className="card">
                  <div className="card-header">
                    <span className="card-title"><BarChart3 size={18} /> Top Incident Categories (IPC Breakdown)</span>
                  </div>
                  <TrendChart data={crimeTypeData} type="pie" />
                </div>

                <div className="card">
                  <div className="card-header">
                    <span className="card-title"><Shield size={18} /> Offender Risk Score Distribution</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 2fr', gap: '15px', alignItems: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {riskDistribution.map(r => (
                        <div key={r.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 10px', borderLeft: `4px solid ${r.color}`, background: '#F8FAFC', borderRadius: '4px' }}>
                          <span style={{ fontSize: '11px', fontWeight: '500' }}>{r.name.split(' ')[0]}</span>
                          <strong style={{ fontSize: '12px' }}>{r.value} profiles</strong>
                        </div>
                      ))}
                    </div>
                    <TrendChart data={riskDistribution} type="bar" />
                  </div>
                </div>
              </div>

              {/* Row 3: Socio-demographic insights */}
              <div className="grid-container grid-2-1" style={{ marginBottom: '24px' }}>
                
                {/* Offender Socio-Demographics card */}
                <div className="card">
                  <div className="card-header" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '8px', borderBottom: 'none', marginBottom: '10px' }}>
                    <span className="card-title"><Users size={18} /> Offender Socio-Demographic Ratios</span>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      {['education', 'occupation', 'socioEconomic'].map(tab => (
                        <button
                          key={tab}
                          onClick={() => setOffenderDemoType(tab)}
                          className={`btn ${offenderDemoType === tab ? '' : 'btn-secondary'}`}
                          style={{ height: '26px', fontSize: '10px', padding: '0 8px', textTransform: 'capitalize' }}
                        >
                          {tab === 'socioEconomic' ? 'Socio-Economic' : tab}
                        </button>
                      ))}
                    </div>
                  </div>
                  {offenderDemographics ? (
                    <TrendChart 
                      data={offenderDemographics[offenderDemoType] || []} 
                      type="horizontal-bar" 
                    />
                  ) : (
                    <div style={{ height: '280px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#718096' }}>
                      Loading Demographics...
                    </div>
                  )}
                </div>

                {/* Victim Socio-Demographics card */}
                <div className="card">
                  <div className="card-header" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '8px', borderBottom: 'none', marginBottom: '10px' }}>
                    <span className="card-title"><Users size={18} /> Victim Demographics & Social Indicators</span>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      {['ageGroups', 'gender', 'socioEconomic'].map(tab => (
                        <button
                          key={tab}
                          onClick={() => setVictimDemoType(tab)}
                          className={`btn ${victimDemoType === tab ? '' : 'btn-secondary'}`}
                          style={{ height: '26px', fontSize: '10px', padding: '0 8px', textTransform: 'capitalize' }}
                        >
                          {tab === 'ageGroups' ? 'Age Groups' : tab === 'socioEconomic' ? 'Socio-Economic' : tab}
                        </button>
                      ))}
                    </div>
                  </div>
                  {victimDemographics ? (
                    <TrendChart 
                      data={victimDemographics[victimDemoType] || []} 
                      type="horizontal-bar" 
                    />
                  ) : (
                    <div style={{ height: '280px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#718096' }}>
                      Loading Demographics...
                    </div>
                  )}
                </div>

              </div>

              {/* Row 4: Sociological Insights Advisory Card */}
              <div className="card" style={{ borderLeft: '4px solid var(--color-accent-blue)', background: '#F0F9FF', marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <span style={{ fontSize: '20px' }}>💡</span>
                  <h4 style={{ color: 'var(--color-primary)', margin: 0, fontSize: '15px' }}>Sociological & Criminological Findings Advisory</h4>
                </div>
                <div style={{ fontSize: '13px', lineHeight: '1.6', color: '#1E293B' }}>
                  <p style={{ marginBottom: '10px' }}>
                    <strong>Risk Factors Analysis:</strong> Across Karnataka's crime database, the <strong>18-30 (Youth)</strong> age bracket represents the largest offender segment, accounting for approximately <strong>42%</strong> of profiles. There is a high correlation between regions with rapid urbanization (e.g., Bengaluru Urban) and snatching/theft hotspots.
                  </p>
                  <p style={{ marginBottom: '10px' }}>
                    <strong>Socio-Economic Correlation:</strong> Offender demographics reveal that <strong>Lower Class</strong> socio-economic background and <strong>Unemployed</strong> status comprise a significant percentage of property crimes (burglaries/thefts). The modus operandi of 'Shadow Gang' burglaries occurs in specific weekend night windows, correlating with high economic stress and seasonal migration patterns.
                  </p>
                  <p style={{ margin: 0 }}>
                    <strong>Policy Recommendation:</strong> Law enforcement supervisors should direct preventative night patrols during peak weekend hours (10 PM - 2 AM) in identified hotspot zones. Criminological profiling suggests integrating rehabilitation and vocational employment schemes in urban clusters to address these systemic risk factors.
                  </p>
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
