import os
import pandas as pd
from dotenv import load_dotenv

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '../.env'))

def main():
    data_dir = os.path.join(os.path.dirname(__file__), 'output')
    
    uri = os.getenv("NEO4J_URI")
    username = os.getenv("NEO4J_USERNAME", "neo4j")
    password = os.getenv("NEO4J_PASSWORD")
    
    if not uri or uri == "neo4j+s://your-aura-instance.databases.neo4j.io" or not password:
        print("Neo4j configuration missing in .env. Skipping graph upload.")
        print("To load, configure the .env file and run:")
        print("  pip install neo4j")
        return
        
    try:
        from neo4j import GraphDatabase
    except ImportError:
        print("Neo4j driver library 'neo4j' is missing.")
        print("Please run: pip install neo4j")
        return
        
    print(f"Connecting to Neo4j at {uri}...")
    driver = GraphDatabase.driver(uri, auth=(username, password))
    
    # Check if files exist
    required_files = ['fir.csv', 'accused.csv', 'victim.csv', 'fir_accused.csv', 'fir_victim.csv', 'transaction.csv']
    for f in required_files:
        if not os.path.exists(os.path.join(data_dir, f)):
            print(f"File {f} not found. Please run generate_synthetic.py first.")
            return

    # Load dataframes
    fir_df = pd.read_csv(os.path.join(data_dir, 'fir.csv'))
    accused_df = pd.read_csv(os.path.join(data_dir, 'accused.csv'))
    victim_df = pd.read_csv(os.path.join(data_dir, 'victim.csv'))
    fir_accused_df = pd.read_csv(os.path.join(data_dir, 'fir_accused.csv'))
    fir_victim_df = pd.read_csv(os.path.join(data_dir, 'fir_victim.csv'))
    txn_df = pd.read_csv(os.path.join(data_dir, 'transaction.csv'))
    
    # Limit number of records uploaded to stay within free-tier Neo4j Aura limits (e.g. 50k nodes max)
    # We will upload all the planted patterns and a subset of the random records
    print("Preparing subset of records for Neo4j loader...")
    # Keep all planted pattern records
    hotspot_firs = fir_df[fir_df['fir_id'].str.contains('HOTSPOT|SHADOW|HIGHRISK|FRAUD')]
    shadow_accused = accused_df[accused_df['accused_id'].str.contains('SHADOW|HIGHRISK|FRAUD')]
    
    # Grab additional 300 random FIRs and 200 random accused
    other_firs = fir_df[~fir_df['fir_id'].str.contains('HOTSPOT|SHADOW|HIGHRISK|FRAUD')].sample(n=300, random_state=42)
    other_accused = accused_df[~accused_df['accused_id'].str.contains('SHADOW|HIGHRISK|FRAUD')].sample(n=200, random_state=42)
    
    neo_firs = pd.concat([hotspot_firs, other_firs])
    neo_accused = pd.concat([shadow_accused, other_accused])
    
    # Filter junctions accordingly
    neo_fir_ids = set(neo_firs['fir_id'])
    neo_acc_ids = set(neo_accused['accused_id'])
    
    neo_fir_accused = fir_accused_df[fir_accused_df['fir_id'].isin(neo_fir_ids) & fir_accused_df['accused_id'].isin(neo_acc_ids)]
    
    # Victims - keep 100 for graph links
    neo_victim = victim_df.sample(n=100, random_state=42)
    neo_vic_ids = set(neo_victim['victim_id'])
    neo_fir_victim = fir_victim_df[fir_victim_df['fir_id'].isin(neo_fir_ids) & fir_victim_df['victim_id'].isin(neo_vic_ids)]
    
    # Transactions related to our loaded accused
    neo_txn = txn_df[txn_df['accused_id'].isin(neo_acc_ids)]

    with driver.session() as session:
        print("Clearing existing nodes and relationships...")
        session.run("MATCH (n) DETACH DELETE n")
        
        # 1. Create Accused Nodes
        print("Creating Accused nodes...")
        acc_query = """
        UNWIND $rows AS row
        CREATE (a:Accused {
            id: row.accused_id,
            name: row.name,
            age: toInteger(row.age),
            gender: row.gender,
            district: row.district,
            prior_case_count: toInteger(row.prior_case_count),
            risk_score: toFloat(row.risk_score),
            modus_operandi: row.modus_operandi,
            bail_status: toBoolean(row.bail_status)
        })
        """
        session.run(acc_query, rows=neo_accused.to_dict('records'))
        
        # 2. Create FIR Nodes
        print("Creating FIR nodes...")
        fir_query = """
        UNWIND $rows AS row
        CREATE (f:FIR {
            id: row.fir_id,
            district: row.district,
            police_station: row.police_station,
            ipc_section: row.ipc_section,
            crime_type: row.crime_type,
            date_of_incident: row.date_of_incident,
            modus_operandi: row.modus_operandi,
            investigation_status: row.investigation_status
        })
        """
        session.run(fir_query, rows=neo_firs.to_dict('records'))
        
        # 3. Create Victim Nodes
        print("Creating Victim nodes...")
        vic_query = """
        UNWIND $rows AS row
        CREATE (v:Victim {
            id: row.victim_id,
            name: row.name,
            age: toInteger(row.age),
            gender: row.gender,
            district: row.district
        })
        """
        session.run(vic_query, rows=neo_victim.to_dict('records'))

        # 4. Create Accused-FIR Relationships (ACCUSED_IN)
        print("Linking Accused to FIRs...")
        rel_acc_fir = """
        UNWIND $rows AS row
        MATCH (a:Accused {id: row.accused_id})
        MATCH (f:FIR {id: row.fir_id})
        CREATE (a)-[:ACCUSED_IN {role: row.role}]->(f)
        """
        session.run(rel_acc_fir, rows=neo_fir_accused.to_dict('records'))

        # 5. Create Victim-FIR Relationships (VICTIM_IN)
        print("Linking Victims to FIRs...")
        rel_vic_fir = """
        UNWIND $rows AS row
        MATCH (v:Victim {id: row.victim_id})
        MATCH (f:FIR {id: row.fir_id})
        CREATE (v)-[:VICTIM_IN]->(f)
        """
        session.run(rel_vic_fir, rows=neo_fir_victim.to_dict('records'))

        # 6. Create BankAccount Nodes & Relationships
        print("Creating BankAccounts and linking transactions...")
        # Get unique bank accounts
        unique_banks = neo_txn[['bank_account']].drop_duplicates()
        bank_query = """
        UNWIND $rows AS row
        CREATE (b:BankAccount {id: row.bank_account})
        """
        session.run(bank_query, rows=unique_banks.to_dict('records'))
        
        # Link Accused to Bank Accounts
        acc_bank_query = """
        UNWIND $rows AS row
        MATCH (a:Accused {id: row.accused_id})
        MATCH (b:BankAccount {id: row.bank_account})
        CREATE (a)-[:LINKED_ACCOUNT {
            txn_id: row.txn_id,
            amount: toFloat(row.amount),
            txn_date: row.txn_date,
            txn_type: row.txn_type
        }]->(b)
        """
        session.run(acc_bank_query, rows=neo_txn.to_dict('records'))

        # If transaction is linked to an FIR, connect BankAccount to FIR
        txn_fir = neo_txn[neo_txn['linked_fir_id'].notna()]
        bank_fir_query = """
        UNWIND $rows AS row
        MATCH (b:BankAccount {id: row.bank_account})
        MATCH (f:FIR {id: row.linked_fir_id})
        CREATE (b)-[:OCCURRED_IN_FIR]->(f)
        """
        session.run(bank_fir_query, rows=txn_fir.to_dict('records'))

        # 7. Create CO_ACCUSED relationships explicitly (shortcut edge)
        print("Creating Co-Accused links...")
        co_acc_query = """
        MATCH (a1:Accused)-[:ACCUSED_IN]->(f:FIR)<-[:ACCUSED_IN]-(a2:Accused)
        WHERE a1.id < a2.id
        MERGE (a1)-[:CO_ACCUSED]-(a2)
        """
        session.run(co_acc_query)
        
    print("Neo4j Graph loaded successfully!")
    driver.close()

if __name__ == '__main__':
    main()
