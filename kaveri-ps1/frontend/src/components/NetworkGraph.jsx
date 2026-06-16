import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { useGraph } from '../hooks/useGraph';
import { RefreshCw, ZoomIn, ZoomOut, Maximize } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';

function NetworkGraph() {
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { data, loading, fetchGraph } = useGraph();
  const [selectedNode, setSelectedNode] = useState(null);
  const [activeNetwork, setActiveNetwork] = useState('gang_networks'); // 'gang_networks' | 'accused_connections' | 'repeat_offenders'

  useEffect(() => {
    // Initial fetch of Shadow Gang network
    if (activeNetwork === 'accused_connections') {
      fetchGraph('accused_connections', { accused_id: 'ACC-HIGHRISK-001' });
    } else if (activeNetwork === 'repeat_offenders') {
      fetchGraph('repeat_offenders', { district: 'Bengaluru Urban' });
    } else {
      fetchGraph('gang_networks');
    }
  }, [activeNetwork, fetchGraph]);

  useEffect(() => {
    if (!svgRef.current || !data || !data.nodes || data.nodes.length === 0) return;

    // Clear previous SVG contents
    d3.select(svgRef.current).selectAll('*').remove();

    const width = containerRef.current.clientWidth || 600;
    const height = 480;

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', [0, 0, width, height]);

    // Create a container group for zoom/pan
    const g = svg.append('g');

    // Add Zoom behavior
    const zoom = d3.zoom()
      .scaleExtent([0.3, 3])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });
    
    svg.call(zoom);

    // Color definitions
    const colors = {
      Accused: '#0F172A',
      FIR: '#D97706',
      Victim: '#10B981',
      BankAccount: '#64748B',
      Location: '#3B82F6'
    };

    // Node sizes
    const radius = {
      Accused: 10,
      FIR: 8,
      Victim: 7,
      BankAccount: 8,
      Location: 6
    };

    // Prepare links and nodes
    const links = data.edges.map(d => ({ ...d }));
    const nodes = data.nodes.map(d => ({ ...d }));

    // D3 Simulation Setup
    const simulation = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(links).id(d => d.id).distance(80))
      .force('charge', d3.forceManyBody().strength(-150))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(20));

    // Draw Links
    const link = g.append('g')
      .attr('stroke', '#A0AEC0')
      .attr('stroke-opacity', 0.6)
      .attr('stroke-width', d => d.relationship === 'CO_ACCUSED' ? 2 : 1)
      .selectAll('line')
      .data(links)
      .join('line');

    // Link labels (e.g. relation names)
    const linkText = g.append('g')
      .selectAll('text')
      .data(links)
      .join('text')
      .attr('font-size', '7px')
      .attr('fill', '#718096')
      .attr('text-anchor', 'middle')
      .text(d => d.relationship);

    // Draw Nodes
    const node = g.append('g')
      .attr('stroke', '#fff')
      .attr('stroke-width', 1.5)
      .selectAll('g')
      .data(nodes)
      .join('g')
      .call(d3.drag()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended))
      .on('click', (event, d) => {
        setSelectedNode(d);
      });

    // Node circles
    node.append('circle')
      .attr('r', d => radius[d.type] || 8)
      .attr('fill', d => {
        // High risk accused color code to red
        if (d.type === 'Accused' && d.riskScore && d.riskScore >= 80) {
          return '#EF4444'; // Critical Red
        }
        return colors[d.type] || '#CBD5E0';
      })
      .style('cursor', 'pointer')
      .style('transition', 'all 0.2s ease')
      .on('mouseover', function(event, d) {
        d3.select(this)
          .attr('r', (radius[d.type] || 8) + 4)
          .style('filter', 'drop-shadow(0px 0px 8px rgba(217, 119, 6, 0.5))');
      })
      .on('mouseout', function(event, d) {
        d3.select(this)
          .attr('r', radius[d.type] || 8)
          .style('filter', 'none');
      });

    // Node Labels
    node.append('text')
      .attr('x', 14)
      .attr('y', 4)
      .attr('font-size', '9px')
      .attr('font-weight', '500')
      .attr('fill', '#2D3748')
      .attr('stroke', 'none')
      .text(d => d.label);

    // Update positions on tick
    simulation.on('tick', () => {
      link
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y);

      linkText
        .attr('x', d => (d.source.x + d.target.x) / 2)
        .attr('y', d => (d.source.y + d.target.y) / 2 - 4);

      node
        .attr('transform', d => `translate(${d.x}, ${d.y})`);
    });

    // Drag helper functions
    function dragstarted(event, d) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event, d) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event, d) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

    return () => {
      simulation.stop();
    };
  }, [data]);

  return (
    <div style={{ display: 'flex', gap: '20px', flexDirection: 'column' }}>
      
      {/* Network Selectors */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <button 
          onClick={() => setActiveNetwork('gang_networks')} 
          className={`btn ${activeNetwork === 'gang_networks' ? '' : 'btn-secondary'}`}
          style={{ height: '32px', fontSize: '11px', padding: '0 12px' }}
        >
          Shadow Burglary Gang (5-Node)
        </button>
        <button 
          onClick={() => setActiveNetwork('accused_connections')} 
          className={`btn ${activeNetwork === 'accused_connections' ? '' : 'btn-secondary'}`}
          style={{ height: '32px', fontSize: '11px', padding: '0 12px' }}
        >
          Ravi Shankar Gowda Dossier (Attempted Murder)
        </button>
        <button 
          onClick={() => setActiveNetwork('repeat_offenders')} 
          className={`btn ${activeNetwork === 'repeat_offenders' ? '' : 'btn-secondary'}`}
          style={{ height: '32px', fontSize: '11px', padding: '0 12px' }}
        >
          Bengaluru Urban Repeat Offenders List
        </button>
      </div>

      <div ref={containerRef} style={{ display: 'grid', gridTemplateColumns: '3fr 1.2fr', gap: '20px', position: 'relative' }}>
        
        {/* D3 Graph SVG container */}
        <div style={{ position: 'relative', border: '1px solid #D1D5DB', borderRadius: '4px', backgroundColor: '#F8FAFC' }}>
          {loading && (
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
              backgroundColor: 'rgba(255,255,255,0.7)', display: 'flex',
              alignItems: 'center', justifyContent: 'center', zIndex: 10,
              fontWeight: 'bold', color: '#1B2A4A'
            }}>
              <RefreshCw className="typing-dot" style={{ marginRight: '8px', animation: 'spin 2s linear infinite' }} />
              Querying Network Graph...
            </div>
          )}
          <svg ref={svgRef} className="graph-container" style={{ margin: 0 }}></svg>
        </div>

        {/* Node Detail Inspector panel */}
        <div style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid #D1D5DB',
          borderRadius: '4px',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          maxHeight: '480px',
          overflowY: 'auto'
        }}>
          <div>
            <h4 style={{ fontSize: '12px', color: '#1B2A4A', textTransform: 'uppercase', borderBottom: '1px solid #E2E8F0', paddingBottom: '6px', marginBottom: '12px' }}>
              Node Investigator Card
            </h4>
            
            {selectedNode ? (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                  <span style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: selectedNode.type === 'Accused' ? (selectedNode.riskScore >= 80 ? '#9B1C1C' : '#1B2A4A') : '#C8922A'
                  }}></span>
                  <strong style={{ fontSize: '14px', color: '#1A1A2E' }}>{selectedNode.label}</strong>
                </div>
                
                <div style={{ fontSize: '11px', color: '#4A5568', textTransform: 'uppercase', marginTop: '12px' }}>Type</div>
                <div style={{ fontWeight: '600' }}>{selectedNode.type}</div>

                <div style={{ fontSize: '11px', color: '#4A5568', textTransform: 'uppercase', marginTop: '12px' }}>Operational ID</div>
                <div style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>{selectedNode.id}</div>

                {selectedNode.riskScore && (
                  <div>
                    <div style={{ fontSize: '11px', color: '#4A5568', textTransform: 'uppercase', marginTop: '12px' }}>Model Risk Rating</div>
                    <div style={{ 
                      color: selectedNode.riskScore >= 80 ? '#9B1C1C' : '#C8922A', 
                      fontWeight: '700',
                      fontSize: '13px'
                    }}>
                      {selectedNode.riskScore}% ({selectedNode.riskScore >= 80 ? 'Critical' : 'High'})
                    </div>
                  </div>
                )}

                {selectedNode.type === 'Accused' && (
                  <div style={{ marginTop: '16px', padding: '8px', background: '#F8FAFC', borderLeft: '3px solid #1B2A4A', fontSize: '12px' }}>
                    <strong>Burglary Mode:</strong>
                    <p style={{ fontStyle: 'italic', margin: '4px 0 0 0' }}>
                      {selectedNode.id.includes('SHADOW') ? "Breaks rear window latch between 2am-4am" : "Assaults victim with weapon after snatching bag"}
                    </p>
                  </div>
                )}

                {selectedNode.type === 'FIR' && (
                  <button 
                    className="btn btn-secondary" 
                    style={{ marginTop: '16px', width: '100%', fontSize: '12px', height: '36px' }}
                    onClick={() => navigate(`/case/${selectedNode.id}`)}
                  >
                    View Case Dossier
                  </button>
                )}

                {selectedNode.type === 'Accused' && (
                  <button 
                    className="btn btn-secondary" 
                    style={{ marginTop: '16px', width: '100%', fontSize: '12px', height: '36px' }}
                    onClick={() => {
                      setSearchParams({ tab: 'Offender Profiles', search: selectedNode.label });
                    }}
                  >
                    Inspect Profile
                  </button>
                )}
              </div>
            ) : (
              <div style={{ color: '#718096', fontSize: '12.5px', fontStyle: 'italic', textAlign: 'center', padding: '20px 0' }}>
                Select any node in the graph layout to inspect active police files.
              </div>
            )}
          </div>

          <div style={{ fontSize: '10px', color: '#A0AEC0', borderTop: '1px solid #E2E8F0', paddingTop: '8px', marginTop: '20px' }}>
            Scroll to zoom. Drag nodes to pin layout coordinates.
          </div>
        </div>
      </div>
    </div>
  );
}

export default NetworkGraph;
