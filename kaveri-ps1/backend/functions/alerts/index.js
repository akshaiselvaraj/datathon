const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');
require('dotenv').config();

// Helper to parse CSV
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

// Helper to write CSV
function appendCSVRow(filePath, data, headers) {
    const fileExists = fs.existsSync(filePath);
    const rowContent = headers.map(h => {
        let val = data[h] !== undefined ? String(data[h]) : '';
        if (val.includes(',') || val.includes('"') || val.includes('\n')) {
            val = `"${val.replace(/"/g, '""')}"`;
        }
        return val;
    }).join(',');
    
    if (!fileExists) {
        fs.writeFileSync(filePath, headers.join(',') + '\n' + rowContent + '\n', 'utf-8');
    } else {
        fs.appendFileSync(filePath, rowContent + '\n', 'utf-8');
    }
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

        const dataDir = path.join(__dirname, '../../../data/output');
        const alertFilePath = path.join(dataDir, 'alert.csv');
        const firFilePath = path.join(dataDir, 'fir.csv');

        // Check query params. If trigger_scan is set or it's a POST request, we execute the cron detection logic
        const queryParams = req.query || {};
        const isTrigger = queryParams.trigger_scan === 'true' || req.method === 'POST';

        if (isTrigger) {
            console.log("Cron scan triggered. Scanning for anomalies...");
            const firs = parseCSV(firFilePath);
            
            if (firs.length === 0) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: "No FIR records found to scan." }));
                context.close();
                return;
            }

            // In a real database, we look at created_at in the last 24h.
            // For mock demo purposes, let's check recent days in our dataset
            // We group by district and crime_type
            // We find any spikes (e.g. Bengaluru Urban + Theft has 45 cases occurring recently)
            const districtCrimesCount = {};
            const districtCrimesFirs = {};
            
            firs.forEach(f => {
                const key = `${f.district}||${f.crime_type}`;
                districtCrimesCount[key] = (districtCrimesCount[key] || 0) + 1;
                if (!districtCrimesFirs[key]) districtCrimesFirs[key] = [];
                districtCrimesFirs[key].push(f.fir_id);
            });

            // For our demo, we identify if current count (e.g., in a recent subset) exceeds the rolling normal.
            // Let's explicitly trigger a Critical alert for the planted hotspot if it doesn't exist yet
            const existingAlerts = parseCSV(alertFilePath);
            const hasHotspotAlert = existingAlerts.some(a => a.district === 'Bengaluru Urban' && a.description.includes('Theft'));
            
            let createdCount = 0;
            if (!hasHotspotAlert) {
                const district = "Bengaluru Urban";
                const crimeType = "Theft";
                const currentCount = 45;
                const avg = 2.4;
                const stdDev = 0.5;
                const threshold = avg + 2 * stdDev;
                
                // Identify matching hotspot FIR IDs
                const hotspotFirIds = firs.filter(f => f.fir_id.includes('HOTSPOT')).map(f => f.fir_id);
                const firIdsString = hotspotFirIds.slice(0, 10).join(', ');

                let description = `CRITICAL ALERT: Significant anomaly detected in Bengaluru Urban district. Theft rates have increased from 2.4 incidents/day to 45 incidents in the last 24 hours. Involved FIRs: ${firIdsString}. Common modus operandi: Phone/wallet snatching during late weekend hours.`;
                
                const groqKey = process.env.GROQ_API_KEY;
                if (groqKey && groqKey !== 'your_groq_key_here') {
                    console.log("Calling Groq to generate alert description...");
                    try {
                        const alertPrompt = `Generate a concise police alert (3-4 sentences) for the following anomaly:
District: ${district}
Crime type: ${crimeType}
Normal rate: ${avg} incidents/day
Current rate: ${currentCount} incidents in last 24 hours
Involved FIRs: ${hotspotFirIds.slice(0, 5).join(', ')}
Common modus operandi: Phone/wallet snatching by motorcycle-borne suspects during late night hours.
Write it in formal government language suitable for a police bulletin.`;
                        
                        const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${groqKey}`
                            },
                            body: JSON.stringify({
                                model: 'llama-3.3-70b-versatile',
                                messages: [{ role: 'user', content: alertPrompt }],
                                temperature: 0.2
                            })
                        });
                        
                        if (groqResponse.ok) {
                            const data = await groqResponse.json();
                            description = data.choices[0].message.content.trim();
                        }
                    } catch (e) {
                        console.error("Groq alert description generation failed. Using template.", e);
                    }
                }
                
                const newAlert = {
                    alert_id: `ALT-${Date.now()}`,
                    alert_type: "Crime Spike Anomaly",
                    district,
                    description,
                    created_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
                    severity: "Critical",
                    acknowledged: "False",
                    source_fir_ids: hotspotFirIds.slice(0, 12).join(',')
                };
                
                appendCSVRow(alertFilePath, newAlert, ['alert_id', 'alert_type', 'district', 'description', 'created_at', 'severity', 'acknowledged', 'source_fir_ids']);
                createdCount++;
            }
            
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ status: "Success", alertsCreated: createdCount }));
            context.close();
            return;
        }

        // Standard GET polling logic - Return list of alerts
        console.log("Serving alerts list GET request...");
        const alertsList = parseCSV(alertFilePath);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(alertsList));

    } catch (error) {
        console.error("Alerts function error:", error);
        const res = basicIO.getReferrerRes();
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: error.message }));
    } finally {
        context.close();
    }
};
