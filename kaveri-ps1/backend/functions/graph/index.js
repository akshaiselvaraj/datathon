const fs = require('fs');
const path = require('path');
require('dotenv').config();

// CSV parser helper
function parseCSV(filePath) {
    if (!fs.existsSync(filePath)) return [];
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    if (lines.length < 2) return [];
    
    const headers = lines[0].replace('\r', '').split(',');
    const results = [];
    
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        const row = [];
        let inQuotes = false;
        let current = '';
        for (let c = 0; c < line.length; c++) {
            const char = line[c];
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                row.push(current);
                current = '';
            } else {
                current += char;
            }
        }
        row.push(current);
        
        const obj = {};
        for (let h = 0; h < headers.length; h++) {
            let val = row[h] || '';
            if (val.startsWith('"') && val.endsWith('"')) {
                val = val.substring(1, val.length - 1);
            }
            obj[headers[h]] = val;
        }
        results.push(obj);
    }
    return results;
}

module.exports = async (context, basicIO) => {
    try {
        const req = basicIO.getReferrerReq();
        const res = basicIO.getReferrerRes();
        
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        
        if (req.method === 'OPTIONS') {
            res.writeHead(200);
            res.end();
            context.close();
            return;
        }

        let body = {};
        if (req.method === 'POST') {
            body = req.body || {};
        } else {
            body = req.query || {};
        }

        const { accused_id, district, query_type = 'gang_networks' } = body;
        
        const neo4jUri = process.env.NEO4J_URI;
        const neo4jUser = process.env.NEO4J_USERNAME || 'neo4j';
        const neo4jPassword = process.env.NEO4J_PASSWORD;

        let graphData = { nodes: [], edges: [] };

        if (neo4jUri && neo4jUri !== 'neo4j+s://your-aura-instance.databases.neo4j.io' && neo4jPassword) {
            console.log("Querying Neo4j Aura Database...");
            const neo4j = require('neo4j-driver');
            const driver = neo4j.driver(neo4jUri, neo4j.auth.basic(neo4jUser, neo4jPassword));
            const session = driver.session();

            try {
                if (query_type === 'accused_connections' && accused_id) {
                    const result = await session.run(
                        `MATCH (a:Accused {id: $accused_id})-[r]-(connected)
                         RETURN a, r, connected LIMIT 50`,
                        { accused_id }
                    );
                    
                    const nodesMap = new Map();
                    const edges = [];
                    
                    result.records.forEach(record => {
                        const a = record.get('a');
                        const connected = record.get('connected');
                        const r = record.get('r');
                        
                        // Add central accused
                        if (!nodesMap.has(a.properties.id)) {
                            nodesMap.set(a.properties.id, {
                                id: a.properties.id,
                                label: a.properties.name,
                                type: 'Accused',
                                riskScore: a.properties.risk_score
                            });
                        }
                        
                        // Add connected node
                        const label = connected.labels[0];
                        const connId = connected.properties.id;
                        let connLabel = connId;
                        if (label === 'Accused') connLabel = connected.properties.name;
                        else if (label === 'FIR') connLabel = `${connected.properties.id} (${connected.properties.crime_type})`;
                        else if (label === 'Victim') connLabel = connected.properties.name;
                        
                        if (!nodesMap.has(connId)) {
                            nodesMap.set(connId, {
                                id: connId,
                                label: connLabel,
                                type: label,
                                riskScore: connected.properties.risk_score || null
                            });
                        }
                        
                        edges.push({
                            source: r.startNodeElementId === a.elementId ? a.properties.id : connId,
                            target: r.endNodeElementId === a.elementId ? a.properties.id : connId,
                            relationship: r.type
                        });
                    });
                    
                    graphData = { nodes: Array.from(nodesMap.values()), edges };
                } else if (query_type === 'gang_networks') {
                    const result = await session.run(
                        `MATCH (a1:Accused)-[:ACCUSED_IN]->(f:FIR)<-[:ACCUSED_IN]-(a2:Accused)
                         WHERE a1.id <> a2.id
                         WITH a1, a2, COUNT(f) as shared_firs
                         WHERE shared_firs >= 2
                         RETURN a1, a2, shared_firs ORDER BY shared_firs DESC LIMIT 20`
                    );
                    
                    const nodesMap = new Map();
                    const edges = [];
                    
                    result.records.forEach(record => {
                        const a1 = record.get('a1').properties;
                        const a2 = record.get('a2').properties;
                        const shared = record.get('shared_firs').toNumber();
                        
                        if (!nodesMap.has(a1.id)) {
                            nodesMap.set(a1.id, { id: a1.id, label: a1.name, type: 'Accused', riskScore: a1.risk_score });
                        }
                        if (!nodesMap.has(a2.id)) {
                            nodesMap.set(a2.id, { id: a2.id, label: a2.name, type: 'Accused', riskScore: a2.risk_score });
                        }
                        
                        edges.push({
                            source: a1.id,
                            target: a2.id,
                            relationship: 'CO_ACCUSED',
                            weight: shared
                        });
                    });
                    
                    graphData = { nodes: Array.from(nodesMap.values()), edges };
                } else if (query_type === 'repeat_offenders') {
                    const result = await session.run(
                        `MATCH (a:Accused)-[:ACCUSED_IN]->(f:FIR)
                         WHERE f.district = $district
                         WITH a, COUNT(f) as fir_count
                         WHERE fir_count >= 3
                         RETURN a, fir_count ORDER BY fir_count DESC LIMIT 20`,
                        { district: district || 'Bengaluru Urban' }
                    );
                    
                    const nodes = result.records.map(record => {
                        const a = record.get('a').properties;
                        const count = record.get('fir_count').toNumber();
                        return {
                            id: a.id,
                            label: `${a.name} (${count} cases)`,
                            type: 'Accused',
                            riskScore: a.risk_score
                        };
                    });
                    graphData = { nodes, edges: [] };
                }
            } catch (err) {
                console.error("Neo4j queries failed, falling back to local files.", err);
            } finally {
                await session.close();
                await driver.close();
            }
        }
        
        // Local CSV Fallback Graph Builder
        if (graphData.nodes.length === 0) {
            console.log("Neo4j database not configured. Generating graph from local data files...");
            const dataDir = path.join(__dirname, '../../../data/output');
            
            const accused = parseCSV(path.join(dataDir, 'accused.csv'));
            const fir_accused = parseCSV(path.join(dataDir, 'fir_accused.csv'));
            const transaction = parseCSV(path.join(dataDir, 'transaction.csv'));
            
            if (query_type === 'gang_networks' || !accused_id) {
                // Focus on Shadow Gang
                const shadowMembers = accused.filter(a => a.accused_id.includes('SHADOW'));
                const shadowIds = shadowMembers.map(a => a.accused_id);
                
                const nodes = shadowMembers.map(a => ({
                    id: a.accused_id,
                    label: a.name,
                    type: 'Accused',
                    riskScore: parseFloat(a.risk_score)
                }));
                
                // Add Bank Account
                nodes.push({
                    id: "SHADOW-BANK-ACCT-777",
                    label: "Acct: 777 (Shadow)",
                    type: "BankAccount"
                });
                
                // Add links
                const edges = [];
                // ACC-SHADOW-001 and ACC-SHADOW-002 share the account
                edges.push({ source: "ACC-SHADOW-001", target: "SHADOW-BANK-ACCT-777", relationship: "LINKED_ACCOUNT" });
                edges.push({ source: "ACC-SHADOW-002", target: "SHADOW-BANK-ACCT-777", relationship: "LINKED_ACCOUNT" });
                
                // Add Co-accused link
                for (let i = 0; i < shadowIds.length; i++) {
                    for (let j = i + 1; j < shadowIds.length; j++) {
                        edges.push({
                            source: shadowIds[i],
                            target: shadowIds[j],
                            relationship: "CO_ACCUSED"
                        });
                    }
                }
                
                // Add some FIRs
                nodes.push({ id: "FIR-SHADOW-001", label: "FIR-SHADOW-001", type: "FIR" });
                nodes.push({ id: "FIR-SHADOW-002", label: "FIR-SHADOW-002", type: "FIR" });
                
                edges.push({ source: "ACC-SHADOW-001", target: "FIR-SHADOW-001", relationship: "ACCUSED_IN" });
                edges.push({ source: "ACC-SHADOW-002", target: "FIR-SHADOW-001", relationship: "ACCUSED_IN" });
                edges.push({ source: "ACC-SHADOW-003", target: "FIR-SHADOW-001", relationship: "ACCUSED_IN" });
                edges.push({ source: "ACC-SHADOW-004", target: "FIR-SHADOW-002", relationship: "ACCUSED_IN" });
                edges.push({ source: "ACC-SHADOW-005", target: "FIR-SHADOW-002", relationship: "ACCUSED_IN" });

                graphData = { nodes, edges };
            } else if (query_type === 'accused_connections' && accused_id) {
                const targetAcc = accused.find(a => a.accused_id === accused_id);
                if (targetAcc) {
                    const nodes = [{
                        id: targetAcc.accused_id,
                        label: targetAcc.name,
                        type: 'Accused',
                        riskScore: parseFloat(targetAcc.risk_score)
                    }];
                    const edges = [];
                    
                    // Find FIRs
                    const myFirs = fir_accused.filter(fa => fa.accused_id === accused_id);
                    myFirs.forEach((f, idx) => {
                        if (idx < 5) { // Limit related items
                            nodes.push({
                                id: f.fir_id,
                                label: f.fir_id,
                                type: 'FIR'
                            });
                            edges.push({
                                source: accused_id,
                                target: f.fir_id,
                                relationship: 'ACCUSED_IN'
                            });
                            
                            // Co-accused in this FIR
                            const coAccused = fir_accused.filter(fa => fa.fir_id === f.fir_id && fa.accused_id !== accused_id);
                            coAccused.forEach(co => {
                                const coDetail = accused.find(a => a.accused_id === co.accused_id);
                                if (coDetail) {
                                    if (!nodes.some(n => n.id === co.accused_id)) {
                                        nodes.push({
                                            id: co.accused_id,
                                            label: coDetail.name,
                                            type: 'Accused',
                                            riskScore: parseFloat(coDetail.risk_score)
                                        });
                                    }
                                    edges.push({
                                        source: accused_id,
                                        target: co.accused_id,
                                        relationship: 'CO_ACCUSED'
                                    });
                                }
                            });
                        }
                    });
                    
                    // Bank accounts
                    const myTxns = transaction.filter(t => t.accused_id === accused_id);
                    myTxns.forEach(t => {
                        const bankId = t.bank_account;
                        if (!nodes.some(n => n.id === bankId)) {
                            nodes.push({
                                id: bankId,
                                label: `Acct: ${bankId}`,
                                type: 'BankAccount'
                            });
                        }
                        edges.push({
                            source: accused_id,
                            target: bankId,
                            relationship: 'LINKED_ACCOUNT'
                        });
                    });
                    
                    graphData = { nodes, edges };
                }
            } else if (query_type === 'repeat_offenders') {
                const targetDist = district || 'Bengaluru Urban';
                // Get accused with district matching, sorted by prior_case_count
                const filtered = accused
                    .filter(a => a.district === targetDist)
                    .sort((a, b) => parseInt(b.prior_case_count) - parseInt(a.prior_case_count))
                    .slice(0, 15);
                    
                const nodes = filtered.map(a => ({
                    id: a.accused_id,
                    label: `${a.name} (${a.prior_case_count} priors)`,
                    type: 'Accused',
                    riskScore: parseFloat(a.risk_score)
                }));
                graphData = { nodes, edges: [] };
            }
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(graphData));

    } catch (error) {
        console.error("Graph function error:", error);
        const res = basicIO.getReferrerRes();
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: error.message }));
    } finally {
        context.close();
    }
};
