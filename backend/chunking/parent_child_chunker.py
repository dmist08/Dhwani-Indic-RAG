import re
from typing import List, Dict, Any

class ParentChildChunker:
    def __init__(self, child_window_words: int = 50, child_overlap_words: int = 15):
        self.child_window = child_window_words
        self.child_overlap = child_overlap_words

    def chunk_text(self, text: str, metadata: Dict[str, Any] = None) -> List[Dict[str, Any]]:
        text = text.strip()
        if not text:
            return []
        
        parent_id = (metadata or {}).get('parent_id', '')
        words = text.split()
        
        if len(words) <= self.child_window:
            return [{
                'text': text,
                'parent_context': text,
                'parent_id': parent_id,
                'strategy': 'parent_child',
                **(metadata or {})
            }]

        chunks = []
        start = 0
        step = max(1, self.child_window - self.child_overlap)
        child_idx = 0

        while start < len(words):
            end = min(len(words), start + self.child_window)
            child_text = ' '.join(words[start:end])
            chunks.append({
                'text': child_text,
                'parent_context': text,
                'parent_id': parent_id,
                'child_index': child_idx,
                'strategy': 'parent_child',
                **(metadata or {})
            })
            child_idx += 1
            if end >= len(words):
                break
            start += step

        return chunks
