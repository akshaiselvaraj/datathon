import os
import pandas as pd
import numpy as np

# IPC Severity mapping 1-10
IPC_SEVERITY = {
    "302": 10, "307": 9, "376": 9, "420": 6, "379": 4, "380": 4,
    "392": 7, "394": 8, "498A": 5, "506": 4, "324": 5, "326": 7,
    "363": 6, "364": 9, "384": 6, "395": 8, "397": 9, "406": 5
}

def engineer_features(data_dir):
    # Load files
    fir_df = pd.read_csv(os.path.join(data_dir, 'fir.csv'))
    accused_df = pd.read_csv(os.path.join(data_dir, 'accused.csv'))
    fir_accused_df = pd.read_csv(os.path.join(data_dir, 'fir_accused.csv'))
    
    # Merge FIR details into junction table
    merged = fir_accused_df.merge(fir_df, on='fir_id', how='inner')
    merged['severity_score'] = merged['ipc_section'].astype(str).map(IPC_SEVERITY).fillna(1)
    
    # Parse dates
    merged['date_of_incident'] = pd.to_datetime(merged['date_of_incident'])
    
    # 1. Prior Case Count (we already have prior_case_count field, but we can compute from dataset counts too)
    case_counts = merged.groupby('accused_id').size().reset_index(name='dataset_case_count')
    
    # 2. Crime Severity Score (mean & max)
    severity_agg = merged.groupby('accused_id').agg(
        avg_severity=('severity_score', 'mean'),
        max_severity=('severity_score', 'max')
    ).reset_index()
    
    # 3. Time since last crime (days relative to "current time" 2026-06-11)
    current_time = pd.to_datetime('2026-06-11')
    last_crime_date = merged.groupby('accused_id')['date_of_incident'].max().reset_index()
    last_crime_date['time_since_last_crime_days'] = (current_time - last_crime_date['date_of_incident']).dt.days
    
    # 4. Distinct crime types count
    distinct_crimes = merged.groupby('accused_id')['crime_type'].nunique().reset_index(name='distinct_crime_type_count')
    
    # 5. Co-accused network size
    # For each accused, find how many unique co-accused they share FIRs with
    co_acc_count = {}
    for acc_id in accused_df['accused_id']:
        # Find FIRs where this accused is involved
        firs_involved = fir_accused_df[fir_accused_df['accused_id'] == acc_id]['fir_id']
        # Find other accused in those FIRs
        others = fir_accused_df[fir_accused_df['fir_id'].isin(firs_involved) & (fir_accused_df['accused_id'] != acc_id)]
        co_acc_count[acc_id] = others['accused_id'].nunique()
        
    co_acc_df = pd.DataFrame(list(co_acc_count.items()), columns=['accused_id', 'co_accused_network_size'])
    
    # 6. Escalation trend (severity increasing or decreasing)
    # Slope of severity score over time for each accused
    escalation_trend = {}
    for acc_id, group in merged.groupby('accused_id'):
        if len(group) < 2:
            escalation_trend[acc_id] = 0.0
        else:
            sorted_grp = group.sort_values('date_of_incident')
            sevs = sorted_grp['severity_score'].values
            # simple diff of last vs first
            escalation_trend[acc_id] = float(sevs[-1] - sevs[0])
            
    esc_df = pd.DataFrame(list(escalation_trend.items()), columns=['accused_id', 'escalation_trend'])
    
    # Merge all features into a single feature dataframe
    features = accused_df[['accused_id', 'prior_case_count', 'age', 'bail_status']].copy()
    features = features.merge(case_counts, on='accused_id', how='left').fillna(0)
    features = features.merge(severity_agg, on='accused_id', how='left').fillna(1)
    features = features.merge(last_crime_date[['accused_id', 'time_since_last_crime_days']], on='accused_id', how='left').fillna(365)
    features = features.merge(distinct_crimes, on='accused_id', how='left').fillna(0)
    features = features.merge(co_acc_df, on='accused_id', how='left').fillna(0)
    features = features.merge(esc_df, on='accused_id', how='left').fillna(0)
    
    # Convert categorical features
    features['bail_status_int'] = features['bail_status'].astype(str).str.lower().map({'true': 1, 'false': 0}).fillna(0).astype(int)
    
    return features
