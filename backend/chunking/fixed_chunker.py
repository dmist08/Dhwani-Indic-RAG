import re
from typing import List, Dict, Any

class FixedSizeChunker:
    def __init__(self, chunk_size: int = 250, chunk_overlap: int = 40):
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap

    def chunk_text(self, text: str, metadata: Dict[str, Any] = None) -> List[Dict[str, Any]]:
        text = text.strip()
        if not text:
            return []
        
        words = text.split()
        if len(words) <= self.chunk_size:
            return [{
                'text': text,
                'parent_context': text,
                'strategy': 'fixed_overlap',
                **(metadata or {})
            }]

        chunks = []
        start = 0
        step = max(1, self.chunk_size - self.chunk_overlap)
        
        while start < len(words):
            end = min(len(words), start + self.chunk_size)
            chunk_words = words[start:end]
            chunk_str = ' '.join(chunk_words)
            chunks.append({
                'text': chunk_str,
                'parent_context': text,
                'strategy': 'fixed_overlap',
                **(metadata or {})
            })
            if end >= len(words):
                break
            start += step
            
        return chunks
