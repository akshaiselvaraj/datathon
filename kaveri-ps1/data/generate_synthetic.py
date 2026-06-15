import os
import csv
import random
import uuid
from datetime import datetime, timedelta
from faker import Faker

fake = Faker('en_IN')

# Configure paths
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), 'output')
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Districts
DISTRICTS = [
    "Bengaluru Urban", "Bengaluru Rural", "Mysuru", "Hubballi-Dharwad",
    "Mangaluru", "Belagavi", "Kalaburagi", "Ballari", "Tumakuru",
    "Shivamogga", "Davangere", "Vijayapura", "Hassan", "Chikkamagaluru"
]

# IPC sections and corresponding severity and types
IPC_MAP = {
    "302": ("Murder", 10),
    "307": ("Attempt to Murder", 9),
    "376": ("Rape", 9),
    "420": ("Cheating/Fraud", 6),
    "379": ("Theft", 4),
    "380": ("Theft in Dwelling House", 4),
    "392": ("Robbery", 7),
    "394": ("Voluntarily Causing Hurt in Committing Robbery", 8),
    "498A": ("Cruelty by Husband or Relatives", 5),
    "506": ("Criminal Intimidation", 4),
    "324": ("Voluntarily Causing Hurt by Dangerous Weapons", 5),
    "326": ("Voluntarily Causing Grievous Hurt by Dangerous Weapons", 7),
    "363": ("Kidnapping", 6),
    "364": ("Kidnapping in Order to Murder", 9),
    "384": ("Extortion", 6),
    "395": ("Dacoity", 8),
    "397": ("Robbery/Dacoity with Attempt to Cause Death", 9),
    "406": ("Criminal Breach of Trust", 5)
}

IPC_SECTIONS = list(IPC_MAP.keys())

# Modus Operandi choices for standard crimes
MO_TEMPLATES = [
    "Entered through unlocked door",
    "Snatched chain from victim walking on road",
    "Offered high returns on fake investment scheme",
    "Assaulted victim following heated argument over traffic",
    "Threatened victim with knife in isolated area",
    "Broke open padlock of shop at night",
    "Created fake profile on social media to defraud"
]

def generate_firs(num_firs):
    firs = []
    # Bengaluru Center Coordinates
    lat_center, lon_center = 12.9716, 77.5946
    
    for i in range(1, num_firs + 1):
        fir_id = f"FIR-{2024 + random.randint(-1, 2)}-KA-{i:04d}"
        district = random.choice(DISTRICTS)
        police_station = f"{district.split(' ')[0]} Police Station"
        ipc = random.choice(IPC_SECTIONS)
        crime_type, severity = IPC_MAP[ipc]
        
        # Date of incident within last 3 years
        days_ago = random.randint(1, 1000)
        date_of_incident = (datetime.now() - timedelta(days=days_ago)).strftime('%Y-%m-%d')
        
        loc_desc = fake.address().replace('\n', ', ')
        
        # Standard latitude/longitude
        if district == "Bengaluru Urban":
            latitude = round(lat_center + random.uniform(-0.15, 0.15), 6)
            longitude = round(lon_center + random.uniform(-0.15, 0.15), 6)
        else:
            latitude = round(random.uniform(11.5, 18.5), 6)
            longitude = round(random.uniform(74.0, 78.5), 6)
            
        mo = random.choice(MO_TEMPLATES)
        status = random.choice(["Open", "Closed", "Chargesheeted"])
        
        # Narrative
        fir_text = f"An incident of {crime_type} under IPC Section {ipc} was reported at {police_station}, {district}. The incident took place at {loc_desc}. Modus operandi of the suspect: {mo}. Investigation status is currently {status}."
        
        firs.append({
            'fir_id': fir_id,
            'district': district,
            'police_station': police_station,
            'ipc_section': ipc,
            'crime_type': crime_type,
            'date_of_incident': date_of_incident,
            'location_description': loc_desc,
            'latitude': latitude,
            'longitude': longitude,
            'modus_operandi': mo,
            'investigation_status': status,
            'fir_text': fir_text
        })
    return firs

