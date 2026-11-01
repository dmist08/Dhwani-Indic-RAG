import sys
sys.stdout.reconfigure(encoding='utf-8')
import json
import time
from typing import List, Dict, Any
from .dataset_loader import MSMARCODatasetLoader
from .vector_store import VectorStoreManager
from .schemas import AblationMetrics, LanguageCode
from .config import settings

def run_ablation(n_index_docs: int = 20, n_test_queries: int = 10):
    print('============================================================')
    print('PHASE 2 - CHUNKING & RETRIEVAL ABLATION EXPERIMENT')
    print('============================================================')
    
    loader = MSMARCODatasetLoader(subsample_size=1000)
    data = loader.load_or_create_subsample()
    
    vs_mgr = VectorStoreManager(in_memory=True)
    strategies = ['fixed_overlap', 'semantic', 'metadata_aware', 'parent_child', 'contextual']
    
    for strat in strategies:
        print(f'Indexing {n_index_docs} docs into in-memory Qdrant ({strat})...')
        vs_mgr.index_dataset(data, strategy=strat, max_docs=n_index_docs)
    
    test_set = [d for d in data if any(p.get('is_selected', 0) == 1 for p in d.get('passages', []))][:n_test_queries]
    if not test_set:
        test_set = data[:n_test_queries]
        
    results = []
    for strat in strategies:
        print(f'Evaluating strategy: {strat}...')
        precisions = []
        recalls = []
        ranks = []
        latencies = []
        
        for doc in test_set:
            q_text = doc['query']
            q_id = doc['query_id']
            
            t0 = time.time()
            ret_state = vs_mgr.search(q_text, strategy=strat, top_k=4)
            lat = (time.time() - t0) * 1000
            latencies.append(lat)
            
            hits_s = [c.is_selected == 1 or c.source_doc_id == q_id for c in ret_state.chunks]
            precisions.append(sum(hits_s) / max(1, len(hits_s)))
            recalls.append(1.0 if any(hits_s) else 0.0)
            
            rank = 0.0
            for r_i, h in enumerate(hits_s):
                if h:
                    rank = 1.0 / (r_i + 1)
                    break
            ranks.append(rank)
            
        avg_p = sum(precisions) / max(1, len(precisions))
        avg_r = sum(recalls) / max(1, len(recalls))
        mrr = sum(ranks) / max(1, len(ranks))
        avg_lat = sum(latencies) / max(1, len(latencies))
        
        results.append(AblationMetrics(
            strategy=strat,
            precision_at_k=round(avg_p, 4),
            recall_at_k=round(avg_r, 4),
            mrr=round(mrr, 4),
            avg_retrieval_latency_ms=round(avg_lat, 2),
            sample_count=len(test_set)
        ))
        
    results_dict = [q.model_dump() for q in results]
    report_file = settings.DATA_DIR / 'ablation_results.json'
    with open(report_file, 'w', encoding='utf-8') as f_report:
        json.dump(results_dict, f_report, indent=2)
        
    print('\n============================================================')
    print('ABLATION RESULTS SUMMARY (RAG Indic MSMARCO-XI)')
    print('============================================================')
    for r in results:
        print(f'{r.strategy:18} | P@4: {r.precision_at_k:.4f} | R@4: {r.recall_at_k:.4f} | MRR: {r.mrr:.4f} | Latency: {r.avg_retrieval_latency_ms:.2f} ms')
    print('============================================================\n')
    return results_dict

if __name__ == '__main__':
    run_ablation(n_index_docs=20, n_test_queries=10)
