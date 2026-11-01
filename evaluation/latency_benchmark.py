import sys
sys.stdout.reconfigure(encoding='utf-8')
import time
import json
import numpy as np
from typing import List, Dict, Any
from .dataset_loader import MSMARCODatasetLoader
from .pipeline import VoiceRAGPipeline
from .schemas import QueryInput, LanguageCode, ChunkingStrategy, LatencyPercentiles
from .config import settings

def run_latency_benchmark(num_queries: int = 15):
    print('============================================================')
    print('PHASE 3: PIPELINE LATENCY BENCHMARK (P50 / P70 / P100)')
    print('============================================================')
    
    loader = MSMARCODatasetLoader()
    data = loader.load_or_create_subsample()
    
    pipeline = VoiceRAGPipeline()
    
    print('Running pipeline warm-up...')
    warmup_q = QueryInput(query_text='ગુજરાતની રાજધાની કઈ છે?', language=LanguageCode.GUJARATI)
    _ = pipeline.run_text_query(warmup_q)
    
    test_queries = [d['query'] for d in data[:num_queries]]
    print(f'Benchmarking {len(test_queries)} queries across pipeline stages...\n')
    
    records = []
    for idx, q_text in enumerate(test_queries):
        q_inp = QueryInput(
            query_text=q_text,
            language=LanguageCode.GUJARATI,
            chunking_strategy=ChunkingStrategy.ENSEMBLE,
            top_k=4
        )
        resp = pipeline.run_text_query(q_inp)
        lat = resp.stage_latencies
        records.append({
            'query_idx': idx,
            'classification_ms': lat.classification_ms,
            'embedding_ms': lat.embedding_ms,
            'vector_search_ms': lat.vector_search_ms,
            'retrieval_total_ms': lat.retrieval_total_ms,
            'grounding_check_ms': lat.grounding_check_ms,
            'ttft_ms': lat.ttft_ms,
            'generation_total_ms': lat.generation_total_ms,
            'pipeline_total_ms': lat.pipeline_total_ms
        })
        print(f'Query {idx+1}/{len(test_queries)}: Embed={lat.embedding_ms:.1f}ms | Search={lat.vector_search_ms:.1f}ms | TTFT={lat.ttft_ms:.1f}ms | Total={lat.pipeline_total_ms:.1f}ms')
        
    def get_percentiles(arr: List[float], name: str) -> LatencyPercentiles:
        a = np.array(arr)
        return LatencyPercentiles(
            metric_name=name,
            p50_ms=round(float(np.percentile(a, 50)), 2),
            p70_ms=round(float(np.percentile(a, 70)), 2),
            p100_ms=round(float(np.percentile(a, 100)), 2),
            sample_size=len(arr)
        )
        
    metrics = [
        get_percentiles([r['embedding_ms'] for r in records], 'Embedding (Multilingual Dense)'),
        get_percentiles([r['vector_search_ms'] for r in records], 'Vector Search (Qdrant HNSW)'),
        get_percentiles([r['retrieval_total_ms'] for r in records], 'Retrieval Stage Total'),
        get_percentiles([r['ttft_ms'] for r in records], 'Time To First Token (TTFT)'),
        get_percentiles([r['pipeline_total_ms'] for r in records], 'End-to-End Pipeline Latency')
    ]
    
    out_file = settings.DATA_DIR / 'latency_benchmark_results.json'
    with open(out_file, 'w', encoding='utf-8') as f:
        json.dump([m.model_dump() for m in metrics], f, indent=2)
        
    print('\n============================================================')
    print('LATENCY BENCHMARK RESULTS (P50 / P70 / P100)')
    print('============================================================')
    for m in metrics:
        print(f'{m.metric_name:35} | P50: {m.p50_ms:6.2f}ms | P70: {m.p70_ms:6.2f}ms | P100: {m.p100_ms:6.2f}ms')
    print('============================================================\n')
    return metrics

if __name__ == '__main__':
    run_latency_benchmark(num_queries=15)