def generate_accused(num_accused):
    accused_list = []
    genders = ["Male", "Female", "Other"]
    socio_eco = ["Lower Class", "Middle Class", "Upper Middle Class"]
    education = ["Illiterate", "Primary School", "High School", "Graduate", "Post Graduate"]
    occupations = ["Laborer", "Driver", "Business Owner", "Unemployed", "Private Employee", "Government Employee"]
    
    for i in range(1, num_accused + 1):
        accused_id = f"ACC-2024-KA-{i:04d}"
        name = fake.name()
        age = random.randint(18, 70)
        gender = random.choices(genders, weights=[85, 14, 1], k=1)[0]
        address = fake.address().replace('\n', ', ')
        district = random.choice(DISTRICTS)
        priors = random.choices([0, 1, 2, 3, 4, 5], weights=[60, 20, 10, 5, 3, 2], k=1)[0]
        risk = 10.0 + priors * 15.0 + random.uniform(-5, 5)
        risk = min(max(risk, 0.0), 100.0)
        
        mo = random.choice(MO_TEMPLATES)
        
        accused_list.append({
            'accused_id': accused_id,
            'name': name,
            'age': age,
            'gender': gender,
            'address': address,
            'district': district,
            'prior_case_count': priors,
            'risk_score': round(risk, 1),
            'modus_operandi': mo,
            'socio_economic_status': random.choice(socio_eco),
            'education_level': random.choice(education),
            'occupation': random.choice(occupations),
            'bail_status': random.choice([True, False])
        })
    return accused_list

def generate_victims(num_victims):
    victims = []
    genders = ["Male", "Female", "Other"]
    socio_eco = ["Lower Class", "Middle Class", "Upper Middle Class"]
    
    for i in range(1, num_victims + 1):
        victim_id = f"VIC-2024-KA-{i:04d}"
        name = fake.name()
        age = random.randint(5, 85)
        gender = random.choice(genders)
        address = fake.address().replace('\n', ', ')
        district = random.choice(DISTRICTS)
        
        victims.append({
            'victim_id': victim_id,
            'name': name,
            'age': age,
            'gender': gender,
            'address': address,
            'district': district,
            'socio_economic_status': random.choice(socio_eco)
        })
    return victims

