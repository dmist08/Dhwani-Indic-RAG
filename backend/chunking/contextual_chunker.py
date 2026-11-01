from typing import List, Dict, Any
from .semantic_chunker import SemanticChunker

class ContextualChunker:
    def __init__(self):
        self.semantic_splitter = SemanticChunker(max_chunk_words=100)

    def chunk_text(self, text: str, metadata: Dict[str, Any] = None) -> List[Dict[str, Any]]:
        base_chunks = self.semantic_splitter.chunk_text(text, metadata)
        q_type = (metadata or {}).get('query_type', 'માહિતી')
        parent_title = (metadata or {}).get('title', '')
        
        for chunk in base_chunks:
            chunk['strategy'] = 'contextual'
            context_prefix = f'આ સંદર્ભ {q_type} સંબંધિત છે. '
            if parent_title:
                context_prefix += f'વિષય: {parent_title}. '
            chunk['text'] = context_prefix + chunk['text']
            chunk['parent_context'] = text
            
        return base_chunks
