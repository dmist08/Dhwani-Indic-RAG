from typing import List, Dict, Any
from .semantic_chunker import SemanticChunker

class MetadataAwareChunker:
    def __init__(self):
        self.semantic_splitter = SemanticChunker(max_chunk_words=100)

    def chunk_text(self, text: str, metadata: Dict[str, Any] = None) -> List[Dict[str, Any]]:
        base_chunks = self.semantic_splitter.chunk_text(text, metadata)
        for chunk in base_chunks:
            chunk['strategy'] = 'metadata_aware'
            q_type = chunk.get('query_type', 'GENERAL')
            lang = chunk.get('language', 'gujarati')
            chunk['meta_header'] = f'[{lang.upper()} | {q_type}]'
        return base_chunks