def plant_patterns(firs, accused, victims, fir_accused, fir_victim, transactions):
    print("Planting Evaluative Patterns...")
    
    # ----------------------------------------------------
    # Pattern A: Gang Network "Shadow"
    # ----------------------------------------------------
    # 5 accused linked across 8 FIRs in Bengaluru Urban & Mysuru
    # Shared MO: "Breaks rear window latch between 2am-4am"
    # 2 share a bank account in TRANSACTION table
    shadow_accused = []
    for idx in range(1, 6):
        a_id = f"ACC-SHADOW-{idx:03d}"
        name = f"Shadow Member {idx}"
        shadow_accused.append({
            'accused_id': a_id,
            'name': name,
            'age': 22 + idx * 2,
            'gender': "Male",
            'address': f"Koramangala, Bengaluru, Karnataka",
            'district': "Bengaluru Urban" if idx <= 3 else "Mysuru",
            'prior_case_count': 3,
            'risk_score': 72.5,
            'modus_operandi': "Breaks rear window latch between 2am-4am",
            'socio_economic_status': "Lower Class",
            'education_level': "High School",
            'occupation': "Unemployed",
            'bail_status': True
        })
    accused.extend(shadow_accused)
    
    # 8 FIRs
    shadow_firs = []
    for idx in range(1, 9):
        f_id = f"FIR-SHADOW-{idx:03d}"
        dist = "Bengaluru Urban" if idx <= 5 else "Mysuru"
        crime_type, severity = IPC_MAP["380"]
        mo = "Breaks rear window latch between 2am-4am"
        date_inc = (datetime.now() - timedelta(days=idx * 15)).strftime('%Y-%m-%d')
        
        narrative = f"A burglary incident occurred in {dist} where suspects broke in during late hours. The investigative officers recovered evidence that the perpetrator breaks rear window latch between 2am-4am to gain access. Case is linked to the Shadow Gang. status: Open."
        
        shadow_firs.append({
            'fir_id': f_id,
            'district': dist,
            'police_station': "Koramangala Police Station" if dist == "Bengaluru Urban" else "Lashkar Police Station",
            'ipc_section': "380",
            'crime_type': crime_type,
            'date_of_incident': date_inc,
            'location_description': "Residential Area",
            'latitude': 12.9352 if dist == "Bengaluru Urban" else 12.3051,
            'longitude': 77.6244 if dist == "Bengaluru Urban" else 76.6552,
            'modus_operandi': mo,
            'investigation_status': "Open",
            'fir_text': narrative
        })
    firs.extend(shadow_firs)
    
    # Link shadow accused to shadow FIRs
    # Each Shadow FIR has 2-3 of the shadow gang members involved
    for f in shadow_firs:
        assigned = random.sample(shadow_accused, k=random.randint(2, 4))
        for a in assigned:
            fir_accused.append({
                'fir_id': f['fir_id'],
                'accused_id': a['accused_id'],
                'role': 'primary' if random.random() > 0.4 else 'associate'
            })
            
    # Share a bank account in TRANSACTION table
    # Accused 1 and 2 share "SHADOW-BANK-ACCT-777"
    transactions.append({
        'txn_id': "TXN-SHADOW-001",
        'accused_id': "ACC-SHADOW-001",
        'amount': 45000.0,
        'txn_date': (datetime.now() - timedelta(days=20)).strftime('%Y-%m-%d'),
        'txn_type': "Transfer",
        'bank_account': "SHADOW-BANK-ACCT-777",
        'linked_fir_id': "FIR-SHADOW-001"
    })
    transactions.append({
        'txn_id': "TXN-SHADOW-002",
        'accused_id': "ACC-SHADOW-002",
        'amount': 45000.0,
        'txn_date': (datetime.now() - timedelta(days=19)).strftime('%Y-%m-%d'),
        'txn_type': "Withdrawal",
        'bank_account': "SHADOW-BANK-ACCT-777",
        'linked_fir_id': "FIR-SHADOW-001"
    })

    # ----------------------------------------------------
    # Pattern B: High Risk Repeat Offender
    # ----------------------------------------------------
    # Name: Ravi Shankar Gowda (ACC-HIGHRISK-001)
    # 9 prior FIRs, escalating severity, out on bail, risk: 94
    accused.append({
        'accused_id': "ACC-HIGHRISK-001",
        'name': "Ravi Shankar Gowda",
        'age': 34,
        'gender': "Male",
        'address': "Rajajinagar, Bengaluru, Karnataka",
        'district': "Bengaluru Urban",
        'prior_case_count': 9,
        'risk_score': 94.0,
        'modus_operandi': "Assaults victim with weapon after snatching bag",
        'socio_economic_status': "Lower Class",
        'education_level': "Primary School",
        'occupation': "Laborer",
        'bail_status': True
    })
    
    # Create 9 escalating FIRs for Ravi Shankar Gowda
    escalating_ipc = ["379", "379", "380", "392", "392", "394", "307", "307", "307"]
    for idx, ipc in enumerate(escalating_ipc):
        f_id = f"FIR-HIGHRISK-{idx:03d}"
        crime_type, severity = IPC_MAP[ipc]
        mo = "Assaults victim with weapon after snatching bag" if severity >= 7 else "Snatches bag from behind"
        date_inc = (datetime.now() - timedelta(days=400 - idx * 40)).strftime('%Y-%m-%d')
        
        narrative = f"Repeat Offender Ravi Shankar Gowda was identified in this incident of {crime_type} under IPC {ipc}. The suspect approached the victim and executed crime with MO: {mo}. Current status is Open. Risk rating remains extreme."
        
        firs.append({
            'fir_id': f_id,
            'district': "Bengaluru Urban",
            'police_station': "Rajajinagar Police Station",
            'ipc_section': ipc,
            'crime_type': crime_type,
            'date_of_incident': date_inc,
            'location_description': "Rajajinagar Main Road",
            'latitude': 12.9904,
            'longitude': 77.5532,
            'modus_operandi': mo,
            'investigation_status': "Open" if idx >= 7 else "Chargesheeted",
            'fir_text': narrative
        })
        
        fir_accused.append({
            'fir_id': f_id,
            'accused_id': "ACC-HIGHRISK-001",
            'role': "primary"
        })

    # ----------------------------------------------------
    # Pattern C: Crime Hotspot
    # ----------------------------------------------------
    # Plant 45 theft FIRs within 2km radius of lat: 12.9716, lon: 77.5946 (Bengaluru City center)
    # All occurring between 10pm-2am on weekends (Friday/Saturday night)
    print("Planting 45 Hotspot Crimes...")
    for idx in range(1, 46):
        f_id = f"FIR-HOTSPOT-{idx:03d}"
        crime_type, severity = IPC_MAP["379"]
        
        # Date on a weekend (Friday or Saturday night)
        date_base = datetime.now() - timedelta(days=random.randint(1, 180))
        # Adjust day to Friday (4) or Saturday (5)
        while date_base.weekday() not in [4, 5]:
            date_base -= timedelta(days=1)
        date_str = date_base.strftime('%Y-%m-%d')
        
        # Time 10pm to 2am
        hour = random.choice([22, 23, 0, 1])
        mo = f"Snatches mobile phones and wallets from pedestrians at {hour} hours on weekend"
        
        # Within 2km (approx 0.018 degrees)
        lat = round(12.9716 + random.uniform(-0.015, 0.015), 6)
        lon = round(77.5946 + random.uniform(-0.015, 0.015), 6)
        
        narrative = f"A theft incident of mobile/wallet snatching occurred at coordinates {lat}, {lon} near Bengaluru city center. Modus operandi details: {mo}. Incident time was approximately {hour}:00 on weekend night. Under IPC 379."
        
        firs.append({
            'fir_id': f_id,
            'district': "Bengaluru Urban",
            'police_station': "Cubbon Park Police Station",
            'ipc_section': "379",
            'crime_type': crime_type,
            'date_of_incident': date_str,
            'location_description': "Bengaluru City Center Walkway",
            'latitude': lat,
            'longitude': lon,
            'modus_operandi': mo,
            'investigation_status': "Open" if random.random() > 0.3 else "Closed",
            'fir_text': narrative
        })

    # ----------------------------------------------------
    # Pattern D: Financial Crime Trail
    # ----------------------------------------------------
    # Link 3 FIRs (fraud cases) -> same bank account number through TRANSACTION table
    fraud_accused_id = "ACC-FRAUD-999"
    accused.append({
        'accused_id': fraud_accused_id,
        'name': "Harshad Mehta Kumar",
        'age': 45,
        'gender': "Male",
        'address': "Indiranagar, Bengaluru, Karnataka",
        'district': "Bengaluru Urban",
        'prior_case_count': 3,
        'risk_score': 68.2,
        'modus_operandi': "Phishing email link and OTP fraud redirecting to bank account",
        'socio_economic_status': "Upper Middle Class",
        'education_level': "Graduate",
        'occupation': "Private Employee",
        'bail_status': False
    })
    
    trail_bank = "FRAUD-TRAIL-ACCT-888"
    for idx in range(1, 4):
        f_id = f"FIR-FRAUD-{idx:03d}"
        crime_type, severity = IPC_MAP["420"]
        date_inc = (datetime.now() - timedelta(days=idx * 20)).strftime('%Y-%m-%d')
        mo = "Phishing email link and OTP fraud redirecting to bank account"
        
        narrative = f"An online bank fraud case under IPC 420 was reported where victim lost money. Modus operandi: phishing email link and OTP fraud redirecting to bank account. Investigation traced fund routing to account: {trail_bank}."
        
        firs.append({
            'fir_id': f_id,
            'district': "Bengaluru Urban",
            'police_station': "Cyber Crime Police Station",
            'ipc_section': "420",
            'crime_type': crime_type,
            'date_of_incident': date_inc,
            'location_description': "Online Cyber Space",
            'latitude': 12.9784,
            'longitude': 77.6408,
            'modus_operandi': mo,
            'investigation_status': "Open",
            'fir_text': narrative
        })
        
        fir_accused.append({
            'fir_id': f_id,
            'accused_id': fraud_accused_id,
            'role': "primary"
        })
        
        transactions.append({
            'txn_id': f"TXN-FRAUD-{idx:03d}",
            'accused_id': fraud_accused_id,
            'amount': 150000.0 * idx,
            'txn_date': date_inc,
            'txn_type': "Deposit",
            'bank_account': trail_bank,
            'linked_fir_id': f_id
        })

