# Testing Instructions — KAVERI Platform

This document outlines how to test and verify the different components of the KAVERI Crime Analytics and Intelligence Platform.

---

## 1. Backend API Endpoint Tests

The backend is configured as an Express server emulating Zoho Catalyst functions. 

### Start the Backend Server
```bash
cd backend
npm install
npm start
```
*Verify output*: The server should start on port `3000` with five endpoints mapped successfully.

### Testing Endpoints with curl (Use curl.exe in PowerShell)

#### A. Analytics Aggregations Endpoint (`GET /analytics`)
```bash
curl.exe -X GET http://localhost:3000/analytics
```
*Expected Response*: JSON payload containing `kpis` totals, `trendData` (actual monthly counts), `forecastData` (rolling 12 months + 3 projected months), `districtData` arrays, `crimeTypeData`, and `offenderDemographics` / `victimDemographics` arrays.

#### B. Crime Spike Alerts Scan Endpoint (`POST /alerts`)
```bash
curl.exe -X POST http://localhost:3000/alerts?trigger_scan=true
```
*Expected Response*: `{"status":"Success","alertsCreated":1}` (or `0` if the alert is already logged in `data/output/alert.csv`).

#### C. Graph Network Analysis Endpoint (`POST /graph`)
```bash
curl.exe -X POST http://localhost:3000/graph \
  -H "Content-Type: application/json" \
  -d '{"query_type": "gang_networks"}'
```
*Expected Response*: JSON graph payload containing a list of co-offender `nodes` (accused names/IDs, bank accounts, FIR IDs) and linking `edges` representing associations.

#### D. Conversational Assistant RAG Endpoint (`POST /chat`)
```bash
curl.exe -X POST http://localhost:3000/chat \
  -H "Content-Type: application/json" \
  -d '{"query": "Who are the highest risk offenders in Bengaluru?", "userRole": "Investigator"}'
```
*Expected Response*: Markdown formatted text output detailing suspect *Ravi Shankar Gowda* (Risk Score: 94%) and a list of source references: `Sources used: [FIR-HIGHRISK-006, ...]`

---

## 2. Frontend Visuals & User Flow Tests

### Compile and Start Frontend
```bash
cd frontend
npm install
npm run build     # Verify that build compiles without React or Vite errors
npm run dev       # Starts Vite dev server on http://localhost:5173/
```

### Manual Walkthrough Verification

1. **Access Control Verification**:
   - Open http://localhost:5173/login.
   - Test logging in as **Policymaker**. Go to the `Case Reports` and chat tabs. Verify that all individual accused names and narrative details are redacted/generalized.
   - Log out, and log back in as **Investigator**. Verify that you now see full suspect names, MO details, and detailed case narratives.
2. **Forecasting & Demographics Verification**:
   - Navigate to the `Crime Analytics` tab.
   - Check that the **Proactive Crime Forecasting** graph has gold-colored bars for projected months (July, August, September).
   - Test clicking the tab selectors (`Socio-Economic`, `Occupation`, `Education`) on the Offender and Victim demographics panels to check that graphs update dynamically.
3. **Investigator Timeline & Recommendations Verification**:
   - Go to `Case Reports`. Click **View Dossier** in the row for `FIR-HIGHRISK-008`.
   - Verify that:
     - The **Automated Case Timeline** shows 5 numbered milestones.
     - The **Similar Past Cases** list loads other Attempt to Murder cases in Rajajinagar.
     - The **Recommended Investigative Leads** checkmarks are colored green.
4. **PDF compilation Verification**:
   - Navigate to the `Crime Intelligence Chat` tab.
   - Click the **Save as PDF Report** button. Verify that a PDF downloads locally containing the full chat transcript, investigator details, and a high-resolution snapshot of the graph visualizer canvas.

---

## 3. ML Risk Engine & Feature Pipeline Verification

Run the feature engineering pipeline and the Random Forest risk rating engine locally:
```bash
cd ml
pip install pandas numpy scikit-learn
python train_risk_model.py
```
*Expected Response*: Features will be engineered from the local CSV archives (computing recency of last crime, severity, and co-accused count). Scikit-learn will train the RF classifier and save updated risk ratings back to `data/output/accused.csv`.

---

## 4. Synthetic Data Generation Verification

You can regenerate the base synthetic databases (5,000+ files) at any time:
```bash
cd data
pip install Faker pandas
python generate_synthetic.py
```
*Expected Response*: Wrote base CSV files (`fir.csv`, `accused.csv`, `victim.csv`, `fir_accused.csv`, `fir_victim.csv`, `transaction.csv`, and `alert.csv`) under the `data/output` directory.
