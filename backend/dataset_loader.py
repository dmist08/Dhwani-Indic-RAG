import os
import json
from pathlib import Path
from typing import List, Dict, Any, Optional
import pyarrow.parquet as pq
from huggingface_hub import hf_hub_download
from .config import settings

class MSMARCODatasetLoader:
    def __init__(self, subsample_size: int = 3000):
        self.subsample_size = subsample_size
        self.cache_file = settings.DATA_DIR / "msmarco_sampled_guj.json"
        
    def load_or_create_subsample(self, force_refresh: bool = False) -> List[Dict[str, Any]]:
        if not force_refresh and self.cache_file.exists():
            print(f"Loading cached MSMARCO Gujarati subsample from {self.cache_file}...")
            with open(self.cache_file, "r", encoding="utf-8") as f:
                data = json.load(f)
            print(f"Loaded {len(data)} queries from cache.")
            return data

        print("Extracting representative subsample from validation/gujval.parquet...")
        parquet_path = hf_hub_download(
            repo_id="ai4bharat/MSMARCO-XI",
            filename="validation/gujval.parquet",
            repo_type="dataset"
        )
        
        pf = pq.ParquetFile(parquet_path)
        table = pf.read_row_group(0)
        df = table.to_pandas()
        
        query_types = df["query_type"].unique()
        print(f"Found query types: {query_types}")
        
        sampled_rows = []
        target_per_type = max(100, self.subsample_size // len(query_types))
        
        for q_type in query_types:
            type_df = df[df['query_type'] == q_type]
            count = min(len(type_df), target_per_type)
            sampled_rows.append(type_df.sample(n=count, random_state=42))
            
        import pandas as pd
        combined_df = pd.concat(sampled_rows).sample(frac=1.0, random_state=42).head(self.subsample_size)
        
        dataset = []
        for idx, row in combined_df.iterrows():
            passages_obj = row.get("passages", {})
            translated_passages = passages_obj.get("Translated_passages", []) if isinstance(passages_obj, dict) else []
            english_passages = passages_obj.get("English_passages", []) if isinstance(passages_obj, dict) else []
            is_selected = passages_obj.get("is_selected", []) if isinstance(passages_obj, dict) else []
            
            passages_list = []
            for p_idx, text in enumerate(translated_passages):
                sel = is_selected[p_idx] if p_idx < len(is_selected) else 0
                eng_text = english_passages[p_idx] if p_idx < len(english_passages) else ""
                passages_list.append({
                    "passage_id": str(row.get('query_id')) + '_' + str(p_idx),
                    "text": str(text),
                    "english_text": str(eng_text),
                    "is_selected": int(sel)
                })
            
            dataset.append({
                "query_id": int(row.get("query_id")),
                "query": str(row.get("query")),
                "answer": str(row.get("Answer", "")),
                "query_type": str(row.get("query_type", "GENERAL")),
                "eng_query": str(row.get("Eng_Query", "")),
                "eng_answer": str(row.get("Eng_Answer", "")),
                "passages": passages_list
            })
            
        with open(self.cache_file, "w", encoding="utf-8") as f:
            json.dump(passages_list, f, ensure_ascii=False, indent=2)
        with open(self.cache_file, "w", encoding="utf-8") as f:
            json.dump(dataset, f, ensure_ascii=False, indent=2)
            
        print(f"Successfully prepared and cached {len(dataset)} representative queries with passages to {self.cache_file}")
        return dataset