def main():
    print("Generating base records...")
    firs = generate_firs(4940) # Remainder will be filled by planted cases to total 5000
    accused = generate_accused(1994)
    victims = generate_victims(1500)
    
    # Establish base junctions and transaction details
    fir_accused = []
    fir_victim = []
    transactions = []
    
    # Link standard cases
    # Each standard FIR has 1-2 accused and 1 victim
    for f in firs[:4000]:
        assigned_acc = random.sample(accused, k=random.randint(1, 2))
        for a in assigned_acc:
            fir_accused.append({
                'fir_id': f['fir_id'],
                'accused_id': a['accused_id'],
                'role': random.choice(['primary', 'associate'])
            })
            # Add occasional transaction records
            if f['ipc_section'] in ["420", "384", "406"] and random.random() > 0.5:
                transactions.append({
                    'txn_id': f"TXN-{uuid.uuid4().hex[:8].upper()}",
                    'accused_id': a['accused_id'],
                    'amount': round(random.uniform(5000, 100000), 2),
                    'txn_date': f['date_of_incident'],
                    'txn_type': random.choice(["Deposit", "Withdrawal", "Transfer"]),
                    'bank_account': f"BANK-{random.randint(10000, 99999)}",
                    'linked_fir_id': f['fir_id']
                })
                
        # Assing victim
        v = random.choice(victims)
        fir_victim.append({
            'fir_id': f['fir_id'],
            'victim_id': v['victim_id']
        })
        
    # Plant evaluations
    plant_patterns(firs, accused, victims, fir_accused, fir_victim, transactions)
    
    # Write to CSV files
    def write_csv(filename, data, fieldnames):
        filepath = os.path.join(OUTPUT_DIR, filename)
        with open(filepath, 'w', newline='', encoding='utf-8') as f:
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()
            for row in data:
                writer.writerow(row)
        print(f"Wrote {len(data)} rows to {filename}")

    write_csv('fir.csv', firs, ['fir_id', 'district', 'police_station', 'ipc_section', 'crime_type', 'date_of_incident', 'location_description', 'latitude', 'longitude', 'modus_operandi', 'investigation_status', 'fir_text'])
    write_csv('accused.csv', accused, ['accused_id', 'name', 'age', 'gender', 'address', 'district', 'prior_case_count', 'risk_score', 'modus_operandi', 'socio_economic_status', 'education_level', 'occupation', 'bail_status'])
    write_csv('victim.csv', victims, ['victim_id', 'name', 'age', 'gender', 'address', 'district', 'socio_economic_status'])
    write_csv('fir_accused.csv', fir_accused, ['fir_id', 'accused_id', 'role'])
    write_csv('fir_victim.csv', fir_victim, ['fir_id', 'victim_id'])
    write_csv('transaction.csv', transactions, ['txn_id', 'accused_id', 'amount', 'txn_date', 'txn_type', 'bank_account', 'linked_fir_id'])
    
    # Generate some alerts too
    alerts = []
    # Hotspot alert
    alerts.append({
        'alert_id': "ALT-001",
        'alert_type': "Crime Spike Anomaly",
        'district': "Bengaluru Urban",
        'description': "CRITICAL ALERT: Significant anomaly detected in Bengaluru Urban district. Theft rates have increased from 3.5 incidents/day to 45 incidents in the last 24 hours. Involved FIRs: FIR-HOTSPOT-001 to FIR-HOTSPOT-045. Common modus operandi: Phone/wallet snatching during late weekend hours.",
        'created_at': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
        'severity': "Critical",
        'acknowledged': False,
        'source_fir_ids': ",".join([f"FIR-HOTSPOT-{i:03d}" for i in range(1, 10)])
    })
    
    # Gang activity alert
    alerts.append({
        'alert_id': "ALT-002",
        'alert_type': "Gang Movement Anomaly",
        'district': "Mysuru",
        'description': "HIGH ALERT: Active burglaries linked to the 'Shadow Gang' reported in Mysuru (FIR-SHADOW-006, FIR-SHADOW-007). Shared MO: Breaks rear window latch between 2am-4am.",
        'created_at': (datetime.now() - timedelta(hours=4)).strftime('%Y-%m-%d %H:%M:%S'),
        'severity': "High",
        'acknowledged': False,
        'source_fir_ids': "FIR-SHADOW-006,FIR-SHADOW-007"
    })
    
    write_csv('alert.csv', alerts, ['alert_id', 'alert_type', 'district', 'description', 'created_at', 'severity', 'acknowledged', 'source_fir_ids'])
    
    print("Synthetic data generation finished successfully!")

if __name__ == '__main__':
    main()
