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
    const height = 440;

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

    // Color definitions (Dark mode neon)
    const colors = {
      Accused: '#8B5CF6',     /* Purple */
      FIR: '#F59E0B',         /* Amber */
      Victim: '#10B981',      /* Emerald */
      BankAccount: '#EC4899', /* Pink */
      Location: '#06B6D4'     /* Cyan */
    };

    // Node sizes
    const radius = {
      Accused: 11,
      FIR: 9,
      Victim: 8,
      BankAccount: 9,
      Location: 7
    };

    // Prepare links and nodes
    const links = data.edges.map(d => ({ ...d }));
    const nodes = data.nodes.map(d => ({ ...d }));

    // D3 Simulation Setup
    const simulation = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(links).id(d => d.id).distance(100))
      .force('charge', d3.forceManyBody().strength(-200))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(22));

    // Draw Links
    const link = g.append('g')
      .attr('stroke', 'var(--color-border)')
      .attr('stroke-width', d => d.relationship === 'CO_ACCUSED' ? 2 : 1)
      .selectAll('line')
      .data(links)
      .join('line');

    // Link labels
    const linkText = g.append('g')
      .selectAll('text')
      .data(links)
      .join('text')
      .attr('font-size', '6.5px')
      .attr('fill', 'var(--color-text-secondary)')
      .attr('text-anchor', 'middle')
      .text(d => d.relationship);

    // Draw Nodes
    const node = g.append('g')
      .attr('stroke', 'var(--color-bg)')
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

    // Node circles with glow styles
    node.append('circle')
      .attr('r', d => radius[d.type] || 8)
      .attr('fill', d => {
        if (d.type === 'Accused' && d.riskScore && d.riskScore >= 80) {
          return '#EF4444'; // Red alert risk
        }
        return colors[d.type] || '#A0AEC0';
      })
      .style('cursor', 'pointer')
      .style('transition', 'all 0.2s ease')
      .on('mouseover', function(event, d) {
        d3.select(this)
          .attr('r', (radius[d.type] || 8) + 4)
          .style('filter', 'drop-shadow(0px 0px 8px rgba(99, 102, 241, 0.6))');
      })
      .on('mouseout', function(event, d) {
        d3.select(this)
          .attr('r', radius[d.type] || 8)
          .style('filter', 'none');
      });

    // Node Labels
    node.append('text')
      .attr('x', 14)
      .attr('y', 3)
      .attr('font-size', '8px')
      .attr('font-weight', '500')
      .attr('fill', 'var(--color-text-primary)')
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
        .attr('y', d => (d.source.y + d.target.y) / 2 - 3);

      node
        .attr('transform', d => `translate(${d.x}, ${d.y})`);
    });

    // Drag helpers
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
    <div style={{ display: 'flex', gap: '16px', flexDirection: 'column' }}>
      
      {/* Network Selectors */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <button 
          onClick={() => setActiveNetwork('gang_networks')} 
          className={`btn ${activeNetwork === 'gang_networks' ? '' : 'btn-secondary'}`}
          style={{ height: '28px', fontSize: '11px', padding: '0 12px' }}
        >
          Burglary Gang Network
        </button>
        <button 
          onClick={() => setActiveNetwork('accused_connections')} 
          className={`btn ${activeNetwork === 'accused_connections' ? '' : 'btn-secondary'}`}
          style={{ height: '28px', fontSize: '11px', padding: '0 12px' }}
        >
          Ravi S. Gowda connections
        </button>
        <button 
          onClick={() => setActiveNetwork('repeat_offenders')} 
          className={`btn ${activeNetwork === 'repeat_offenders' ? '' : 'btn-secondary'}`}
          style={{ height: '28px', fontSize: '11px', padding: '0 12px' }}
        >
          Bengaluru Repeat Offenders list
        </button>
      </div>

      <div ref={containerRef} style={{ display: 'grid', gridTemplateColumns: '1.2fr 280px', gap: '16px', position: 'relative' }}>
        
        {/* D3 Graph SVG container */}
        <div style={{ position: 'relative', border: '1px solid var(--color-border)', borderRadius: '12px', overflow: 'hidden', backgroundColor: 'var(--color-surface)' }}>
          {loading && (
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
              backgroundColor: 'rgba(7, 9, 19, 0.75)', display: 'flex',
              alignItems: 'center', justifyContent: 'center', zIndex: 10,
              fontWeight: 'bold', color: '#FFFFFF'
            }}>
              <RefreshCw className="typing-dot" style={{ marginRight: '8px', animation: 'spin 2s linear infinite' }} />
              Querying Network Graph...
            </div>
          )}
          <svg ref={svgRef} className="graph-container" style={{ margin: 0, backgroundColor: 'transparent' }}></svg>
        </div>

        {/* Node Detail Inspector panel */}
        <div style={{
          backgroundColor: 'var(--color-surface)',
          backdropFilter: 'blur(8px)',
          border: '1px solid var(--color-border)',
          borderRadius: '12px',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          maxHeight: '440px',
          overflowY: 'auto'
        }}>
          <div>
            <h4 style={{ fontSize: '11.5px', color: 'var(--color-text-secondary)', textTransform: 'uppercase', borderBottom: '1px solid var(--color-border)', paddingBottom: '6px', marginBottom: '12px', letterSpacing: '0.5px' }}>
              Node Dossier Card
            </h4>
            
            {selectedNode ? (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                  <span style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: selectedNode.type === 'Accused' ? (selectedNode.riskScore >= 80 ? '#EF4444' : '#8B5CF6') : '#F59E0B'
                  }}></span>
                  <strong style={{ fontSize: '14px', color: 'var(--color-text-primary)' }}>{selectedNode.label}</strong>
                </div>
                
                <div style={{ fontSize: '10px', color: 'var(--color-text-secondary)', textTransform: 'uppercase', marginTop: '12px' }}>Type</div>
                <div style={{ fontWeight: '600', color: 'var(--color-text-primary)', fontSize: '12px' }}>{selectedNode.type}</div>

                <div style={{ fontSize: '10px', color: 'var(--color-text-secondary)', textTransform: 'uppercase', marginTop: '12px' }}>Operational ID</div>
                <div style={{ fontFamily: 'monospace', fontWeight: 'bold', color: 'var(--color-accent-blue)', fontSize: '11px' }}>{selectedNode.id}</div>

                {selectedNode.riskScore && (
                  <div>
                    <div style={{ fontSize: '10px', color: 'var(--color-text-secondary)', textTransform: 'uppercase', marginTop: '12px' }}>Model Risk Rating</div>
                    <div style={{ 
                      color: selectedNode.riskScore >= 80 ? '#EF4444' : '#F59E0B', 
                      fontWeight: '700',
                      fontSize: '13px'
                    }}>
                      {selectedNode.riskScore}% ({selectedNode.riskScore >= 80 ? 'Critical' : 'High'})
                    </div>
                  </div>
                )}

                {selectedNode.type === 'Accused' && (
                  <div style={{ marginTop: '16px', padding: '8px', background: 'rgba(255,255,255,0.02)', borderLeft: '3px solid var(--color-secondary-light)', borderRadius: '0 6px 6px 0', fontSize: '11.5px' }}>
                    <strong>Modus Operandi:</strong>
                    <p style={{ fontStyle: 'italic', margin: '4px 0 0 0', color: 'var(--color-text-secondary)' }}>
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
              <div style={{ color: 'var(--color-text-secondary)', fontSize: '12px', fontStyle: 'italic', textAlign: 'center', padding: '20px 0' }}>
                Select any node in graph layout to inspect active SCRB registry folders.
              </div>
            )}
          </div>

          <div style={{ fontSize: '9px', color: 'var(--color-text-secondary)', borderTop: '1px solid var(--color-border)', paddingTop: '8px', marginTop: '20px' }}>
            Scroll to zoom. Drag nodes to pin layout coordinates.
          </div>
        </div>
      </div>
    </div>
  );
}

export default NetworkGraph;
