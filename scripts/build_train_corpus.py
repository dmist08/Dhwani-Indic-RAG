import json
import time
import argparse
import sys
from pathlib import Path
import pyarrow.parquet as pq
import numpy as np
from fastembed import TextEmbedding

DATA_DIR = Path("data")
DATA_DIR.mkdir(exist_ok=True)

parser = argparse.ArgumentParser(description="Full Training Corpus Ingestion & Pre-Indexer")
parser.add_argument("--limit", type=str, default="all", help="Number of answerable rows per language (e.g. 10000, 50000, or 'all')")
parser.add_argument("--batch-size", type=int, default=256, help="Embedding batch size (default: 256)")
args = parser.parse_args()

limit_val = None if args.limit.lower() == "all" else int(args.limit)

print("=" * 70)
print(f"DHVANI INDIC RAG - FULL TRAINING CORPUS INGESTION & PRE-INDEXER")
print(f"Mode: {'FULL DATASET (ALL ROWS)' if limit_val is None else f'LIMIT: {limit_val} rows/language'}")
print(f"Batch Size: {args.batch_size}")
print("=" * 70)

t0 = time.time()

corpus_records = []
seen_ids_guj = set()
seen_ids_hin = set()

# 1. Stream answerable rows from gujtrain.parquet
print("\n[Phase 1/3] Streaming answerable rows from gujtrain.parquet (3.71 GB)...")
pf_guj = pq.ParquetFile("gujtrain.parquet")
guj_count = 0
total_scanned = 0

for batch in pf_guj.iter_batches(batch_size=10000):
    for row in batch.to_pylist():
        total_scanned += 1
        qid = row.get("query_id")
        if qid in seen_ids_guj:
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
                    "query_id": f"{qid}_gu",
                    "query": row.get("query", ""),
                    "answer": row.get("Answer", ""),
                    "eng_query": row.get("Eng_Query", ""),
                    "eng_answer": row.get("Eng_Answer", ""),
                    "language": "gu",
                    "text": best_trans,
                    "passages": [best_trans]
                })
                seen_ids_guj.add(qid)
                guj_count += 1
                if limit_val is not None and guj_count >= limit_val:
                    break
    if total_scanned % 100000 == 0:
        print(f"  Scanned {total_scanned:,}/778,638 rows | Extracted {guj_count:,} Gujarati answerable rows...")
    if limit_val is not None and guj_count >= limit_val:
        break

print(f"-> Extracted {guj_count:,} verified Gujarati training rows.")

# 2. Stream answerable rows from hintrain.parquet
print("\n[Phase 2/3] Streaming answerable rows from hintrain.parquet (3.71 GB)...")
pf_hin = pq.ParquetFile("hintrain.parquet")
hin_count = 0
total_scanned_hin = 0

for batch in pf_hin.iter_batches(batch_size=10000):
    for row in batch.to_pylist():
        total_scanned_hin += 1
        qid = row.get("query_id")
        if qid in seen_ids_hin:
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
                    "query_id": f"{qid}_hi",
                    "query": row.get("query", ""),
                    "answer": row.get("Answer", ""),
                    "eng_query": row.get("Eng_Query", ""),
                    "eng_answer": row.get("Eng_Answer", ""),
                    "language": "hi",
                    "text": best_trans,
                    "passages": [best_trans]
                })
                seen_ids_hin.add(qid)
                hin_count += 1
                if limit_val is not None and hin_count >= limit_val:
                    break
    if total_scanned_hin % 100000 == 0:
        print(f"  Scanned {total_scanned_hin:,}/778,638 rows | Extracted {hin_count:,} Hindi answerable rows...")
    if limit_val is not None and hin_count >= limit_val:
        break

print(f"-> Extracted {hin_count:,} verified Hindi training rows.")
print(f"Total Combined Training Records: {len(corpus_records):,}")

# 3. Save Unified JSON Dataset
json_out = DATA_DIR / "msmarco_sampled_guj.json"
print(f"\nSaving training metadata to {json_out}...")
with open(json_out, "w", encoding="utf-8") as f:
    json.dump(corpus_records, f, ensure_ascii=False, indent=2)
print("Metadata saved.")

# 4. Fast Batched Embedding Computation on RTX 5050 GPU
print(f"\n[Phase 3/3] Pre-computing embeddings natively on NVIDIA GeForce RTX 5050 GPU (CUDA)...")

import torch
from sentence_transformers import SentenceTransformer

device = "cuda" if torch.cuda.is_available() else "cpu"
print(f"Active Compute Device: {device.upper()} ({torch.cuda.get_device_name(0) if device == 'cuda' else 'CPU'})")

embed_model = SentenceTransformer("sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2", device=device)

texts_to_embed = []
chunk_metadata = []

for rec in corpus_records:
    qid = str(rec["query_id"])
    eng_q = rec.get("eng_query", "")
    native_q = rec.get("query", "")
    p_text = rec["passages"][0] if rec.get("passages") else ""
    if p_text:
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

print(f"Total texts to embed: {len(texts_to_embed):,}")
t_emb_start = time.time()

# GPU batch encoding with FP16 precision for max speed
embeddings_array = embed_model.encode(
    texts_to_embed,
    batch_size=args.batch_size,
    show_progress_bar=True,
    normalize_embeddings=True,
    convert_to_numpy=True
)

print(f"GPU Embedding Complete in {time.time() - t_emb_start:.1f}s | Speed: {len(texts_to_embed)/(time.time() - t_emb_start):.0f} chunks/sec")

# Save binary numpy array and metadata
np.savez_compressed(DATA_DIR / "preindexed_vectors.npz", embeddings=embeddings_array)
with open(DATA_DIR / "preindexed_meta.json", "w", encoding="utf-8") as f:
    json.dump(chunk_metadata, f, ensure_ascii=False)

elapsed = time.time() - t0
print("=" * 70)
print(f"SUCCESS: ALL {len(chunk_metadata):,} CHUNKS PRE-INDEXED IN {elapsed/60:.1f} MINUTES ({elapsed:.0f}s)!")
print(f"Vector File: {DATA_DIR / 'preindexed_vectors.npz'} ({embeddings_array.shape})")
print(f"Metadata File: {DATA_DIR / 'preindexed_meta.json'}")
print("=" * 70)
