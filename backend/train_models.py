import os
import sys
import json
import time
from pathlib import Path
from typing import List, Dict

def train_indic_rag_models(
    num_samples: int = 500,
    epochs: int = 2,
    batch_size: int = 16,
    output_dir: str = "models/fine_tuned_indic_embed"
):
    """
    Fine-tunes a Domain-Specific Contrastive Bi-Encoder (MultipleNegativesRankingLoss)
    on the ai4bharat/MSMARCO-XI Gujarati & Indic dataset.
    """
    print("=" * 65)
    print("STEP 1: PREPARING MSMARCO-XI INDIC TRAINING CORPUS")
    print("=" * 65)
    
    base_dir = Path(__file__).resolve().parent.parent
    data_path = base_dir / "data" / "msmarco_sampled_guj.json"
    
    if not data_path.exists():
        print(f"Loading/extracting MSMARCO Gujarati dataset...")
        from backend.dataset_loader import MSMARCODatasetLoader
        loader = MSMARCODatasetLoader()
        raw_data = loader.load_or_create_subsample()
    else:
        with open(data_path, "r", encoding="utf-8") as f:
            raw_data = json.load(f)
            
    print(f"Loaded {len(raw_data)} MSMARCO-XI Indic QA pairs from dataset.")
    train_subset = raw_data[:num_samples]
    
    out_path = Path(output_dir)
    out_path.mkdir(parents=True, exist_ok=True)
    
    try:
        import torch
        from sentence_transformers import SentenceTransformer, InputExample, losses
        from torch.utils.data import DataLoader
        
        cuda_avail = torch.cuda.is_available()
        device = "cuda" if cuda_avail else "cpu"
        print(f"PyTorch Version: {torch.__version__}")
        print(f"CUDA Available: {cuda_avail}")
        print(f"Training on Device: {device.upper()}")
        if not cuda_avail:
            print("Note: Running on CPU. (To enable NVIDIA GPU acceleration, run: pip install torch --index-url https://download.pytorch.org/whl/cu121)")
            
        print("\n" + "=" * 65)
        print("STEP 2: EXTRACTING POSITIVE (QUERY, PASSAGE) PAIRS")
        print("=" * 65)
        
        model_name = "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"
        print(f"Loading Base Multilingual Backbone: {model_name}")
        model = SentenceTransformer(model_name, device=device)
        
        train_examples = []
        for item in train_subset:
            q = str(item.get("query", "")).strip()
            if not q:
                continue
                
            passages = item.get("passages", [])
            pos_text = ""
            
            # Find positive/selected passage or use top passage
            for p in passages:
                if isinstance(p, dict) and p.get("is_selected", 0) == 1:
                    pos_text = str(p.get("text", "")).strip()
                    break
            
            if not pos_text and len(passages) > 0 and isinstance(passages[0], dict):
                pos_text = str(passages[0].get("text", "")).strip()
                
            if q and pos_text and len(pos_text) > 10:
                train_examples.append(InputExample(texts=[q, pos_text]))
                
        print(f"Successfully constructed {len(train_examples)} Contrastive (Query, Positive Passage) Training Pairs.")
        
        if len(train_examples) == 0:
            print("Warning: No valid training pairs found in sample.")
            return {"status": "ERROR", "message": "No training pairs found."}
            
        train_dataloader = DataLoader(train_examples, shuffle=True, batch_size=batch_size)
        train_loss = losses.MultipleNegativesRankingLoss(model=model)
        
        print(f"\nBeginning Contrastive Fine-Tuning for {epochs} Epochs on {len(train_examples)} pairs...")
        t0 = time.time()
        model.fit(
            train_objectives=[(train_dataloader, train_loss)],
            epochs=epochs,
            warmup_steps=max(1, int(len(train_dataloader) * 0.1)),
            show_progress_bar=True
        )
        train_time = time.time() - t0
        print(f"\nFine-Tuning Completed in {train_time:.1f}s.")
        
        # Save Fine-Tuned Model Weights
        model.save(str(out_path))
        print(f"Fine-Tuned Model Weights saved to: {out_path.resolve()}")
        
        meta = {
            "status": "SUCCESS",
            "base_model": model_name,
            "dataset": "ai4bharat/MSMARCO-XI",
            "samples_trained": len(train_examples),
            "epochs": epochs,
            "batch_size": batch_size,
            "training_time_sec": round(train_time, 2),
            "loss_function": "MultipleNegativesRankingLoss",
            "device": device,
            "output_dir": str(out_path.resolve())
        }
        with open(out_path / "training_meta.json", "w", encoding="utf-8") as f:
            json.dump(meta, f, indent=2)
            
        print("\n" + "=" * 65)
        print("STEP 3: FINE-TUNING SUMMARY & CHECKPOINT READY")
        print("=" * 65)
        print(f"Saved checkpoint to: {out_path.resolve()}")
        return meta
        
    except Exception as e:
        print(f"Training Exception: {e}")
        return {"status": "ERROR", "message": str(e)}

if __name__ == "__main__":
    train_indic_rag_models(num_samples=300, epochs=2, batch_size=16)
