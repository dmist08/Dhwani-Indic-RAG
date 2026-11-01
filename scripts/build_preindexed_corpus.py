import json
import time
from pathlib import Path
import pyarrow.parquet as pq
import numpy as np
from fastembed import TextEmbedding

DATA_DIR = Path("data")
DATA_DIR.mkdir(exist_ok=True)

print("=" * 60)
print("DHVANI INDIC RAG - High-Speed Corpus Ingestion & Pre-Indexer")
print("=" * 60)

t0 = time.time()

# 1. Extract Answerable Rows from gujval.parquet and hinval.parquet
corpus_records = []
seen_ids = set()

# Process gujval.parquet
print("1/4 Loading answerable rows from gujval.parquet...")
pf_guj = pq.ParquetFile("gujval.parquet")
guj_count = 0
for batch in pf_guj.iter_batches(batch_size=5000):
    for row in batch.to_pylist():
        qid = row.get("query_id")
        if qid in seen_ids:
            continue
        passages = row.get("passages") or {}
        selected = passages.get("is_selected") or []
        trans_pass = passages.get("Translated_passages") or []
        eng_pass = passages.get("English_passages") or []
        
        # Check if answerable
        if any(selected) and (row.get("Answer") or row.get("Eng_Answer")):
            sel_idx = selected.index(1) if 1 in selected else 0
            best_trans = trans_pass[sel_idx] if sel_idx < len(trans_pass) else (trans_pass[0] if trans_pass else "")
            best_eng = eng_pass[sel_idx] if sel_idx < len(eng_pass) else (eng_pass[0] if eng_pass else "")
            
            if best_trans and len(best_trans) > 20:
                corpus_records.append({
                    "query_id": qid,
                    "query": row.get("query", ""),
                    "answer": row.get("Answer", ""),
                    "eng_query": row.get("Eng_Query", ""),
                    "eng_answer": row.get("Eng_Answer", ""),
                    "language": "gu",
                    "text_guj": best_trans,
                    "text_eng": best_eng,
                    "passages": [best_trans] + [p for i, p in enumerate(trans_pass) if i != sel_idx][:2]
                })
                seen_ids.add(qid)
                guj_count += 1
                if guj_count >= 5000:
                    break
    if guj_count >= 5000:
        break

print(f"Extracted {guj_count} high-quality Gujarati answerable rows.")

# Process hinval.parquet
print("2/4 Loading answerable rows from hinval.parquet...")
pf_hin = pq.ParquetFile("hinval.parquet")
hin_count = 0
for batch in pf_hin.iter_batches(batch_size=5000):
    for row in batch.to_pylist():
        qid = row.get("query_id")
        if qid in seen_ids:
            continue
        passages = row.get("passages") or {}
        selected = passages.get("is_selected") or []
        trans_pass = passages.get("Translated_passages") or []
        eng_pass = passages.get("English_passages") or []
        
        if any(selected) and (row.get("Answer") or row.get("Eng_Answer")):
            sel_idx = selected.index(1) if 1 in selected else 0
            best_trans = trans_pass[sel_idx] if sel_idx < len(trans_pass) else (trans_pass[0] if trans_pass else "")
            best_eng = eng_pass[sel_idx] if sel_idx < len(eng_pass) else (eng_pass[0] if eng_pass else "")
            
            if best_trans and len(best_trans) > 20:
                corpus_records.append({
                    "query_id": qid,
                    "query": row.get("query", ""),
                    "answer": row.get("Answer", ""),
                    "eng_query": row.get("Eng_Query", ""),
                    "eng_answer": row.get("Eng_Answer", ""),
                    "language": "hi",
                    "text_hin": best_trans,
                    "text_eng": best_eng,
                    "passages": [best_trans] + [p for i, p in enumerate(trans_pass) if i != sel_idx][:2]
                })
                seen_ids.add(qid)
                hin_count += 1
                if hin_count >= 3000:
                    break
    if hin_count >= 3000:
        break

print(f"Extracted {hin_count} high-quality Hindi answerable rows.")
print(f"Total Combined Corpus Records: {len(corpus_records)}")

# 3. Save Unified JSON Dataset
json_out = DATA_DIR / "msmarco_sampled_guj.json"
with open(json_out, "w", encoding="utf-8") as f:
    json.dump(corpus_records, f, ensure_ascii=False, indent=2)
print(f"Saved {len(corpus_records)} rows to {json_out}")

# 4. Generate Pre-Computed Embeddings for Instant Startup
print("3/4 Pre-computing FastEmbed multilingual MiniLM embeddings in batches of 128...")
embed_model = TextEmbedding(model_name="sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2")

# Prepare text chunks for embedding
texts_to_embed = []
chunk_metadata = []

for rec in corpus_records:
    qid = str(rec["query_id"])
    eng_q = rec.get("eng_query", "")
    native_q = rec.get("query", "")
    
    # Primary passage
    p_text = rec["passages"][0] if rec.get("passages") else ""
    if p_text:
        # Contextual prefix
        contextual_text = f"Context for {eng_q} / {native_q}: {p_text}"
        texts_to_embed.append(contextual_text)
        chunk_metadata.append({
            "chunk_id": f"{qid}_ctx",
            "doc_id": qid,
            "text": p_text,
            "query": native_q,
            "eng_query": eng_q,
            "answer": rec.get("answer", "") or rec.get("eng_answer", ""),
            "strategy": "contextual"
        })

print(f"Embedding {len(texts_to_embed)} contextual chunks...")
embeddings_list = list(embed_model.embed(texts_to_embed, batch_size=128))
embeddings_array = np.array(embeddings_list, dtype=np.float32)

# Normalize embeddings for cosine similarity
norms = np.linalg.norm(embeddings_array, axis=1, keepdims=True)
norms[norms == 0] = 1.0
embeddings_array = embeddings_array / norms

# Save binary numpy array and metadata
np.savez_compressed(DATA_DIR / "preindexed_vectors.npz", embeddings=embeddings_array)
with open(DATA_DIR / "preindexed_meta.json", "w", encoding="utf-8") as f:
    json.dump(chunk_metadata, f, ensure_ascii=False)

elapsed = time.time() - t0
print("=" * 60)
print(f"INGESTION & PRE-INDEXING COMPLETE IN {elapsed:.1f}s!")
print(f"Indexed Chunks: {len(chunk_metadata)}")
print(f"Vector File: {DATA_DIR / 'preindexed_vectors.npz'} ({embeddings_array.shape})")
print(f"Metadata File: {DATA_DIR / 'preindexed_meta.json'}")
print("=" * 60)
