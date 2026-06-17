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

        const dataDir = path.join(__dirname, '../../../data/output');
        const firs = parseCSV(path.join(dataDir, 'fir.csv'));
        const accused = parseCSV(path.join(dataDir, 'accused.csv'));
        const victims = parseCSV(path.join(dataDir, 'victim.csv'));
        const transactions = parseCSV(path.join(dataDir, 'transaction.csv'));

        if (firs.length === 0) {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: "Data files not generated yet." }));
            context.close();
            return;
        }

        // 1. KPI Counts
        const totalFirs = firs.length;
        const openFirs = firs.filter(f => f.investigation_status === 'Open').length;
        const closedFirs = firs.filter(f => f.investigation_status === 'Closed').length;
        const chargesheetedFirs = firs.filter(f => f.investigation_status === 'Chargesheeted').length;
        const totalAccused = accused.length;
        const totalVictims = victims.length;

        // 2. Monthly Trend (last 12 months)
        const monthlyTrendMap = {};
        firs.forEach(f => {
            const dateStr = f.date_of_incident;
            if (dateStr && dateStr.length >= 7) {
                const yearMonth = dateStr.substring(0, 7); // e.g. "2024-05"
                monthlyTrendMap[yearMonth] = (monthlyTrendMap[yearMonth] || 0) + 1;
            }
        });
        
        // Sort and select last 12
        const trendData = Object.keys(monthlyTrendMap)
            .sort()
            .slice(-12)
            .map(ym => ({
                month: ym,
                incidents: monthlyTrendMap[ym]
            }));

        // 3. District breakdown
        const districtMap = {};
        firs.forEach(f => {
            const d = f.district || "Unknown";
            districtMap[d] = (districtMap[d] || 0) + 1;
        });
        const districtData = Object.keys(districtMap)
            .map(d => ({ name: d, count: districtMap[d] }))
            .sort((a, b) => b.count - a.count);

        // 4. Crime Category Breakdown
        const crimeTypeMap = {};
        firs.forEach(f => {
            const ct = f.crime_type || "Other";
            crimeTypeMap[ct] = (crimeTypeMap[ct] || 0) + 1;
        });
        const crimeTypeData = Object.keys(crimeTypeMap)
            .map(ct => ({ name: ct, count: crimeTypeMap[ct] }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 8);

        // 5. Offender Risk Distribution
        let riskBands = { Low: 0, Medium: 0, High: 0, Critical: 0 };
        accused.forEach(a => {
            const score = parseFloat(a.risk_score) || 0;
            if (score <= 30) riskBands.Low++;
            else if (score <= 60) riskBands.Medium++;
            else if (score <= 80) riskBands.High++;
            else riskBands.Critical++;
        });
        
        const riskDistribution = [
            { name: 'Low (0-30)', value: riskBands.Low, color: '#276749' },
            { name: 'Medium (31-60)', value: riskBands.Medium, color: '#C8922A' },
            { name: 'High (61-80)', value: riskBands.High, color: '#DD6B20' },
            { name: 'Critical (81-100)', value: riskBands.Critical, color: '#9B1C1C' }
        ];

        // 6. Socio-demographics Aggregations
        const offenderDemographics = {
            ageGroups: [
                { name: '18-30 (Youth)', count: 0 },
                { name: '31-50 (Adult)', count: 0 },
                { name: '51+ (Senior)', count: 0 }
            ],
            gender: [
                { name: 'Male', count: 0 },
                { name: 'Female', count: 0 },
                { name: 'Other', count: 0 }
            ],
            socioEconomic: [
                { name: 'Lower Class', count: 0 },
                { name: 'Middle Class', count: 0 },
                { name: 'Upper Middle Class', count: 0 }
            ],
            education: [
                { name: 'Illiterate', count: 0 },
                { name: 'Primary School', count: 0 },
                { name: 'High School', count: 0 },
                { name: 'Graduate', count: 0 },
                { name: 'Post Graduate', count: 0 }
            ],
            occupation: [
                { name: 'Laborer', count: 0 },
                { name: 'Driver', count: 0 },
                { name: 'Business Owner', count: 0 },
                { name: 'Unemployed', count: 0 },
                { name: 'Private Employee', count: 0 },
                { name: 'Government Employee', count: 0 }
            ]
        };

        accused.forEach(a => {
            const age = parseInt(a.age) || 0;
            if (age >= 18 && age <= 30) offenderDemographics.ageGroups[0].count++;
            else if (age >= 31 && age <= 50) offenderDemographics.ageGroups[1].count++;
            else if (age > 50) offenderDemographics.ageGroups[2].count++;

            const genIdx = offenderDemographics.gender.findIndex(g => g.name === a.gender);
            if (genIdx !== -1) offenderDemographics.gender[genIdx].count++;

            const seIdx = offenderDemographics.socioEconomic.findIndex(s => s.name === a.socio_economic_status);
            if (seIdx !== -1) offenderDemographics.socioEconomic[seIdx].count++;

            const edIdx = offenderDemographics.education.findIndex(e => e.name === a.education_level);
            if (edIdx !== -1) offenderDemographics.education[edIdx].count++;

            const ocIdx = offenderDemographics.occupation.findIndex(o => o.name === a.occupation);
            if (ocIdx !== -1) offenderDemographics.occupation[ocIdx].count++;
        });

        const victimDemographics = {
            ageGroups: [
                { name: '0-17 (Child)', count: 0 },
                { name: '18-30 (Youth)', count: 0 },
                { name: '31-50 (Adult)', count: 0 },
                { name: '51+ (Senior)', count: 0 }
            ],
            gender: [
                { name: 'Male', count: 0 },
                { name: 'Female', count: 0 },
                { name: 'Other', count: 0 }
            ],
            socioEconomic: [
                { name: 'Lower Class', count: 0 },
                { name: 'Middle Class', count: 0 },
                { name: 'Upper Middle Class', count: 0 }
            ]
        };

        victims.forEach(v => {
            const age = parseInt(v.age) || 0;
            if (age < 18) victimDemographics.ageGroups[0].count++;
            else if (age >= 18 && age <= 30) victimDemographics.ageGroups[1].count++;
            else if (age >= 31 && age <= 50) victimDemographics.ageGroups[2].count++;
            else if (age > 50) victimDemographics.ageGroups[3].count++;

            const genIdx = victimDemographics.gender.findIndex(g => g.name === v.gender);
            if (genIdx !== -1) victimDemographics.gender[genIdx].count++;

            const seIdx = victimDemographics.socioEconomic.findIndex(s => s.name === v.socio_economic_status);
            if (seIdx !== -1) victimDemographics.socioEconomic[seIdx].count++;
        });

        // 7. Forecast Crime volume for next 3 months
        const forecastData = trendData.map(t => ({ ...t, isForecast: false }));
        if (trendData.length > 0) {
            const lastVal = trendData[trendData.length - 1].incidents;
            const m1 = Math.round(lastVal * 1.02);
            const m2 = Math.round(m1 * 1.015);
            const m3 = Math.round(m2 * 1.03);

            forecastData.push({ month: '2026-07 (Proj)', incidents: m1, isForecast: true });
            forecastData.push({ month: '2026-08 (Proj)', incidents: m2, isForecast: true });
            forecastData.push({ month: '2026-09 (Proj)', incidents: m3, isForecast: true });
        }

        // 8. Crime Hotspots
        const hotspots = firs
            .filter(f => f.district === 'Bengaluru Urban' && f.latitude && f.longitude)
            .slice(0, 100)
            .map(f => ({
                id: f.fir_id,
                crime_type: f.crime_type,
                ipc: f.ipc_section,
                latitude: parseFloat(f.latitude),
                longitude: parseFloat(f.longitude),
                date: f.date_of_incident
            }));

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            kpis: {
                totalFirs,
                openFirs,
                closedFirs,
                chargesheetedFirs,
                totalAccused,
                totalVictims,
                totalTransactions: transactions.length
            },
            trendData,
            forecastData,
            districtData,
            crimeTypeData,
            riskDistribution,
            offenderDemographics,
            victimDemographics,
            hotspots
        }));

    } catch (error) {
        console.error("Analytics function error:", error);
        const res = basicIO.getReferrerRes();
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: error.message }));
    } finally {
        context.close();
    }
};
