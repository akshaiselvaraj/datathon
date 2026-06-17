import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Shield, ArrowLeft, Calendar, MapPin, User, FileText, AlertTriangle } from 'lucide-react';
import RiskScoreBadge from '../components/RiskScoreBadge';

function CaseView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [sessionUser, setSessionUser] = useState(null);
  const [caseData, setCaseData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get session
    const savedUser = localStorage.getItem('ksp_user_session');
    if (!savedUser) {
      navigate('/login');
      return;
    }
    const user = JSON.parse(savedUser);
    setSessionUser(user);

    // Simulated fetch of case details. 
    // In a real application this calls backend `/case?id=ID`
    setTimeout(() => {
      // Mock details matching our planted patterns
      let mockCase = {
        fir_id: id,
        district: 'Bengaluru Urban',
        police_station: 'Rajajinagar Police Station',
        ipc_section: '307',
        crime_type: 'Attempt to Murder',
        date_of_incident: '2026-05-12',
        location_description: 'Rajajinagar Main Road, Near Metro Station Pillar 42',
        latitude: 12.9904,
        longitude: 77.5532,
        modus_operandi: 'Assaults victim with weapon after snatching bag',
        investigation_status: 'Open',
        fir_text: `An incident of Attempt to Murder was reported at Rajajinagar Police Station, Bengaluru Urban. The victim was walking home when the suspect approached from behind and attempted to snatch a shoulder bag. When the victim resisted, the suspect drew a sharp metal weapon and assaulted the victim, causing severe injuries. Suspect identified by witnesses as repeat offender Ravi Shankar Gowda. Investigation status: Open.`,
        accused: [
          { accused_id: 'ACC-HIGHRISK-001', name: 'Ravi Shankar Gowda', age: 34, gender: 'Male', risk_score: 94.0, status: 'Out on Bail' }
        ],
        victims: [
          { victim_id: 'VIC-1002', name: 'S. Nagaraj', age: 48, gender: 'Male', address: 'Rajajinagar, Bengaluru' }
        ]
      };

      if (id.includes('SHADOW')) {
        mockCase = {
          fir_id: id,
          district: 'Bengaluru Urban',
          police_station: 'Koramangala Police Station',
          ipc_section: '380',
          crime_type: 'Theft in Dwelling House',
          date_of_incident: '2026-06-01',
          location_description: 'Koramangala 4th Block Residential Layout',
          latitude: 12.9352,
          longitude: 77.6244,
          modus_operandi: 'Breaks rear window latch between 2am-4am',
          investigation_status: 'Open',
          fir_text: `A night burglary was reported at Koramangala 4th Block. The residents were away. Suspect entered the premises between 02:00 and 04:00 hours. The forensic squad noted that the suspect breaks rear window latch between 2am-4am. Digital forensics traced a linked bank account transaction (SHADOW-BANK-ACCT-777) transferring illicit proceeds. Case is linked to the Shadow Gang network.`,
          accused: [
            { accused_id: 'ACC-SHADOW-001', name: 'Shadow Member 1', age: 24, gender: 'Male', risk_score: 72.5, status: 'Under Investigation' },
            { accused_id: 'ACC-SHADOW-002', name: 'Shadow Member 2', age: 26, gender: 'Male', risk_score: 72.5, status: 'Under Investigation' }
          ],
          victims: [
            { victim_id: 'VIC-3011', name: 'Lalitha Krishnan', age: 62, gender: 'Female', address: 'Koramangala 4th Block, Bengaluru' }
          ]
        };
      }

      setCaseData(mockCase);
      loading && setLoading(false);
    }, 400);

  }, [id, navigate]);

  if (loading) {
    return (
      <div style={{ padding: '50px', textAlign: 'center', color: '#1B2A4A', fontWeight: 'bold' }}>
        Loading Confidential Case Files...
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-bg)' }}>
      {/* Top Header */}
      <div style={{
        background: 'linear-gradient(135deg, var(--color-sidebar-bg) 0%, var(--color-primary) 100%)',
        color: '#FFFFFF',
        padding: '16px 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '3px solid var(--color-secondary)',
        boxShadow: 'var(--shadow-md)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Shield style={{ color: 'var(--color-secondary-light)' }} />
          <div>
            <h1 style={{ fontSize: '18px', margin: 0, color: '#FFFFFF', letterSpacing: '0.5px' }}>KAVERI Case Dossier</h1>
            <p style={{ fontSize: '10px', color: 'var(--color-secondary-light)', margin: 0, textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '600' }}>
              Karnataka State Police | CONFIDENTIAL RECORD
            </p>
          </div>
        </div>
        <button onClick={() => navigate('/dashboard?tab=Case Reports')} className="btn btn-secondary" style={{ color: '#FFFFFF', borderColor: 'rgba(255,255,255,0.4)', backgroundColor: 'transparent' }}>
          <ArrowLeft size={16} /> Return to Case Archives
        </button>
      </div>

      <div style={{ padding: '32px', maxWidth: '1200px', margin: '0 auto' }}>
        {/* Warning Banner */}
        <div style={{
          backgroundColor: '#FEF2F2',
          border: '1px solid #FEE2E2',
          color: 'var(--color-danger)',
          padding: '14px 20px',
          borderRadius: 'var(--radius-md)',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          fontSize: '12.5px',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <AlertTriangle size={18} />
          <span><strong>RESTRICTED INFORMATION:</strong> Access to this dossier is audited under user <strong>{sessionUser?.name}</strong>. Unauthorized sharing of this data violates the Government Security Protocol.</span>
        </div>

        <div className="grid-container grid-2-1">
          {/* Main Case Details */}
          <div>
            <div className="card">
              <div className="card-header">
                <span className="card-title"><FileText size={18} /> Case Details: {caseData.fir_id}</span>
                <span style={{
                  backgroundColor: caseData.investigation_status === 'Open' ? '#FFF5F5' : '#ECFDF5',
                  color: caseData.investigation_status === 'Open' ? 'var(--color-danger)' : 'var(--color-success)',
                  padding: '6px 12px',
                  fontWeight: 'bold',
                  fontSize: '12px',
                  borderRadius: 'var(--radius-sm)',
                  border: `1px solid ${caseData.investigation_status === 'Open' ? '#FEE2E2' : '#D1FAE5'}`
                }}>
                  Status: {caseData.investigation_status.toUpperCase()}
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', textTransform: 'uppercase', fontWeight: '600', letterSpacing: '0.5px' }}>Crime Category</div>
                  <strong style={{ fontSize: '16px', color: 'var(--color-primary)' }}>{caseData.crime_type}</strong>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', textTransform: 'uppercase', fontWeight: '600', letterSpacing: '0.5px' }}>IPC Sections</div>
                  <strong style={{ fontSize: '16px', color: 'var(--color-primary)' }}>IPC Section {caseData.ipc_section}</strong>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--color-text-secondary)', textTransform: 'uppercase', fontWeight: '600', letterSpacing: '0.5px' }}>
                    <Calendar size={12} /> Date of Incident
                  </div>
                  <strong style={{ fontSize: '14px', color: 'var(--color-text-primary)' }}>{caseData.date_of_incident}</strong>
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--color-text-secondary)', textTransform: 'uppercase', fontWeight: '600', letterSpacing: '0.5px' }}>
                    <MapPin size={12} /> Police Jurisdiction
                  </div>
                  <strong style={{ fontSize: '14px', color: 'var(--color-text-primary)' }}>{caseData.police_station} ({caseData.district})</strong>
                </div>
              </div>

              {/* Automated Case Timeline */}
              <div style={{ marginBottom: '24px' }}>
                <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', textTransform: 'uppercase', fontWeight: '600', letterSpacing: '0.5px', marginBottom: '12px' }}>Automated Case Timeline & Audit Trail</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', padding: '10px 0' }}>
                  {/* Background line */}
                  <div style={{ position: 'absolute', top: '22px', left: '20px', right: '20px', height: '2px', backgroundColor: '#E2E8F0', zIndex: 1 }}></div>
                  
                  {/* Steps */}
                  {[
                    { title: 'FIR Filed', date: caseData.date_of_incident },
                    { title: 'CSI Dispatched', date: 'Day +1' },
                    { title: 'Bank Linked', date: 'Day +3' },
                    { title: 'Risk Scored', date: 'Day +5' },
                    { title: 'Status', date: caseData.investigation_status === 'Open' ? 'Active Investigation' : 'Case Concluded', active: true }
                  ].map((step, idx) => (
                    <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', zIndex: 2, width: '18%' }}>
                      <div style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        backgroundColor: step.active ? (caseData.investigation_status === 'Open' ? 'var(--color-secondary)' : 'var(--color-success)') : 'var(--color-primary)',
                        color: '#FFFFFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '10px',
                        fontWeight: 'bold',
                        boxShadow: '0 0 8px rgba(0,0,0,0.1)'
                      }}>
                        {idx + 1}
                      </div>
                      <span style={{ fontSize: '11px', fontWeight: '600', marginTop: '6px', color: 'var(--color-primary)', textAlign: 'center' }}>{step.title}</span>
                      <span style={{ fontSize: '9px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>{step.date}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', textTransform: 'uppercase', fontWeight: '600', letterSpacing: '0.5px', marginBottom: '6px' }}>Modus Operandi (MO)</div>
                <div style={{ backgroundColor: '#F8FAFC', padding: '14px', borderLeft: '3px solid var(--color-secondary)', fontStyle: 'italic', borderRadius: '0 var(--radius-md) var(--radius-md) 0' }}>
                  "{caseData.modus_operandi}"
                </div>
              </div>

              <div style={{ marginBottom: '10px' }}>
                <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', textTransform: 'uppercase', fontWeight: '600', letterSpacing: '0.5px', marginBottom: '6px' }}>Full Narrative / FIR Text</div>
                <p style={{ lineHeight: '1.7', color: 'var(--color-text-primary)', whiteSpace: 'pre-line', fontSize: '13.5px' }}>{caseData.fir_text}</p>
              </div>
            </div>

            {/* Similar cases list */}
            <div className="card">
              <div className="card-header">
                <span className="card-title">Similar Past Cases & Outcomes</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {(id.includes('HIGHRISK') ? [
                  { fir_id: 'FIR-HIGHRISK-006', crime_type: 'Attempt to Murder', date: '2026-05-01', match: '98% MO Match' },
                  { fir_id: 'FIR-HIGHRISK-007', crime_type: 'Attempt to Murder', date: '2026-05-15', match: '98% MO Match' }
                ] : id.includes('SHADOW') ? [
                  { fir_id: 'FIR-SHADOW-002', crime_type: 'Theft in Dwelling House', date: '2026-05-20', match: '100% MO Match' },
                  { fir_id: 'FIR-SHADOW-003', crime_type: 'Theft in Dwelling House', date: '2026-05-25', match: '100% MO Match' }
                ] : [
                  { fir_id: 'FIR-HOTSPOT-001', crime_type: 'Theft', date: '2026-06-07', match: '92% MO Match' },
                  { fir_id: 'FIR-HOTSPOT-002', crime_type: 'Theft', date: '2026-06-07', match: '92% MO Match' }
                ]).map(sc => (
                  <div key={sc.fir_id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', background: '#F8FAFC' }}>
                    <div>
                      <strong 
                        className="chat-entity-link" 
                        onClick={() => navigate(`/case/${sc.fir_id}`)}
                      >
                        {sc.fir_id}
                      </strong>
                      <span style={{ fontSize: '12.5px', color: 'var(--color-text-primary)', marginLeft: '10px' }}>{sc.crime_type} ({sc.date})</span>
                    </div>
                    <span style={{ backgroundColor: '#FEF3C7', color: '#D97706', fontSize: '10px', fontWeight: 'bold', padding: '2px 8px', borderRadius: '10px' }}>{sc.match}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Actionable recommendations */}
            <div className="card" style={{ borderLeft: '4px solid var(--color-success)', background: '#F0FDF4' }}>
              <div className="card-header" style={{ borderBottom: 'none', paddingBottom: 0, marginBottom: '10px' }}>
                <span className="card-title" style={{ color: '#166534' }}>Recommended Investigative Leads</span>
              </div>
              <ul style={{ listStyleType: 'none', paddingLeft: 0, fontSize: '13px', lineHeight: '1.6', color: '#166534' }}>
                {(id.includes('HIGHRISK') ? [
                  "Verify alibi of suspect Ravi Shankar Gowda during incident window (10 PM - 2 AM).",
                  "Subpoena cellphone tower coordinates near Rajajinagar Main Road for suspect device.",
                  "Interview shopkeepers near Metro Station Pillar 42 to identify search weapon purchases."
                ] : id.includes('SHADOW') ? [
                  "Request forensic latent print matches on rear window latch coordinates.",
                  "Subpoena ledger details for bank account SHADOW-BANK-ACCT-777 from linked branch.",
                  "Coordinate with Mysuru Task Force to map suspect vehicle tracks across districts."
                ] : [
                  "Verify CCTV feeds from nearby junctions corresponding to incident timestamp.",
                  "Compare fingerprints against local theft registry repeat suspects."
                ]).map((lead, idx) => (
                  <li key={idx} style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'flex-start' }}>
                    <span style={{ fontWeight: 'bold' }}>✓</span>
                    <span>{lead}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Accused & Victims Sidebar */}
          <div>
            {/* Accused Card */}
            <div className="card">
              <div className="card-header">
                <span className="card-title"><User size={18} /> Linked Accused ({caseData.accused.length})</span>
              </div>
              {caseData.accused.map(acc => (
                <div 
                  key={acc.accused_id} 
                  className="highlight-panel" 
                  style={{ marginBottom: '12px' }}
                  onClick={() => {
                    navigate(`/dashboard?tab=Offender Profiles&search=${acc.accused_id}`);
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong style={{ color: 'var(--color-primary)' }}>{acc.name}</strong>
                    <RiskScoreBadge score={acc.risk_score} />
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                    ID: {acc.accused_id} | Age: {acc.age} | Status: {acc.status}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--color-accent-blue)', marginTop: '6px', fontWeight: 'bold' }}>
                    Inspect Offender Profile &rarr;
                  </div>
                </div>
              ))}
            </div>

            {/* Victims Card */}
            <div className="card">
              <div className="card-header">
                <span className="card-title">Victim Profiles ({caseData.victims.length})</span>
              </div>
              {caseData.victims.map(vic => (
                <div key={vic.victim_id} style={{ fontSize: '13.5px', marginBottom: '12px', borderBottom: '1px solid var(--color-border)', paddingBottom: '12px' }}>
                  <strong style={{ color: 'var(--color-primary)' }}>{vic.name}</strong>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                    ID: {vic.victim_id} | Age: {vic.age} | Gender: {vic.gender}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                    Address: {vic.address}
                  </div>
                </div>
              ))}
            </div>

            {/* Geolocation Card */}
            <div className="card">
              <div className="card-header">
                <span className="card-title"><MapPin size={18} /> Location Details</span>
              </div>
              <div style={{ fontSize: '13px', color: 'var(--color-text-primary)' }}>
                <p style={{ marginBottom: '10px' }}><strong>Description:</strong> {caseData.location_description}</p>
                <div style={{
                  backgroundColor: '#F8FAFC',
                  padding: '12px',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '12px',
                  lineHeight: '1.6'
                }}>
                  Latitude: {caseData.latitude}<br />
                  Longitude: {caseData.longitude}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CaseView;
