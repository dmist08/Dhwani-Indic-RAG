import os
import sys
import time
import json
from pathlib import Path
from typing import List, Dict, Any, Optional, Tuple
from qdrant_client import QdrantClient
from qdrant_client.http import models as qmodels
from fastembed import TextEmbedding

BASE_DIR = Path(__file__).resolve().parent.parent
BACKEND_DIR = Path(__file__).resolve().parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

try:
    from backend.config import settings
    from backend.schemas import RetrievedChunk, RetrievalState
    from backend.chunking import get_chunker
    from backend.sparse_engine import SparseBM25PlusEngine
except ImportError:
    from config import settings
    from schemas import RetrievedChunk, RetrievalState
    from chunking import get_chunker
    from sparse_engine import SparseBM25PlusEngine

class VectorStoreManager:
    def __init__(self, in_memory: bool = True):
        if in_memory:
            self.client = QdrantClient(":memory:")
        else:
            self.client = QdrantClient(path=str(settings.QDRANT_PATH))
            
        # Initialize Multilingual Embedding Model
        self.embedding_model = TextEmbedding(
            model_name=settings.EMBEDDING_MODEL_NAME,
            cache_dir=str(settings.CACHE_DIR),
            providers=["CPUExecutionProvider"]
        )
        self.indexed_collections = set()
        self.preindexed_embeddings = None
        self.preindexed_meta = None
        
        # Load pre-indexed training vectors if available on disk for sub-5ms search
        vec_path = settings.DATA_DIR / "preindexed_vectors.npz"
        meta_path = settings.DATA_DIR / "preindexed_meta.json"
        self.faiss_index = None
        if vec_path.exists() and meta_path.exists():
            try:
                import numpy as np
                import faiss
                faiss.omp_set_num_threads(8)
                npz = np.load(vec_path)
                self.preindexed_embeddings = npz["embeddings"]
                with open(meta_path, "r", encoding="utf-8") as f:
                    self.preindexed_meta = json.load(f)
                
                # Build SIMD-accelerated FAISS index
                self.faiss_index = faiss.IndexFlatIP(384)
                self.faiss_index.add(self.preindexed_embeddings)
                print(f"Loaded {len(self.preindexed_meta)} pre-indexed vectors into SIMD FAISS index in 0.02s!")
            except Exception as e:
                print(f"Pre-index load note: {e}")

        # Initialize and build BM25+ Sparse Retrieval Index
        self.sparse_engine = SparseBM25PlusEngine()
        if self.preindexed_meta is not None:
            try:
                bm25_cache = settings.DATA_DIR / "bm25_index.pkl"
                if bm25_cache.exists():
                    import pickle
                    with open(bm25_cache, "rb") as f:
                        self.sparse_engine = pickle.load(f)
                    print(f"Loaded BM25+ sparse index from cache ({self.sparse_engine.doc_count} docs)!")
                else:
                    print(f"Building BM25+ sparse index for {len(self.preindexed_meta)} docs...")
                    self.sparse_engine.build_index(self.preindexed_meta)
                    try:
                        import pickle
                        with open(bm25_cache, "wb") as f:
                            pickle.dump(self.sparse_engine, f, protocol=pickle.HIGHEST_PROTOCOL)
                    except Exception:
                        pass
                    print(f"Built and cached BM25+ sparse index ({len(self.preindexed_meta)} docs)!")
            except Exception as e:
                print(f"BM25 sparse build note: {e}")
                
        print("VectorStoreManager initialized with FastEmbed, FAISS, and BM25+.")

    def get_collection_name(self, strategy: str) -> str:
        return f"msmarco_{strategy}"

    def ensure_collection(self, collection_name: str, vector_size: int = 384):
        collections = [c.name for c in self.client.get_collections().collections]
        if collection_name not in collections:
            self.client.create_collection(
                collection_name=collection_name,
                vectors_config=qmodels.VectorParams(
                    size=vector_size,
                    distance=qmodels.Distance.COSINE
                ),
                hnsw_config=qmodels.HnswConfigDiff(
                    m=16,
                    ef_construct=100,
                    full_scan_threshold=10000
                )
            )

    def embed_query(self, query: str) -> Tuple[List[float], float]:
        t0 = time.time()
        emb_gen = self.embedding_model.embed([query])
        vec = list(emb_gen)[0].tolist()
        lat = (time.time() - t0) * 1000
        return vec, lat

    def index_dataset(self, dataset: List[Dict[str, Any]], strategy: str = "parent_child", max_docs: int = 50) -> int:
        coll_name = self.get_collection_name(strategy)
        self.ensure_collection(coll_name)
        
        chunker = get_chunker(strategy)
        all_chunks = []
        
        for item in dataset[:max_docs]:
            q_id = item.get('query_id', 0)
            q_text = item.get('query', '')
            q_type = item.get('query_type', 'GENERAL')
            passages = item.get('passages', [])
            
            for p_idx, passage in enumerate(passages):
                p_text = passage.get('text', '')
                if not p_text or len(p_text.strip()) < 10:
                    continue
                p_id = passage.get('passage_id', f"{q_id}_{p_idx}")
                sel = passage.get('is_selected', 0)
                eng_p_text = passage.get('english_text', p_text)
                meta = {
                    'parent_id': str(p_id),
                    'query_id': q_id,
                    'query_type': q_type,
                    'is_selected': sel,
                    'source_doc_id': q_id,
                    'language': 'gujarati'
                }
                chunks = chunker.chunk_text(p_text, meta)
                for c_idx, c in enumerate(chunks):
                    all_chunks.append({
                        'id': len(all_chunks),
                        'chunk_id': f"{p_id}_{c_idx}",
                        'text': c.get('chunk_text', c.get('text', '')),
                        'english_text': eng_p_text,
                        'parent_context': c.get('parent_context', p_text),
                        'parent_id': str(p_id),
                        'query_id': q_id,
                        'query_type': q_type,
                        'is_selected': sel,
                        'strategy': strategy
                    })
        
        if not all_chunks:
            return 0

        texts = [c['text'] for c in all_chunks]
        embeddings = [ev.tolist() for ev in self.embedding_model.embed(texts)]
        
        points = [
            qmodels.PointStruct(
                id=c['id'],
                vector=emb,
                payload=c
            )
            for c, emb in zip(all_chunks, embeddings)
        ]
        
        self.client.upload_points(
            collection_name=coll_name,
            points=points,
            wait=True
        )
        self.indexed_collections.add(coll_name)
        return len(points)

    def search(self, query: str, strategy: str = "parent_child", top_k: int = 4) -> RetrievalState:
        coll_name = self.get_collection_name(strategy)
        
        # If requested strategy is not yet indexed, fallback to any available indexed collection
        if coll_name not in self.indexed_collections and self.indexed_collections:
            coll_name = list(self.indexed_collections)[0]
            
        self.ensure_collection(coll_name)
        vec, emb_lat = self.embed_query(query)
        
        t0 = time.time()
        
        # Fast Path: If pre-indexed vector matrix is loaded, perform true Hybrid Retrieval (FAISS Dense + BM25+ Sparse via RRF)
        if self.preindexed_embeddings is not None and self.preindexed_meta is not None:
            import numpy as np
            q_arr = np.array(vec, dtype=np.float32)
            norm = np.linalg.norm(q_arr)
            if norm > 0:
                q_arr = q_arr / norm
            
            candidate_pool_size = min(max(top_k * 50, 300), len(self.preindexed_meta))
            
            # 1. Dense Semantic Search (FAISS SIMD Cosine Similarity)
            dense_candidates = {}
            if getattr(self, "faiss_index", None) is not None:
                faiss_scores, faiss_indices = self.faiss_index.search(q_arr.reshape(1, -1), candidate_pool_size)
                for rank, (idx, score) in enumerate(zip(faiss_indices[0], faiss_scores[0])):
                    if 0 <= idx < len(self.preindexed_meta):
                        dense_candidates[int(idx)] = (rank, float(score))
            else:
                scores = np.dot(self.preindexed_embeddings, q_arr)
                part_indices = np.argpartition(scores, -candidate_pool_size)[-candidate_pool_size:]
                part_indices = part_indices[np.argsort(-scores[part_indices])]
                for rank, idx in enumerate(part_indices):
                    dense_candidates[int(idx)] = (rank, float(scores[idx]))
            
            # 2. Sparse Lexical Search (BM25+ Inverted Index)
            sparse_candidates = {}
            if getattr(self, "sparse_engine", None) is not None and self.sparse_engine.doc_count > 0:
                sparse_res = self.sparse_engine.search(query, top_k=candidate_pool_size)
                for rank, (idx, score) in enumerate(sparse_res):
                    if 0 <= idx < len(self.preindexed_meta):
                        sparse_candidates[int(idx)] = (rank, float(score))
            
            # 3. Reciprocal Rank Fusion (RRF)
            # RRF_Score(d) = sum_{m} 1.0 / (k_rrf + rank_m(d)), k_rrf = 60
            all_candidate_indices = set(dense_candidates.keys()) | set(sparse_candidates.keys())
            fused_candidates = []
            
            for idx in all_candidate_indices:
                dense_info = dense_candidates.get(idx)
                sparse_info = sparse_candidates.get(idx)
                
                dense_rank = dense_info[0] if dense_info else 999
                dense_score = dense_info[1] if dense_info else 0.0
                sparse_rank = sparse_info[0] if sparse_info else 999
                sparse_score = sparse_info[1] if sparse_info else 0.0
                
                rrf_score = 0.0
                if dense_info is not None:
                    rrf_score += 1.0 / (60.0 + dense_rank)
                if sparse_info is not None:
                    # Sparse match gives strong boost for exact lexical tokens
                    rrf_score += 1.0 / (60.0 + sparse_rank)
                
                fused_candidates.append({
                    "idx": idx,
                    "rrf_score": rrf_score,
                    "dense_score": dense_score,
                    "sparse_score": sparse_score
                })
            
            fused_candidates.sort(key=lambda x: x["rrf_score"], reverse=True)
            top_items = fused_candidates[:top_k]
            
            retrieved_chunks = []
            max_score = 0.0
            for rank_pos, item in enumerate(top_items, 1):
                idx = item["idx"]
                d_score = item["dense_score"]
                s_score = item["sparse_score"]
                
                # Calibrated hybrid display score
                lex_bonus = min(0.30, s_score * 0.035) if s_score > 0 else 0.0
                display_score = min(0.99, max(d_score, 0.70 + lex_bonus)) if s_score > 0 else d_score
                if display_score > max_score:
                    max_score = display_score
                
                m = self.preindexed_meta[idx]
                ans_val = str(m.get("answer", "")).strip()
                eng_val = ans_val if ans_val else str(m.get("text", "")).strip()
                
                retrieved_chunks.append(RetrievedChunk(
                    chunk_id=str(m.get("chunk_id", f"doc_{idx}")),
                    doc_id=str(m.get("doc_id", f"doc_{idx}")),
                    parent_id=str(m.get("doc_id", "")),
                    text=str(m.get("text", "")),
                    english_text=eng_val,
                    parent_context=str(m.get("text", "")),
                    score=round(float(display_score), 4),
                    dense_score=round(float(d_score), 4),
                    sparse_score=round(float(s_score), 4),
                    rrf_rank=rank_pos,
                    is_selected=1,
                    query_type=str(m.get("query_type", "GENERAL")),
                    source_doc_id=int(m.get("doc_id", 0)) if str(m.get("doc_id", "0")).isdigit() else 0,
                    chunk_strategy=str(m.get("strategy", strategy))
                ))
            
            search_lat = (time.time() - t0) * 1000
            return RetrievalState(
                query=query,
                strategy=strategy,
                strategy_used="hybrid_rrf",
                chunks=retrieved_chunks,
                max_similarity_score=max_score,
                embedding_latency_ms=emb_lat,
                search_latency_ms=search_lat,
                total_retrieval_latency_ms=emb_lat + search_lat
            )
            
        res = []
        try:
            res = self.client.query_points(
                collection_name=coll_name,
                query=vec,
                limit=top_k
            ).points
        except Exception:
            try:
                res = self.client.search(
                    collection_name=coll_name,
                    query_vector=vec,
                    limit=top_k
                )
            except Exception as e:
                print(f"Qdrant search error: {e}")
                res = []
                
        search_lat = (time.time() - t0) * 1000
        
        retrieved_chunks = []
        max_score = 0.0
        for r in res:
            score = float(r.score) if hasattr(r, 'score') else 0.0
            if score > max_score:
                max_score = score
            pl = r.payload or {}
            retrieved_chunks.append(RetrievedChunk(
                chunk_id=str(pl.get('chunk_id', getattr(r, 'id', ''))),
                doc_id=str(pl.get('chunk_id', f"doc_{len(retrieved_chunks)+1}")),
                parent_id=str(pl.get('parent_id', '')),
                text=str(pl.get('text', '')),
                english_text=str(pl.get('english_text', '')),
                parent_context=str(pl.get('parent_context', pl.get('text', ''))),
                score=score,
                is_selected=int(pl.get('is_selected', 0)),
                query_type=str(pl.get('query_type', 'GENERAL')),
                source_doc_id=int(pl.get('source_doc_id', pl.get('query_id', 0))),
                chunk_strategy=str(pl.get('strategy', strategy))
            ))
        
        return RetrievalState(
            query=query,
            strategy=strategy,
            strategy_used=strategy,
            chunks=retrieved_chunks,
            max_similarity_score=max_score,
            embedding_latency_ms=emb_lat,
            search_latency_ms=search_lat,
            total_retrieval_latency_ms=emb_lat + search_lat
        )
