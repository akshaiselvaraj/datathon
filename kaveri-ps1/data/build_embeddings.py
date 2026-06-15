import os
import pandas as pd
from dotenv import load_dotenv

# Load environment variables
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '../.env'))

def main():
    data_dir = os.path.join(os.path.dirname(__file__), 'output')
    fir_file = os.path.join(data_dir, 'fir.csv')
    
    if not os.path.exists(fir_file):
        print("fir.csv not found. Please run generate_synthetic.py first.")
        return
        
    df = pd.read_csv(fir_file)
    print(f"Loaded {len(df)} FIR narratives for embedding.")
    
    api_key = os.getenv("PINECONE_API_KEY")
    index_name = os.getenv("PINECONE_INDEX", "ksp-crime-firs")
    
    if not api_key or api_key == "your_pinecone_key_here":
        print("PINECONE_API_KEY not configured. Skipping upload to Pinecone.")
        print("To load, configure the .env file and run:")
        print("  pip install sentence-transformers pinecone-client")
        return

    try:
        from sentence_transformers import SentenceTransformer
        from pinecone import Pinecone, ServerlessSpec
    except ImportError:
        print("Required libraries 'sentence-transformers' or 'pinecone-client' are missing.")
        print("Please run: pip install sentence-transformers pinecone-client")
        return
        
    print("Initializing Pinecone client...")
    pc = Pinecone(api_key=api_key)
    
    # Check if index exists, else create it
    if index_name not in pc.list_indexes().names():
        print(f"Creating Pinecone Index '{index_name}'...")
        pc.create_index(
            name=index_name,
            dimension=384, # all-MiniLM-L6-v2 dimension
            metric='cosine',
            spec=ServerlessSpec(
                cloud='aws',
                region='us-east-1'
            )
        )
        
    index = pc.Index(index_name)
    
    print("Loading SentenceTransformer model 'all-MiniLM-L6-v2'...")
    model = SentenceTransformer('all-MiniLM-L6-v2')
    
    print("Generating embeddings and upserting in batches...")
    batch_size = 100
    for i in range(0, len(df), batch_size):
        batch = df.iloc[i:i+batch_size]
        texts = batch['fir_text'].tolist()
        ids = batch['fir_id'].tolist()
        
        # Generate embeddings
        embeddings = model.encode(texts)
        
        # Prepare payload
        vectors = []
        for idx, fir_id in enumerate(ids):
            row = batch.iloc[idx]
            metadata = {
                'fir_id': str(row['fir_id']),
                'district': str(row['district']),
                'crime_type': str(row['crime_type']),
                'ipc_section': str(row['ipc_section']),
                'modus_operandi': str(row['modus_operandi'])
            }
            vectors.append({
                'id': fir_id,
                'values': embeddings[idx].tolist(),
                'metadata': metadata
            })
            
        # Upsert
        index.upsert(vectors=vectors)
        print(f"Upserted batch {i // batch_size + 1}/{len(df) // batch_size + 1}")
        
    print("Pinecone embeddings build complete!")

if __name__ == '__main__':
    main()
