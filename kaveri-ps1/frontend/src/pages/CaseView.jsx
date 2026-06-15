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
    <div style={{ minHeight: '100vh', backgroundColor: '#F5F6F8' }}>
      {/* Top Header */}
      <div style={{
        backgroundColor: '#1B2A4A',
        color: '#FFFFFF',
        padding: '16px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '4px solid #C8922A'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Shield style={{ color: '#C8922A' }} />
          <div>
            <h1 style={{ fontSize: '18px', margin: 0, color: '#FFFFFF' }}>KAVERI Case Dossier</h1>
            <p style={{ fontSize: '10px', color: '#C8922A', margin: 0, textTransform: 'uppercase' }}>
              Karnataka State Police | CONFIDENTIAL RECORD
            </p>
          </div>
        </div>
        <button onClick={() => navigate('/dashboard')} className="btn btn-secondary" style={{ color: '#FFFFFF', borderColor: '#FFFFFF' }}>
          <ArrowLeft size={16} /> Return to Dashboard
        </button>
      </div>

      <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
        {/* Warning Banner */}
        <div style={{
          backgroundColor: '#FFF5F5',
          border: '1px solid #FED7D7',
          color: '#C53030',
          padding: '12px 16px',
          borderRadius: '4px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          fontSize: '12px'
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
                  backgroundColor: caseData.investigation_status === 'Open' ? '#FFF5F5' : '#F0FFF4',
                  color: caseData.investigation_status === 'Open' ? '#C53030' : '#22543D',
                  padding: '4px 8px',
                  fontWeight: 'bold',
                  fontSize: '12px',
                  borderRadius: '4px'
                }}>
                  Status: {caseData.investigation_status.toUpperCase()}
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                <div>
                  <div style={{ fontSize: '11px', color: '#4A5568', textTransform: 'uppercase' }}>Crime Category</div>
                  <strong style={{ fontSize: '15px' }}>{caseData.crime_type}</strong>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: '#4A5568', textTransform: 'uppercase' }}>IPC Sections</div>
                  <strong style={{ fontSize: '15px' }}>IPC Section {caseData.ipc_section}</strong>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#4A5568', textTransform: 'uppercase' }}>
                    <Calendar size={12} /> Date of Incident
                  </div>
                  <strong>{caseData.date_of_incident}</strong>
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#4A5568', textTransform: 'uppercase' }}>
                    <MapPin size={12} /> Police Jurisdiction
                  </div>
                  <strong>{caseData.police_station} ({caseData.district})</strong>
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontSize: '11px', color: '#4A5568', textTransform: 'uppercase' }}>Modus Operandi (MO)</div>
                <div style={{ backgroundColor: '#F8FAFC', padding: '12px', borderLeft: '3px solid #C8922A', fontStyle: 'italic' }}>
                  "{caseData.modus_operandi}"
                </div>
              </div>

              <div style={{ marginBottom: '10px' }}>
                <div style={{ fontSize: '11px', color: '#4A5568', textTransform: 'uppercase' }}>Full Narrative / FIR Text</div>
                <p style={{ lineHeight: '1.6', color: '#1A1A2E', whiteSpace: 'pre-line' }}>{caseData.fir_text}</p>
              </div>
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
                <div key={acc.accused_id} style={{ borderBottom: '1px solid #E2E8F0', paddingBottom: '12px', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong>{acc.name}</strong>
                    <RiskScoreBadge score={acc.risk_score} />
                  </div>
                  <div style={{ fontSize: '11px', color: '#4A5568', marginTop: '4px' }}>
                    ID: {acc.accused_id} | Age: {acc.age} | Status: {acc.status}
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
                <div key={vic.victim_id} style={{ fontSize: '13px' }}>
                  <strong>{vic.name}</strong>
                  <div style={{ fontSize: '11px', color: '#4A5568', marginTop: '2px' }}>
                    ID: {vic.victim_id} | Age: {vic.age} | Gender: {vic.gender}
                  </div>
                  <div style={{ fontSize: '11px', color: '#4A5568', marginTop: '2px' }}>
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
              <div style={{ fontSize: '12px', color: '#4A5568' }}>
                <p><strong>Description:</strong> {caseData.location_description}</p>
                <div style={{
                  backgroundColor: '#F8FAFC',
                  padding: '10px',
                  border: '1px solid #E2E8F0',
                  marginTop: '10px',
                  fontFamily: 'monospace'
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
